'use client';
import React, { useState } from 'react';
import HomePage from './home/page'; //Make sure the path is correct
import Search from './search/page';
import Results from './results/page';
import style from './page.module.css';

export default function Page() {
  const [showResults, setShowResults] = useState(false); // Status to manage whether to display results

  const handleProceedClick = () => {
    setShowResults(true); // Set to true to show the Results component
  };

  return (
    <div className={style.main}>
      {/* 显示 HomePage */}
      <div className={style['home-container']}>
        <HomePage />
      </div>

      {/* Display Search page*/}
      <div className={style['search-container']}>
        <Search onProceedClick={handleProceedClick} /> {/* Pass a function that handles the click*/}
      </div>

      {/* Display the Results page according to the showResults status */}
      {showResults && (
        <div className={style['result-container']}> {/* Make sure the class name is correct */}
          <Results />
        </div>
      )}
    </div>
  );
}
