'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';


export default function Export() {
  const router = useRouter();
  // Send POST request to export the data
  const handleExport = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiUrl = `${baseUrl}/papers/export`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.log(response);
        throw new Error(response.statusText);
      }
      const data = await response.blob();
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'papers.csv';
      a.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  }
  
  return (
    <Button variant="contained" color="primary" onClick={handleExport}>
      Export
    </Button>
  );
}