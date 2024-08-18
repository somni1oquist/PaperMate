// ui/my-app/app/results/page.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import React from 'react';
import ResultItem from './ResultItem';

const ResultsPage = () => {
  const router = useRouter();
  const [papers, setPapers] = useState<any[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      const query = new URLSearchParams(router.query as any).toString();
      const response = await fetch(`http://127.0.0.1:5000/papers/search?${query}`);
      const data = await response.json();
      setPapers(data.papers);
    };

    if (router.query.query) {
      fetchResults();
    }
  }, [router.query.query]);

  return (
    <div>
      <h1>Search Results</h1>
      <ul>
        {papers.map((paper) => (
          <ResultItem key={paper.title} paper={paper} />
        ))}
      </ul>
    </div>
  );
};

export default ResultsPage;
