import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowsProp, GridToolbar } from '@mui/x-data-grid';
import { Paper, Switch, FormControlLabel, Box } from '@mui/material';
import InstructionBox from './InstructionBox';
import { useData } from '../context/DataContext';
import { useError } from '../context/ErrorContext';
import { useLoading } from '../context/LoadingContext';
import PaperDetail from './PaperDetail';
import './ResultPage.css';  // Import the CSS file

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
    } else {
      setRows([]);
    }
  }, [data]);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDarkMode(event.target.checked);
  };

  const handleRowClick = (params: any) => {
    setOpen(true);
    setSelectedRow(params.row);
  };

  return (
    <div className="result-grid-container">
      <Paper
        className={`result-grid-paper ${darkMode ? 'result-grid-dark' : 'result-grid-light'}`}
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
          className="data-grid-style"
          onRowClick={handleRowClick}
        />
        <Box className="result-grid-box">
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
        <div className="result-grid-instruction">
          <InstructionBox />
        </div>
      )}
    </div>
  );
}
