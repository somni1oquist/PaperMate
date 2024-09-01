'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import { exportPapers } from '../actions';

export default function Export() {
  const router = useRouter();
  // Send POST request to export the data
  const handleExport = () => {
    exportPapers()
      .then((response) => {
        const data = new Blob([response.data], { type: 'text/csv' });

        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'papers.csv';
        a.click();
        window.URL.revokeObjectURL(url);

      }).catch((error) => {
        alert('Error exporting data.');
      });
  }
  
  return (
    <Button variant="contained" color="primary" onClick={handleExport}>
      Export
    </Button>
  );
}