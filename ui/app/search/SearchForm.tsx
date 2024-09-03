"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Grid from "@mui/material/Unstable_Grid2";
import {
  Switch,
  FormControlLabel,
  Paper,
  TextField,
  Button,
  Autocomplete,
  Chip,
} from "@mui/material";
import { searchPapers } from "../actions";
import Loading from "../components/Loading";

interface SearchFormData {
  query: string;
  fromDate: string;
  toDate: string;
  title: string;
  author: string;
  publications: string[]; // Field for publications
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
    publications: [],
    advanced: true,
    chat: false,
    geminiPro: false,
  });

  const [resultCount, setResultCount] = useState<number | null>(null); // State for result count

  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    const params = new URLSearchParams();
    params.append("query", formData.query);
    if (!formData.advanced) {
      params.append("fromDate", "");
      params.append("toDate", "");
      params.append("title", "");
      params.append("author", "");
      params.append("publications", "");
    } else {
      params.append("publications", formData.publications.join(","));
    }

    searchPapers(params.toString())
      .then((response) => {
        sessionStorage.setItem("papersData", JSON.stringify(response.data));
        setResultCount(response.data.length); // Set the number of results
        router.push("/results");
      })
      .catch((error) => {
        console.error("Error:", error);
        setResultCount(0); // Set to 0 if there's an error
      })
      .finally(() => {
        setLoading(false);
        // alert(`Request completed.`);
      });
  };

  const handleInputChange =
    (key: keyof SearchFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [key]: event.target.value });
    };

  const handlePublicationChange = (event: any, value: string[]) => {
    setFormData({ ...formData, publications: value });
  };


  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
          <form onSubmit={handleSubmit}>
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
              <Grid xs={6}>
                <Autocomplete
                  multiple
                  options={[
                    "Accident Analysis and Prevention",
                    "Journal of Safety Research",
                    "Transportation Research Part F",
                    "Journal of Road Engineering",
                  ]} // Updated publication options
                  value={formData.publications}
                  onChange={handlePublicationChange}
                  renderTags={(value: string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Publication"
                      placeholder="Select journals"
                    />
                  )}
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
                <Button type="submit" variant="contained" color="primary">
                  Search
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ marginLeft: 2 }}
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
                  <Paper
                    sx={{ padding: 2, display: "flex", alignItems: "center" }}
                  >
                    <span style={{ marginRight: 5 }}>🔍</span>
                    <span>{resultCount} Results</span>
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
