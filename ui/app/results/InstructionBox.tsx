import * as React from 'react';
import { DataGrid, GridColDef, GridSelectionModel } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'instruction', headerName: 'Instruction', width: 130 },
];

export default function DataTable() {
  const [rows, setRows] = React.useState([]);
  const [selectedRows, setSelectedRows] = React.useState<GridSelectionModel>([]);
  const [inputValue, setInputValue] = React.useState('');

  const handleDelete = () => {
    setRows((prevRows) => {
      const newRows = prevRows.filter((row) => !selectedRows.includes(row.id));
      return newRows;
    });
    setSelectedRows([]); // Clear selection after deletion
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      setRows((prevRows) => {
        const newRows = [...prevRows];
        if (newRows.length > 0) {
          // Insert the new instruction at the top and move the original first row to second position
          newRows.unshift({ id: newRows.length + 1, instruction: inputValue });
        } else {
          // Add a new row if the array is empty
          newRows.push({ id: 1, instruction: inputValue });
        }
        return newRows;
      });
      setInputValue(''); // Clear the input field after updating
    }
  };

  return (
    <Paper style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        onSelectionModelChange={(newSelection) => {
          setSelectedRows(newSelection);
        }}
        sx={{ border: 0 }}
        getRowId={(row) => row.id} // Ensure that each row has a unique ID
      />
      <Stack direction="row" spacing={2} style={{ marginTop: 16 }}>
        <TextField
          label="Add Instruction"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          sx={{ marginTop: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleSend}>
          Send
        </Button>
      </Stack>
    </Paper>
  );
}
