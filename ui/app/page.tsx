'use client';
import React, { useState, useRef, useEffect  } from 'react';
import HomePage from './home/page'; //Make sure the path is correct
import Search from './search/page';
import Results from './results/page';
import style from './page.module.css';

export default function Page() {
  const [showResults, setShowResults] = useState(false); // Status to manage whether to display results
  const resultsRef = useRef<HTMLDivElement>(null); // Create a reference


  const handleProceedClick = () => {
    setShowResults(true); // Set to true to display the result component
  

  // Make sure to scroll to the results section on each click
  if (resultsRef.current) {
    const elementPosition = resultsRef.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: elementPosition + resultsRef.current.offsetHeight- 800, // Scroll to the bottom of the results section
      behavior: 'smooth',
    });
  }
};

useEffect(() => {
  if (showResults && resultsRef.current) {
    const elementPosition = resultsRef.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: elementPosition + resultsRef.current.offsetHeight -800, 
      behavior: 'smooth',
    });
  }
}, [showResults]); // Perform scrolling when showResults changes

  return (
    <div className={style.main}>
      {/* display HomePage */}
      <div className={style['home-container']}>
        <HomePage />
      </div>

      {/* Display Search page*/}
      <div className={style['search-container']}>
        <Search onProceedClick={handleProceedClick} /> {/* Pass a function that handles the click*/}
      </div>

      {/* Display the Results page according to the showResults status */}
      {showResults && (
        <div className={style['result-container']} ref={resultsRef} > {/* Make sure the class name is correct */}
          <Results />
        </div>
      )}
    </div>
  );
}
