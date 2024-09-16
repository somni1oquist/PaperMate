'use client';
import React from 'react';
import Image from 'next/image';
import style from '../page.module.css'; // Assuming your CSS module file

export default function HomePage() {
  return (
    <div className={style['home-container']}>
      <div className={style['logo-section']}>
        <Image
          src="/car.jpg"
          alt="Logo"
          width={400}
          height={300}
          className={style.logo}
        />
      </div>
      <div className={style['text-section']}>
        <h1>PaperMate</h1>
        <p>Your Gateway to Streamlined Research – Search, Analyse, and Excel in One Click.</p>
      </div>
    </div>
  );
}
