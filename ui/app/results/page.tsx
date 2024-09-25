// ResultPage.tsx
import React from 'react';
import ResultContainer from './ResultContainer';
import './ResultPage.css';  // Import the new integrated CSS file

const ResultPage: React.FC = () => {
  return (
    <div className="result-page-container">
      <ResultContainer />
    </div>
  );
};

export default ResultPage;
