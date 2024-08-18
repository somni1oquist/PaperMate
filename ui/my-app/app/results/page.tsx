// app/results/page.tsx
import React from 'react';
import Header from '../components/Header'; // Adjust the path if necessary
import ResultsForm from './ResultItem';

const ResultsPage: React.FC = () => {
  return (
    <div className="papermate-container">
      <Header />
      <main>
        <ResultsForm/>
      </main>
    </div>
  );
};

export default ResultsPage;
