import React, { useEffect } from 'react';
import ResultContainer from './ResultContainer';
import './ResultPage.css'; 

const ResultPage: React.FC = () => {
  return (
    <div className="result-page-wrapper">
      <ResultContainer />
    </div>
  );
};

export default ResultPage;
