import React, { useEffect } from 'react';
import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { io } from 'socket.io-client';

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number },
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: 'text.secondary' }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function Progress() {
  const [progress, setProgress] = React.useState(0);
  const socket = io(process.env.NEXT_PUBLIC_API_URL, {
    transports: ['websocket']
  });
  useEffect(() => {
    socket.on('progress', (data: any) => {
      setProgress(data.progress);
    });

    return () => {
      socket.off('progress');
    };
	}, []);
  return <CircularProgressWithLabel value={progress} />;
}
