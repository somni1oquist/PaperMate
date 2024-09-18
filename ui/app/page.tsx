'use client';
import React from 'react';
import HomePage from './home/page';
import Search from './search/page';
import Results from './results/page';
import style from './page.module.css';

export default function Home() {
  return (
    <div className={style.main}>
      <div className={style['home-container']}>
        <HomePage />
      </div>

      <div className={style['search-container']}>
        <Search />
      </div>

      <div className={style['result-container']}>
        <Results />
      </div>
    </div>
  );
}
