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
import styles from "./page.module.css"; // Importing the CSS for styling

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
    advanced: false,
    chat: false,
    geminiPro: false,
  });
  const [resultCount, setResultCount] = useState<number | null>(null);
  const { loading, setLoading } = useLoading();
  const { setError } = useError(null);
  const { setData } = useData();

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
    if (formData.advanced) {
      params.append("fromDate", formData.fromDate);
      params.append("toDate", formData.toDate);
      params.append("title", formData.title);
      params.append("author", formData.author);
    }
    return params.toString();
  };

  const handleSearch = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!isValidData()) return;

    setError(""); // Clear previous errors
    setLoading(true);

    try {
      const query = buildQuery();
      const response = await getTotalCount(query);
      setResultCount(response.data.total_count);
    } catch (error) {
      setError("An error occurred while searching.");
      setResultCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!isValidData()) return;

    setError(null);
    setLoading(true);

    try {
      const query = buildQuery();
      const response = await searchPapers(query);
      setData(response.data);
    } catch (error) {
      setError("An error occurred while retrieving the search results.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: keyof SearchFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      <Paper elevation={3} className={styles.paper}>
        <h1 className={styles.header}>Literature Paper Search</h1>
        <Grid container spacing={2}>
          {/* Toggle switches */}
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

            {formData.advanced && !loading && (
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
            )}
          </Grid>

          {/* Query input */}
          <Grid xs={12} md={formData.advanced ? 6 : 12}>
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

          {/* Advanced fields */}
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
                      fullWidth
                      className={styles.dateField} // Applying dateField class
                      value={formData.fromDate}
                      onChange={handleInputChange("fromDate")}
                    />
                    <TextField
                      label="To Date"
                      type="month"
                      fullWidth
                      className={styles.dateField} // Applying dateField class
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

              {/* File upload */}
              <Grid xs={12} className={styles["fileInput-container"]}>
                {loading ? (
                  <Skeleton width="100%" height={56} />
                ) : (
                  <input
                    type="file"
                    accept=".csv"
                    className={styles.fileInput}
                    onChange={handleFileChange}
                  />
                )}
              </Grid>
            </>
          )}

          {/* Result count display */}
          {resultCount !== null && (
            <Grid xs={12} className={styles.resultCount}>
              <Paper elevation={0} className={styles.resultCountPaper}>
                <span className={styles.resultCountText}>Total Results: {resultCount}</span>
              </Paper>
            </Grid>
          )}


          {/* Action buttons with custom CSS */}
          <Grid xs={12} className={styles["button-container"]}>
            <div className={styles["button-group"]}>
              <Button
                type="submit"
                className={styles.button}
                onClick={handleSearch}
                disabled={loading}
              >
                Search
              </Button>

              <Button
                className={styles.button}
                onClick={handleProceedSubmit}
                disabled={loading}
              >
                Proceed
              </Button>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default SearchForm;
