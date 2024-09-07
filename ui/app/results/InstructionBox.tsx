import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  InputAdornment,
  IconButton,
  TextField,
  Box,
  Paper,
} from '@mui/material';
import { giveInstruction } from '../actions';
import { useData } from '../context/DataProvider';
import { useError } from '../context/ErrorProvider';

const columns: GridColDef[] = [
  { field: 'instruction', headerName: 'Instruction', width: '100px', flex: 1 },
];

// New InputContainer component with a white background
function InputContainer({ inputValue, onChange, onSubmit }: { inputValue: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onSubmit: () => void }) {
  return (
    <Box
      component="div"
      sx={{
        padding: 2,
        display: 'flex',
        gap: 2,
      }}
    >
      <TextField placeholder="Add Instruction"
        variant="standard"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={onSubmit}>
                ⏎
              </IconButton>
            </InputAdornment>
          ),
        }}
        value={inputValue}
        onChange={onChange}
        onKeyPress={(e: any) => {
          if (e.key === 'Enter') {
            onSubmit();
          }
        }}
        fullWidth
      />
    </Box>
  );
}

export default function InstructionBox() {
  const [rows, setRows] = React.useState<{ id: number; instruction: string }[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const { data, setData } = useData();
  const { setError } = useError(null);

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
      giveInstruction(inputValue)
        .then((response) => {
          setData(response.data.papers);
          setInputValue(''); // Clear the input field after updating
        })
        .catch((error) => {
          setError(error.response.data.message);
        });
    }
  };

  return (
    <Paper style={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id} // Ensure each row has a unique ID
        disableColumnSelector={true}
        hideFooter
      />
      <InputContainer
        inputValue={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onSubmit={handleSend}
      />
    </Paper>
  );
}
