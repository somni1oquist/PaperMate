"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const handleClick = () => {
    router.push('/');
  }

  return (
    <header style={{
      textAlign: 'center',
      fontFamily: 'Georgia, serif',
    }}>
      <h1 onClick={handleClick}>PaperMate</h1>
      <h4>
        Your Gateway to Streamlined Research – Search, Analyse, and Excel in One Click.
      </h4>
    </header>
  );
}