"use client"; // Add this at the top

import React, { useState, useEffect } from "react";
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

// Helper function to calculate the date 6 months ago
const getSixMonthsAgo = (): string => {
  const today = new Date();
  today.setMonth(today.getMonth() - 6); // Subtract 6 months
  return today.toISOString().slice(0, 7); // Return as "yyyy-mm"
};

// Helper function to get the current month and year
const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7); // Return as "yyyy-mm"
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
  const router = useRouter();

  /* States declaration */

  const [formData, setFormData] = useState<SearchFormData>({
    query: "Crash",
    fromDate: getSixMonthsAgo(),  // Default from 6 months ago
    toDate: getCurrentMonth(),    // Default to current month
    title: "",
    author: "",
    publicationFile: null,
    advanced: true,
    chat: false,
    geminiPro: false,
  });

  const [resultCount, setResultCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");

  // If you want to recalculate the "From Date" when "To Date" changes
  useEffect(() => {
    const sixMonthsAgo = getSixMonthsAgo();
    setFormData((prevData) => ({
      ...prevData,
      fromDate: sixMonthsAgo,
    }));
  }, [formData.toDate]);

  const isValidMonthYear = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const [year, month] = dateString.split("-").map(Number);
    return year >= 1900 && month >= 1 && month <= 12;
  };

  const isValidData = (): boolean => {
    if (!formData.query.trim()) {
      setError("Query field is required.");
      return false;
    }
    if (formData.advanced) {
      if (!isValidMonthYear(formData.fromDate) || !isValidMonthYear(formData.toDate)) {
        setError("Please enter valid months and years in the format yyyy-mm.");
        return false;
      }

      const fromDate = new Date(`${formData.fromDate}-01`).getTime();
      const toDate = new Date(`${formData.toDate}-01`).getTime();

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

  // Build the search query
  const buildQuery = (): string => {
    const params = new URLSearchParams();
    params.append("query", formData.query);
    if (formData.advanced) {
      params.append("fromDate", formData.fromDate);
      params.append("toDate", formData.toDate);
      params.append("title", formData.title);
      params.append("author", formData.author);
    }
    return params.toString();
  }

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    if (!isValidData()) return;
    setError("");
  
    // Put loading mask on
    setLoading(true);
  
    // Construct query
    const query = buildQuery();
    // Get search total count
    getTotalCount(query)
      .then((response) => {
        setResultCount(response.data.total_count);
      })
      .catch((error) => {
        console.error("Error:", error);
        setError("An error occurred while searching.");
        setResultCount(0);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleProceedSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidData()) return;
    setError("");
  
    // Put loading mask on
    setLoading(true);

    // Construct query
    const query = buildQuery();

    // Get search results
    searchPapers(query)
      .then((response) => {
        const papers = response.data;
        sessionStorage.setItem("papers", JSON.stringify(papers));
        router.push("/results");
      })
      .catch((error) => {
        setError("An error occurred while searching.");
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
      setFormData({ ...formData, publicationFile: event.target.files[0] });
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
          {error && <Alert severity="error" sx={{display: "flex", justifyContent: "center"}}>{error}</Alert>}
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
                  inputProps={{ accept: ".pdf,.doc,.docx" }} // Krish needs to update this line for validation
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
                      label="From Date (yyyy-mm)"
                      type="month"  // Changed input type to "month"
                      fullWidth
                      value={formData.fromDate}
                      onChange={handleInputChange("fromDate")}
                    />
                  </Grid>
                  <Grid xs={6}>
                    <TextField
                      label="To Date (yyyy-mm)"
                      type="month"  // Changed input type to "month"
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
              
              {resultCount !== null && (
                <Grid 
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 2
                }}
                >
                  <Paper elevation={1} 
                  sx={{
                    backgroundColor: "#f6f6f6",
                    padding: 2,
                    display: "flex",
                    alignItems: "center"
                  }}
                  >
                    <span style={{ marginRight: 5 }}>🔍</span>
                    <span>Total Results: {resultCount}</span>
                  </Paper>
                </Grid>
              )}

              <Grid xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                <Button type="submit" variant="contained" color="primary" onClick={handleSearch}>
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
            </Grid>
          </form>
        </Paper>
      )}
    </>
  );
};

export default SearchForm;
