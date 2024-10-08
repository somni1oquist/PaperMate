'use client';
import React from 'react';
import SearchForm from './SearchForm';
import { useRouter, usePathname } from 'next/navigation';


export default function Search() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/search')
    router.push('/#search');

  return (
    <>
      <div>
          <SearchForm /> {/* Transferring properties */}
      </div>
    </>
  );
}
