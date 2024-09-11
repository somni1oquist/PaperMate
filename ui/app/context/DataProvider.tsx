'use client'
import React, { createContext, useState, useContext, useRef, ReactNode } from 'react';

// Define a type for the dynamic data object
type Data = Record<string, any>;

// Define the context type
interface DataContextType {
  data: Data | null;
  setData: (obj: Data | null) => void;
}

// Create the context with a default value
const DataContext = createContext<DataContextType | undefined>(undefined);

// Create the provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Data | null>(null);

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the DataContext
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
