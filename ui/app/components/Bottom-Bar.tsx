// bottom-bar.tsx
import React from 'react';
import Link from 'next/link';
import '../Bottom-Bar.css'; // Import the CSS file
import { useData } from '../context/DataContext';
import { CircularProgress, Typography, Box } from '@mui/material'; // Import necessary components

interface BottomBarProps {
  loading: boolean;
}

const BottomBar: React.FC<BottomBarProps> = ({ loading }) => {
  const { data } = useData();
  const resultsEnabled = data !== null;

  return (
    <div className="bottom-bar">
      {/* Conditionally display loading indicator or traffic light */}
      {loading ? (
        <div className="loading-container">
          <CircularProgress size={20} color="inherit" />
          <Typography variant="body2" sx={{ marginLeft: 1 }}>
            Loading...
          </Typography>
        </div>
      ) : (
        <div className="traffic-light">
          <div className="light red"></div>
          <div className="light yellow"></div>
          <div className="light green"></div>
        </div>
      )}

      {/* Navigation Links */}
      <Link href="/" className="bottom-bar-option">
        Home
      </Link>
      <Link href="/search" className="bottom-bar-option">
        Search
      </Link>

      {/* Conditionally disable the Results option */}
      <Link
        href={resultsEnabled ? "/results" : "#"}
        className={`bottom-bar-option ${resultsEnabled ? '' : 'disabled'}`}
      >
        Results
      </Link>
    </div>
  );
};

export default BottomBar;
