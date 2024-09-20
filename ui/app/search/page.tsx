'use client';
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchForm from './SearchForm'; 
import style from '../page.module.css';

interface SearchProps {
  onProceedClick: () => void; // Defining attribute types
}

export default function Search({ onProceedClick }: SearchProps) {
  return (
    <>
      <div className={style.main}>
        <div className={style['papermate-container']}>
          <Header />
          <SearchForm onProceedClick={onProceedClick} /> {/* Transferring properties */}
        </div>
      </div>
    </>
  );
}
