import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

const Loading: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        Loading...
      </Typography>
    </Box>
  );
};

export default Loading;
