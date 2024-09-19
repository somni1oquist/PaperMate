import React from 'react';
import Link from 'next/link';
import '../Bottom-Bar.css'; // Import the CSS file

const BottomBar: React.FC = () => {

  // Function to handle smooth scroll to the search section
  const scrollToSearch = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault(); // Prevent default link behavior
    const searchSection = document.getElementById('search-section'); // Get the search section by ID
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' }); // Scroll to the section smoothly
    }
  };

  return (
    <div className="bottom-bar">
      {/* Traffic light instead of a logo */}
      <div className="traffic-light">
        <div className="light red"></div>
        <div className="light yellow"></div>
        <div className="light green"></div>
      </div>

      {/* Navigation Links */}
      <Link href="/" className="bottom-bar-option">Home</Link>
      <a href="#search-section" className="bottom-bar-option" onClick={scrollToSearch}>Search</a>
      <Link href="/results" className="bottom-bar-option">Results</Link>
    </div>
  );
};

export default BottomBar;
