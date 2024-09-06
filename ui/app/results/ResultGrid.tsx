import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowsProp, GridToolbar } from '@mui/x-data-grid';
import { Paper, Switch, FormControlLabel, Box } from '@mui/material';
import InstructionBox from './InstructionBox';

interface Result {
  title: string;
  abstract: string;
  author: string;
  publication: string;
  publish_date: string;
  relevance: number | null;
  synopsis: string;
}

// Function to truncate text
const truncateText = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Define grid columns
const genColDefs = (expandedRowId: number | null): GridColDef[] => {
  const resultKeys: (keyof Result)[] = [
    'title',
    'abstract',
    'author',
    'publication',
    'publish_date',
    'relevance',
    'synopsis'
  ];

  return resultKeys.map((key) => {
    const baseColumn: GridColDef = {
      field: key,
      headerName: key.charAt(0).toUpperCase() + key.slice(1),
      flex: 1,  // Increase the width if needed
      sortable: true,
      renderCell: (params) => {
        const isExpanded = expandedRowId === params.id;
        const text = params.value as string;
        const displayedText = isExpanded ? text : truncateText(text, 50); // Adjust the truncate length as needed
        return (
          <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: 1.5 }}>
            {displayedText}
          </div>
        );
      },
    };

    if (key === 'abstract' || key === 'synopsis') {
      baseColumn.width = 300;
    }

    if (key === 'relevance') {
      baseColumn.type = '100';
    }

    return baseColumn;
  });
};

export default function ResultGrid() {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);  // State for switch
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null); // State to track expanded row

  useEffect(() => {
    // Check if data exists in sessionStorage
    const storedData = sessionStorage.getItem('papersData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setRows(parsedData);
      setLoading(false);
    } else {
      // Fetch data if necessary
      // ...
    }
  }, []);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDarkMode(event.target.checked);
  };

  const handleRowClick = (params: any) => {
    setExpandedRowId(params.id === expandedRowId ? null : params.id); // Toggle row expansion
  };

  return (
    <div style={{ display: 'flex', height: '62vh', width: '100%' }}>
      <Paper
        style={{
          width: darkMode ? '75%' : '100%',
          height: '100%',
          transition: 'width 0.3s',
          padding: '20px',
          paddingTop: '20px',
          position: 'relative',
          boxSizing: 'border-box',
          margin: '15px 0 30px',
        }}
      >
        <DataGrid
          rows={rows}
          columns={genColDefs(expandedRowId)}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          loading={loading}
          getRowId={(row) => row.doi}
          checkboxSelection
          disableRowSelectionOnClick
          disableColumnMenu={true}
          slots={{
            toolbar: GridToolbar,
          }}
          style={{
            maxHeight: 'calc(100vh - 50px)',
            width: '100%',
            lineHeight: '1.5',
          }}
          getRowHeight={(params) => params.id === expandedRowId ? 'auto' : 65} // Adjust row height based on expansion
          onRowClick={handleRowClick} // Handle row click to expand
        />
        <Box
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={handleSwitchChange}
                color="primary"
              />
            }
            label="Instruction Box"
          />
        </Box>
      </Paper>
      {darkMode && (
        <div style={{ width: '25%', padding: '15px' }}>
          <InstructionBox/>
        </div>
      )}
    </div>
  );
}
