"use client";
import React, { useState } from 'react'; // Import useState

export default function Header() {
  const [isPlaying, setIsPlaying] = useState(false); // State to control animation playback

  const handlePlayAnimation = () => {
    setIsPlaying(true); // Set the animation to play
  };

  return (
    <header 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '1rem 0' 
      }}>
        <h1>Discover Your Next Inspiration</h1>
    </header>
  );
}
