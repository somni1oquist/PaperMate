'use client';
import React from 'react';
import FixedSizeResultGrid from './FixedSizeResultGrid';
import InstructionBox from './InstructionBox';
import './DataGridContainer.css'; // Import the CSS file

interface DataGridContainerProps {
  showInstruction: boolean;
}

const DataGridContainer: React.FC<DataGridContainerProps> = ({ showInstruction }) => {
  return (
    <div className={`data-grid-subcontainer ${!showInstruction ? 'center-grid' : ''}`}>
      <FixedSizeResultGrid showInstruction={showInstruction} />
      {showInstruction && (
        <div className="instruction-box">
          <InstructionBox />
        </div>
      )}
    </div>
  );
};

export default DataGridContainer;
