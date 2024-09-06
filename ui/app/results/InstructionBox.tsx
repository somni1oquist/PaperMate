import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

const columns: GridColDef[] = [
  { field: 'instruction', headerName: 'Instruction', width: 300 },
];

// New InputContainer component with a white background
function InputContainer({ inputValue, onChange, onSubmit }: { inputValue: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onSubmit: () => void }) {
  return (
    <Box
      component="div"
      sx={{
        backgroundColor: 'white', // White background
        padding: 2,
        borderRadius: 2,
        boxShadow: 1,
        display: 'flex',
        gap: 2,
      }}
    >
      <TextField
        label="Add Instruction"
        value={inputValue}
        onChange={onChange}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={onSubmit}>
        Send
      </Button>
    </Box>
  );
}

export default function InstructionBox() {
  const [rows, setRows] = React.useState<{ id: number; instruction: string }[]>([]);
  const [inputValue, setInputValue] = React.useState('');

  // Load rows from localStorage on component mount
  React.useEffect(() => {
    const savedRows = localStorage.getItem('instructions');
    if (savedRows) {
      setRows(JSON.parse(savedRows));
    }
  }, []);

  // Save rows to localStorage whenever rows state changes
  React.useEffect(() => {
    localStorage.setItem('instructions', JSON.stringify(rows));
  }, [rows]);

  const handleSend = () => {
    if (inputValue.trim()) {
      setRows((prevRows) => {
        const newRows = [...prevRows];
        const newId = newRows.length ? newRows[newRows.length - 1].id + 1 : 0; // Generate new ID
        newRows.push({ id: newId, instruction: inputValue }); // Insert new instruction at the end
        return newRows;
      });
      setInputValue(''); // Clear the input field after updating
    }
  };

  return (
    <Paper style={{ height: '50.5vh', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id} // Ensure each row has a unique ID
        sx={{ 
          border: 0,
          '& .MuiDataGrid-virtualScroller': {
            overflowX: 'hidden', // Hide horizontal scrollbar
          },
        }}
        hideFooterPagination // Remove the pagination bar
        pagination={false} // Disable pagination
      />
      <Stack direction="row" spacing={2} style={{ marginTop: 15 }}>
        <InputContainer
          inputValue={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onSubmit={handleSend}
        />
      </Stack>
    </Paper>
  );
}
