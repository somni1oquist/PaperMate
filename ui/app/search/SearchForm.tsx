'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Grid from '@mui/material/Unstable_Grid2';
import { Switch, FormControlLabel, Paper, TextField, Button } from '@mui/material';
import axios from 'axios';

interface SearchFormData {
  query: string;
  fromDate: string;
  toDate: string;
  title: string;
  author: string;
  advanced: boolean;
  chat: boolean;
}


const SearchForm: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<SearchFormData>({
    query: 'Crash',
    fromDate: '01-01-2021',
    toDate: '31-01-2022',
    title: '',
    author: '',
    advanced: true,
    chat: false,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Set parameters for query
    const params = new URLSearchParams();
    params.append('query', formData.query);
    if (!formData.advanced) {
      params.append('fromDate', '');
      params.append('toDate', '');
      params.append('title', '');
      params.append('author', '');
    }

    // Send request to the API
    const apiUrl = `http://127.0.0.1:5000/papers/search?${params.toString()}`;
    
    axios.get(apiUrl)
    .then((response) => {
      sessionStorage.setItem('papersData', JSON.stringify(response.data));
      router.push('/results');
    }).catch((error) => {
      console.error('Error:', error);
    }).finally(() => {
      alert(`Request completed.`);
    });
  };

  const handleInputChange = (key: keyof SearchFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [key]: event.target.value });
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>

          <Grid xs={12} sx={{
            display: 'flex',
            justifyContent: 'center',
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.advanced}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, advanced: !prev.advanced }))
                  }
                />
              }
              label="Advanced Search"
            />
            {/* <FormControlLabel
              control={
                <Switch
                  checked={formData.chat}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, chat: !prev.chat }))
                  }
                  disabled
                />
              }
              label="Enable Chat"
            /> */}
          </Grid>

          <Grid xs={12}>
            <TextField
              label="Query"
              fullWidth
              value={formData.query}
              onChange={handleInputChange('query')}
            />
          </Grid>

          {formData.advanced && (
            <>
              <Grid xs={6}>
                <TextField
                  label="From Date (dd-mm-yyyy)"
                  fullWidth
                  value={formData.fromDate}
                  onChange={handleInputChange('fromDate')}
                />
              </Grid>
              <Grid xs={6}>
                <TextField
                  label="To Date (dd-mm-yyyy)"
                  fullWidth
                  value={formData.toDate}
                  onChange={handleInputChange('toDate')}
                />
              </Grid>
              <Grid xs={6}>
                <TextField
                  label="Title"
                  fullWidth
                  value={formData.title}
                  onChange={handleInputChange('title')}
                />
              </Grid>
              <Grid xs={6}>
                <TextField
                  label="Author"
                  fullWidth
                  value={formData.author}
                  onChange={handleInputChange('author')}
                />
              </Grid>
            </>
          )}

          <Grid xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Search
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default SearchForm;