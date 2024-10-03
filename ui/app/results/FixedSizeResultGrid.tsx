'use client';
import React from 'react';
import ResultGrid from './ResultGrid';
import './FixedSizeResultGrid.css';  // Create a CSS file for fixed size

interface FixedSizeResultGridProps {
  showInstruction: boolean;
}

const FixedSizeResultGrid: React.FC<FixedSizeResultGridProps> = ({ showInstruction }) => {
  return (
    <div className="fixed-size-result-grid">
      <ResultGrid showInstruction={showInstruction} />
    </div>
  );
};

export default FixedSizeResultGrid;
