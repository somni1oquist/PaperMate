"use client"; // Add this at the top

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Grid from "@mui/material/Unstable_Grid2";
import {
  Switch,
  FormControlLabel,
  Paper,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { searchPapers, getTotalCount } from "../actions";
import Loading from "../components/Loading";

interface SearchFormData {
  query: string;
  fromDate: string;
  toDate: string;
  title: string;
  author: string;
  publicationFile: File | null; // Field for uploaded file
  advanced: boolean;
  chat: boolean;
  geminiPro: boolean;
}

const SearchForm: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<SearchFormData>({
    query: "Crash",
    fromDate: "01-01-2021",
    toDate: "31-01-2022",
    title: "",
    author: "",
    publicationFile: null, // Initialize as null
    advanced: true,
    chat: false,
    geminiPro: false,
  });

  const [resultCount, setResultCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");

  const isValidDate = (dateString: string): boolean => {
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    if (!regex.test(dateString)) return false;

    const [day, month, year] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date &&
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year
    );
  };

  const isValidData = (): boolean => {
    if (!formData.query.trim()) {
      setError("Query field is required.");
      return false;
    }
    if (formData.advanced) {
      if (!isValidDate(formData.fromDate) || !isValidDate(formData.toDate)) {
        setError("Please enter valid dates in the format dd-mm-yyyy.");
        return false;
      }
      const fromDate = new Date(
        formData.fromDate.split("-").reverse().join("-")
      ).getTime();
      const toDate = new Date(
        formData.toDate.split("-").reverse().join("-")
      ).getTime();

      if (fromDate > toDate) {
        setError("From Date should not be later than To Date.");
        return false;
      }

      if (formData.title.length > 100) {
        setError("Title should not exceed 100 characters.");
        return false;
      }

      if (!/^[a-zA-Z\s]*$/.test(formData.author)) {
        setError("Author name should contain only letters and spaces.");
        return false;
      }
    }
    return true;
  };

  const handleSearchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidData()) return;
    setError("");

    setLoading(true);

    const params = new URLSearchParams();
    params.append("query", formData.query);
    if (formData.advanced) {
      params.append("fromDate", formData.fromDate);
      params.append("toDate", formData.toDate);
      params.append("title", formData.title);
      params.append("author", formData.author);
    }

    try {
      const response = await searchPapers(params.toString());
      sessionStorage.setItem("papersData", JSON.stringify(response.data));

      const countResponse = await getTotalCount(params.toString());
      setResultCount(countResponse.data.total_count);
    } catch (error) {
      console.error("Error:", error);
      setResultCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/results");
  };

  const handleInputChange =
    (key: keyof SearchFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [key]: event.target.value });
    };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFormData({ ...formData, publicationFile: event.target.files[0] });
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <form>
            <Grid container spacing={2}>
              <Grid
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
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
                  sx={{ marginRight: 2 }}
                />
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
              </Grid>

              <Grid xs={6}>
                <TextField
                  label="Query"
                  fullWidth
                  value={formData.query}
                  onChange={handleInputChange("query")}
                />
              </Grid>

              {/* File upload field */}
              <Grid xs={6}>
                <TextField
                  type="file"
                  inputProps={{ accept: ".pdf,.doc,.docx" }} // Accepting specific file formats
                  fullWidth
                  onChange={handleFileChange}
                  helperText={
                    formData.publicationFile
                      ? `Selected file: ${formData.publicationFile.name}`
                      : "Choose your file to filter publications"
                  }
                />
              </Grid>

              {formData.advanced && (
                <>
                  <Grid xs={6}>
                    <TextField
                      label="From Date (dd-mm-yyyy)"
                      fullWidth
                      value={formData.fromDate}
                      onChange={handleInputChange("fromDate")}
                    />
                  </Grid>
                  <Grid xs={6}>
                    <TextField
                      label="To Date (dd-mm-yyyy)"
                      fullWidth
                      value={formData.toDate}
                      onChange={handleInputChange("toDate")}
                    />
                  </Grid>
                  <Grid xs={6}>
                    <TextField
                      label="Title"
                      fullWidth
                      value={formData.title}
                      onChange={handleInputChange("title")}
                    />
                  </Grid>
                  <Grid xs={6}>
                    <TextField
                      label="Author"
                      fullWidth
                      value={formData.author}
                      onChange={handleInputChange("author")}
                    />
                  </Grid>
                </>
              )}

              <Grid xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={handleSearchSubmit}
                >
                  Search
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ marginLeft: 2 }}
                  onClick={handleProceedSubmit}
                >
                  Proceed
                </Button>
              </Grid>

              {resultCount !== null && (
                <Grid
                  xs={12}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 2,
                  }}
                >
                  <Paper sx={{ padding: 2, display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: 5 }}>🔍</span>
                    <span>Total Results: {resultCount}</span>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </form>
        </Paper>
      )}
    </>
  );
};

export default SearchForm;
