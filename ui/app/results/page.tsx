'use client'
import React from 'react';
import ResultContainer from './ResultContainer';
import './ResultPage.css';
import { useRouter, usePathname } from 'next/navigation';

const ResultPage: React.FC = () => {
  
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/results')
    router.push('/#search');

  return (
    <div className="result-page-wrapper">
      <ResultContainer />
    </div>
  );
};

export default ResultPage;
