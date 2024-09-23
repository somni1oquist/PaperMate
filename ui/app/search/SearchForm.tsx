"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Grid from "@mui/material/Unstable_Grid2";
import {
  Switch,
  FormControlLabel,
  Paper,
  TextField,
  Button
} from "@mui/material";
import { searchPapers, getTotalCount } from "../actions";
import { useData } from "../context/DataContext";
import { useMessage } from "../context/MessageContext";
import Progress from "../components/Progress";

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
  const [geminiPro, setGeminiPro] = useState<boolean>(false);
  const [formData, setFormData] = useState<SearchFormData>({
    query: "",
    fromDate: getSixMonthsAgo(),  // Default from 6 months ago
    toDate: getCurrentMonth(),    // Default to current month
    title: "",
    author: "",
    publicationFile: null,
    advanced: true,
    chat: false,
    geminiPro: geminiPro,
  });
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { setMessage } = useMessage();
  const { data, setData } = useData();

  // Clear session when first mounted
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  useEffect(() => {
    setGeminiPro(formData.geminiPro);
    sessionStorage.setItem("switchModel", formData.geminiPro);
  }, [formData.geminiPro]);

  const isValidMonthYear = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const [year, month] = dateString.split("-").map(Number);
    return year >= 1900 && month >= 1 && month <= 12;
  };
  

  const isValidData = (): boolean => {

    const specialCharRegex = /^[a-zA-Z0-9\s\-_'"*]*$/;  // Allow letters, numbers, spaces, dashes, underscores, single and double quotes

    if (!formData.query.trim()) {
      setMessage("Query field is required.", "error");
      return false;
    }
    // Validate query field for special characters
    if (!specialCharRegex.test(formData.query)) {
      setMessage("Query field contains invalid special characters.", "error");
      return false;
    }
    
    if (formData.advanced) {
      if (
        !isValidMonthYear(formData.fromDate) ||
        !isValidMonthYear(formData.toDate)
      ) {
        setMessage("Please enter valid months and years in the format yyyy-mm.", "error");
        return false;
      }
      const fromDate = new Date(`${formData.fromDate}-01`).getTime();
      const toDate = new Date(`${formData.toDate}-01`).getTime();
      if (fromDate > toDate) {
        setMessage("From Date should not be later than To Date.", "error");
        return false;
      }
      if (formData.title.length > 100) {
        setMessage("Title should not exceed 100 characters.", "error");
        return false;
      }
      // Validate title field for special characters
      if (!specialCharRegex.test(formData.title)) {
        setMessage("Title contains invalid special characters.", "error");
        return false;
      }
      if (!/^[a-zA-Z\s]*$/.test(formData.author)) {
        setMessage("Author name should contain only letters and spaces.", "error");
        return false;
      }
    }
    return true;
  };

  // Build the search query
  const buildQuery = (): string => {
    const params = new URLSearchParams();
    params.append("query", formData.query);
    params.append("model", geminiPro);
    sessionStorage.setItem("switchModel", geminiPro);
    if (formData.advanced) {
      params.append("fromDate", formData.fromDate);
      params.append("toDate", formData.toDate);
      params.append("title", formData.title);
      params.append("author", formData.author);
    }
    return params.toString();
  }

  const handleSearch = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  
    if (!isValidData()) return;
    setMessage(null); // Clear any previous error messages

    // Set loading state
    setLoading(true);
  
    // Construct query
    const query = buildQuery();
    getTotalCount(query)
      .then((response) => {
        setResultCount(response.data.total_count);
      })
      .catch((error) => {
        console.error("Error:", error);
        setResultCount(0);
        setMessage(`${error.response.data.message}`, "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleProceedSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!isValidData()) return;
    setMessage(null); // Clear any previous error messages
    setLoading(true);

    // Construct query
    const query = buildQuery();
    // Reset data and chatId when proceeding
    setData(null);
    sessionStorage.removeItem("chatId");
    // Get search results
    searchPapers(query)
      .then((response) => {
        const papers = response.data;
        setData(papers);
        setMessage(`Found ${papers.length} papers.`, "success");
      })
      .catch((error) => {
        setMessage(`${error.response.data.message}`, "error");
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
      const allowedTypes = ["text/csv"];
      if (allowedTypes.includes(file.type)) {
        setFormData({ ...formData, publicationFile: file });
      } else {
        setMessage("Please upload a valid CSV file.", "error");
        setFormData({ ...formData, publicationFile: null });
      }

    }
  };
  
  return (
    <>
      {loading ? (
        <Progress eventName="search-progress" />
      ) : (
        <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
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
                inputProps={{ accept: ".csv" }} 
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
        </Paper>
      )}
    </>
  );
};

export default SearchForm;
