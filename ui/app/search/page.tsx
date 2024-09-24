'use client';
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchForm from './SearchForm'; 
import style from '../page.module.css';


export default function Search() {
  return (
    <>
      <div className={style.main}>
        <div>
          <Header />
          <SearchForm /> {/* Transferring properties */}
        </div>
      </div>
    </>
  );
}
