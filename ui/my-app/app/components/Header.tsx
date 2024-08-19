// app/components/Header.tsx
"use client"; // Mark this file as a Client Component

import React from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for navigation

const Header: React.FC = () => {
  const router = useRouter(); // Navigation hook

  const handleClick = () => {
    router.push('/'); // Navigate to the main landing page
  };

  return (
    <header 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60px', 
        backgroundColor: 'transparent', 
        marginTop: '10px' // Add margin to push the header lower
      }}
    >
      <h1 
        onClick={handleClick} 
        style={{ 
          fontSize: '2.5rem', 
          cursor: 'pointer', 
          margin: 0 
        }}
      >
        PaperMate
      </h1>
    </header>
  );
};

export default Header;
