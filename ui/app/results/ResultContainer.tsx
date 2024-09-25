// ResultContainer.tsx
import React from 'react';
import ResultGrid from './ResultGrid';  // Assuming you have a ResultGrid component

const ResultContainer: React.FC = () => {
  return (
    <div className="result-container">
      <ResultGrid />
    </div>
  );
};

export default ResultContainer;
