'use client'
import React, { useState } from 'react';
import ResultGrid from './ResultGrid';
import InstructionBox from './InstructionBox';
import { FormControlLabel, Switch } from '@mui/material';
import './ResultPage.css';  // Make sure to import the CSS
import DataGridContainer from './DataGridContainer';

const ResultContainer: React.FC = () => {
  const [showInstruction, setShowInstruction] = useState(false);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowInstruction(event.target.checked);
  };

  return (
    <div className="result-page-container">
      {/* Header */}
      <div className="header">
        <h1>Literature Paper Results</h1>
      </div>

      {/* Instruction Box Toggle */}
      <div className="instruction-box-toggle">
        <FormControlLabel
          control={
            <Switch
              checked={showInstruction}
              onChange={handleSwitchChange}
              color="primary"
            />
          }
          label="Instruction Box"
        />
      </div>

      {/* Container for DataGrid and InstructionBox */}
      <div className="grid-instruction-container">
        {/* Data Grid */}
        <DataGridContainer showInstruction={showInstruction} />
      </div>
    </div>
  );
};

export default ResultContainer;
