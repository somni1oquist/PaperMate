"use client";
import React, { useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import {
  Switch,
  Skeleton,
  FormControlLabel,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import { searchPapers, getTotalCount } from "../actions";
import { useData } from "../context/DataContext";
import { useError } from "../context/ErrorContext";
import { useLoading } from "../context/LoadingContext";
import styles from "./page.module.css";

const getSixMonthsAgo = (): string => {
  const today = new Date();
  today.setMonth(today.getMonth() - 6);
  return today.toISOString().slice(0, 7);
};

const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};

interface SearchFormData {
  query: string;
  fromDate: string;
  toDate: string;
  title: string;
  author: string;
  publicationFile: File | null;
  advanced: boolean;
  chat: boolean;
  geminiPro: boolean;
}

const SearchForm: React.FC = () => {
  const [formData, setFormData] = useState<SearchFormData>({
    query: "",
    fromDate: getSixMonthsAgo(),
    toDate: getCurrentMonth(),
    title: "",
    author: "",
    publicationFile: null,
    advanced: false, // Initially false for advanced search
    chat: false,
    geminiPro: false,
  });
  const [resultCount, setResultCount] = useState<number | null>(null);
  const { loading, setLoading } = useLoading();
  const { setError } = useError(null);
  const { data, setData } = useData();

  const isValidData = (): boolean => {
    if (!formData.query.trim()) {
      setError("Query field is required.");
      return false;
    }
    return true;
  };

  const buildQuery = (): string => {
    const params = new URLSearchParams();
    params.append("query", formData.query);
    params.append("model", String(formData.geminiPro));
    return params.toString();
  };

  const handleSearch = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!isValidData()) return;

    setLoading(true);
    const query = buildQuery();
    getTotalCount(query)
      .then((response) => {
        setResultCount(response.data.total_count);
      })
      .catch(() => {
        setError("An error occurred while searching.");
        setResultCount(0);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleProceedSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!isValidData()) return;

    setLoading(true);
    const query = buildQuery();
    searchPapers(query)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        setError(error.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleInputChange =
    (key: keyof SearchFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [key]: event.target.value });
    };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFormData({ ...formData, publicationFile: file });
    }
  };

  return (
    <>
      {/* Search Form */}
      <Paper elevation={3} className={styles.paper}>
        <h1 className={styles.header}>Literature Paper Search</h1>
        <Grid container spacing={2}>
          {/* Flex container for centering switches */}
          <Grid xs={12} className={styles["switch-container"]}>
            {loading ? (
              <Skeleton width={200} height={40} />
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.advanced}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        advanced: !prev.advanced,
                      }))
                    }
                  />
                }
                label="Advanced Search"
              />
            )}

            {formData.advanced && (
              loading ? (
                <Skeleton width={200} height={40} />
              ) : (
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.geminiPro}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          geminiPro: !prev.geminiPro,
                        }))
                      }
                    />
                  }
                  label="Gemini 1.5 Pro"
                />
              )
            )}
          </Grid>

          {/* Query Input Field - Centered when advanced search is off */}
          <Grid
            xs={12}
            md={formData.advanced ? 6 : 12} /* Full width if not advanced */
            className={formData.advanced ? "" : styles.centeredField} /* Center the query field if advanced search is off */
          >
            {loading ? (
              <Skeleton width="100%" height={56} />
            ) : (
              <TextField
                label="Query"
                fullWidth
                className={styles.textField}
                value={formData.query}
                onChange={handleInputChange("query")}
              />
            )}
          </Grid>

          {/* Date Fields, Title, Author and File Upload - Only when advanced search is on */}
          {formData.advanced && (
            <>
              <Grid xs={12} md={6} className={styles["date-container"]}>
                {loading ? (
                  <Skeleton width="100%" height={56} />
                ) : (
                  <>
                    <TextField
                      label="From Date"
                      type="month"
                      className={styles.dateField}
                      value={formData.fromDate}
                      onChange={handleInputChange("fromDate")}
                    />
                    <TextField
                      label="To Date"
                      type="month"
                      className={styles.dateField}
                      value={formData.toDate}
                      onChange={handleInputChange("toDate")}
                    />
                  </>
                )}
              </Grid>

              <Grid xs={12} md={6}>
                {loading ? (
                  <Skeleton width="100%" height={56} />
                ) : (
                  <TextField
                    label="Title"
                    fullWidth
                    className={styles.textField}
                    value={formData.title}
                    onChange={handleInputChange("title")}
                  />
                )}
              </Grid>

              <Grid xs={12} md={6}>
                {loading ? (
                  <Skeleton width="100%" height={56} />
                ) : (
                  <TextField
                    label="Author"
                    fullWidth
                    className={styles.textField}
                    value={formData.author}
                    onChange={handleInputChange("author")}
                  />
                )}
              </Grid>

              {/* File Upload Button (shown only when advanced search is active) */}
              <Grid xs={12}>
  {loading ? (
    <Skeleton width={200} height={40} />
  ) : (
    <div className={styles["fileInput-container"]}>
      <input
        id="upload-file"
        type="file"
        accept=".csv"
        className={styles.fileInput}
        onChange={handleFileChange}
        title="" /* Removes the "Choose file" label */
      />
    </div>
  )}
              </Grid>
            </>
          )}

          {/* Result Count Display */}
          {resultCount !== null && (
            <Grid xs={12} className={styles.resultCount}>
              {loading ? (
                <Skeleton width={300} height={50} />
              ) : (
                <Paper elevation={1} className={styles.resultCountPaper}>
                  <span style={{ marginRight: 5 }}>🔍</span>
                  <span>Total Results: {resultCount}</span>
                </Paper>
              )}
            </Grid>
          )}

          {/* Button Group */}
          <Grid xs={12} className={styles["button-container"]}>
            <div className={styles["button-group"]}>
              {loading ? (
                <Skeleton width={150} height={50} />
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  className={styles.button}
                  onClick={handleSearch}
                >
                  Search
                </Button>
              )}

              <div className={styles.divider}></div>

              {loading ? (
                <Skeleton width={150} height={50} />
              ) : (
                <Button
                  variant="contained"
                  className={styles.button}
                  onClick={handleProceedSubmit}
                >
                  Proceed
                </Button>
              )}
            </div>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default SearchForm;
