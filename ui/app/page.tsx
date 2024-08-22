import React from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import SearchForm from './search/SearchForm';
import style from './page.module.css';
import Footer from './components/Footer';

export default function Home() {
  return (
    <>
      <div className={style.main}>
        <div className={style["papermate-container"]}>
          <Header />
          <SearchForm />
          <Footer />
        </div>
      </div>
    </>
  );
}
