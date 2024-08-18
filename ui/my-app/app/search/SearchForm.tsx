// ui/my-app/app/search/SearchForm.tsx
import { useRouter } from 'next/router';
import React, { useState } from 'react';

const SearchForm = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`/results?page=1&query=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for papers..."
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchForm;
