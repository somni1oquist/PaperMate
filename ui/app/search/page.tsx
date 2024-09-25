'use client';
import React from 'react';
import Footer from '../components/Footer';
import SearchForm from './SearchForm'; 
import styles from './page.module.css'


export default function Search() {
  return (
    <>
      <div>
          <SearchForm /> {/* Transferring properties */}
      </div>
    </>
  );
}
