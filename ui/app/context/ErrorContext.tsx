'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';

interface ErrorContextType {
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

// Create the ErrorContext with an initial value of undefined
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

// Create a provider component
export function ErrorProvider({ children }: ErrorProviderProps) {
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {!!error ? (  // Always pass valid children or undefined
          <Alert severity="error" variant="filled" onClose={handleClose}>
            {error}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ErrorContext.Provider>
  );
}

// Custom hook to use the ErrorContext
export function useError(p0: null) {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}