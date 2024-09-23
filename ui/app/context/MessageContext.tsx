'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';

type SeverityType = 'error' | 'warning' | 'info' | null;

interface MessageContextType {
  message: string | null;
  severity: SeverityType;
  setMessage: (message: string | null, severity?: SeverityType) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

interface MessageProviderProps {
  children: ReactNode;
}

// Create a provider component
export function MessageProvider({ children }: MessageProviderProps) {
  const [message, setMessageState] = useState<string | null>(null);
  const [severity, setSeverity] = useState<SeverityType>(null);

  const setMessage = (msg: string | null, severity: SeverityType = 'info') => {
    setMessageState(msg);
    setSeverity(severity);
  };

  const handleClose = () => {
    setMessage(null);
  };

  return (
    <MessageContext.Provider value={{ message, severity, setMessage }}>
      {children}
      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {!!message ? (
          <Alert
            severity={severity || 'info'}
            variant="filled"
            onClose={handleClose}
          >
            {message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </MessageContext.Provider>
  );
}

// Custom hook to use the MessageContext
export function useMessage() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}