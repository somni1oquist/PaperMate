import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowsProp, GridToolbar } from '@mui/x-data-grid';
import { Paper, Switch, FormControlLabel, Box, Button } from '@mui/material';
import InstructionBox from './InstructionBox';
import { useData } from '../context/DataContext';
import { useError } from '../context/ErrorContext';
import { useLoading } from '../context/LoadingContext';
import { useRouter } from 'next/navigation';
import { searchPapers } from '../actions';
import PaperDetail from './PaperDetail';

// Function to truncate text
const truncateText = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Define grid columns
const genColDefs = (data: any[]): GridColDef[] => {
  if (!data || data.length === 0) return []; // Return an empty array if there's no data

  const resultKeys = Object.keys(data[0]);

  return resultKeys
    .filter((key) => key !== 'mutation')
    .map((key) => {
      const baseColumn: GridColDef = {
        field: key,
        headerName: key.charAt(0).toUpperCase() + key.slice(1),
        flex: 1,  // Increase the width if needed
        sortable: true,
      };

      return baseColumn;
    });
};

export default function ResultGrid() {
  const router = useRouter();
  const { setError } = useError(null);
  const { data, setData } = useData();
  const { loading } = useLoading();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [darkMode, setDarkMode] = useState(false);  // State for switch
  const [selectedRow, setSelectedRow] = useState<any | null>(null); // State for selected row
  const [open, setOpen] = useState<boolean | null>(false); // State for dialog

  useEffect(() => {
    if (Array.isArray(data)) {
      setRows(data);
      // If there is data, show the Results button by updating its display style
      document.getElementById("results-button")!.style.display = "block";
    } else {
      setRows([]);
    }
  }, [data]);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDarkMode(event.target.checked);
  };

  const handleRowClick = (params: any) => {
    // Open dialog when a row is clicked and set the selected row
    setOpen(true);
    setSelectedRow(params.row);
  };

  return (
    <div style={{ display: 'flex', height: '62vh', width: '100%' }}>
      <Paper
        style={{
          flex: darkMode ? '0 0 75%' : '1', // Use flex to control the size dynamically
          height: '100%',
          transition: 'flex 0.3s',
          padding: '20px',
          position: 'relative',
          boxSizing: 'border-box',
          margin: '15px 0 30px',
        }}
      >
        {open && <PaperDetail open={open} onClick={() => { setOpen(false); }} row={selectedRow} />}
        <DataGrid
          rows={rows}
          columns={genColDefs(data as any[])}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          loading={loading}
          slotProps={{
            loadingOverlay: {
              variant: 'skeleton',
              noRowsVariant: 'skeleton',
            },
          }}
          getRowId={(row) => row.doi}
          disableRowSelectionOnClick
          disableColumnMenu={true}
          slots={{
            toolbar: GridToolbar
          }}
          style={{
            maxHeight: 'calc(100vh - 50px)',
            width: '100%',
            lineHeight: '1.5',
          }}
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
        <div style={{ width: '300px', padding: '15px' }}> {/* Set a fixed width for the InstructionBox */}
          <InstructionBox />
        </div>
      )}
      <div id="results-button" style={{ display: 'none' }}> {/* Hidden by default */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/results')}
        >
          View Results
        </Button>
      </div>
    </div>
  );
}
