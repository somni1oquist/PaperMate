import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  InputAdornment,
  IconButton,
  TextField,
  Box,
  Paper,
} from '@mui/material';
import { getChatHistory, giveInstruction } from '../actions';
import { useData } from '../context/DataProvider';
import { useError } from '../context/ErrorProvider';

const columns: GridColDef[] = [
  { field: 'instruction', headerName: 'Instruction', width: '100px', flex: 1 },
  { field: 'timestamp', headerName: 'Timestamp', width: 150, flex: 1 },

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
  const [rows, setRows] = React.useState<{ id: number; instruction: string ;timestamp: string}[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const { data, setData } = useData();
  const { setError } = useError(null);

  React.useEffect(() => {
    const sessionData = sessionStorage.getItem('chatHistory') as string;
    setRows(sessionData ? JSON.parse(sessionData) : []);
    if (!sessionData) {
      getChatHistory()
        .then((response) => {
          const chatHistory = response.data.map((instruction: string, index: number) => ({
            id: index,
            instruction,
            timestamp: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Perth' }), // Add timestamp in Perth timezone
          }));
          sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory));
          setRows(chatHistory);
        })
        .catch(error => setError(error.response.data.message));
    }
  }, []);

  const handleSend = () => {
    if (inputValue.trim()) {
      const timestamp = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Perth' });
      setRows((prevRows) => {
        const newRows = prevRows ? [...prevRows] : [];
        const newId = newRows.length ? newRows[newRows.length - 1].id + 1 : 0; // Generate new ID
        newRows.push({ id: newId, instruction: inputValue, timestamp }); // Insert new instruction at the end
        sessionStorage.setItem('chatHistory', JSON.stringify(newRows));
        return newRows;
      });
      setInputValue(''); // Clear the input field after updating
      giveInstruction(inputValue)
        .then((response) => {
          setData(response.data.papers);
        })
        .catch((error) => {
          setError(error.response.data.message);
        });
    }
  };

  return (
    <Paper 
    style={{
      width:  '100%' ,
      height: '100%',
      transition: 'width 0.3s',
      padding: '10px',
      paddingTop: '10px',
      position: 'relative',
      boxSizing: 'border-box',
      margin: '15px 0 30px',
    }}
  >
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
