import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  InputAdornment,
  IconButton,
  TextField,
  Box,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button
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
  const [selectedInstruction, setSelectedInstruction] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
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
        const newId = newRows.length ? newRows[newRows.length - 1].id + 1 : 0;
        newRows.push({ id: newId, instruction: inputValue, timestamp });
        sessionStorage.setItem('chatHistory', JSON.stringify(newRows));
        return newRows;
      });
      setInputValue('');
      giveInstruction(inputValue)
        .then((response) => {
          setData(response.data.papers);
        })
        .catch((error) => {
          setError(error.response.data.message);
        });
    }
  };

  const handleRowClick = (params: any) => {
    setSelectedInstruction(params.row.instruction);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <Paper
      style={{
        width: '100%',
        height: '100%',
        padding: '20px',
        paddingTop: '20px',
        position: 'relative',
        boxSizing: 'border-box',
        margin: '15px 0 30px',
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        disableColumnSelector={true}
        hideFooter
        onRowClick={handleRowClick}
      />
      <InputContainer
        inputValue={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onSubmit={handleSend}
      />
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Instruction Details</DialogTitle>
        <DialogContent>
          <Box>{selectedInstruction}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}