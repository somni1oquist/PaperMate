// bottom-bar.tsx
import React from 'react';
import Link from 'next/link';
import '../bottom-bar.css'; // Import the CSS file
import { useData } from '../context/DataContext';
import { useLoading } from '../context/LoadingContext';
import Progress from './Progress';

const BottomBar: React.FC = () => {
  const { data } = useData();
  const { loading, loadEvent } = useLoading();
  const resultsEnabled = data !== null;

  const handleScroll = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    event.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bottom-bar">
      {/* Conditionally display loading indicator */}
      {loading ? (
        <Progress eventName={loadEvent} />
      ) : null} {/* Remove traffic light */}

      {/* Navigation Links */}
      <Link href="#home"
        className="bottom-bar-option"
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScroll(e, 'home')}
      >
        Home
      </Link>

      <Link href="#search"
        className="bottom-bar-option"
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScroll(e, 'search')}
      >
        Search
      </Link>

      <Link
        href={resultsEnabled ? "#results" : "#"}
        className={`bottom-bar-option ${resultsEnabled ? '' : 'disabled'}`}
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScroll(e, 'results')}
      >
        Result
      </Link>

      <Link href="#about"
        className="bottom-bar-option"
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScroll(e, 'about')}
      >
        About
      </Link>
    </div>
  );
};

export default BottomBar;
