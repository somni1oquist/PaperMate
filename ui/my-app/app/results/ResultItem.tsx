"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Result {
  title: string;
  abstract: string;
  author: string;
  publication: string;
  publish_date: string;
  relevance: number | null;
  synopsis: string;
}

const ResultsForm: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(`http://127.0.0.1:5000/papers/search?query=${encodedQuery}`);
        
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data = await response.json();

        const mappedResults: Result[] = Array.isArray(data) ? data : [];
        setResults(mappedResults);
      } catch (error) {
        console.error('Fetch error:', error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="p-2 bg-transparent rounded-lg">
      <h2 className="text-center text-xl font-semibold mb-1.5">Search Results</h2>
      <div className="max-h-[60vh] overflow-y-auto">
        <div className="overflow-x-auto ml-10 mr-10">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-2 text-center">Literature Title</th>
                <th className="py-3 px-2 text-center">Abstract</th>
                <th className="py-3 px-2 text-center">Author</th>
                <th className="py-3 px-2 text-center">Journal Source</th>
                <th className="py-3 px-2 text-center">Published Date</th>
                <th className="py-3 px-2 text-center">Relevance Score</th>
                <th className="py-3 px-2 text-center">Synopsis</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {results.map((result, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-2 text-center">{result.title}</td>
                  <td className="py-3 px-2 text-center">{result.abstract}</td>
                  <td className="py-3 px-2 text-center">{result.author}</td>
                  <td className="py-3 px-2 text-center">{result.publication}</td>
                  <td className="py-3 px-2 text-center">{result.publish_date}</td>
                  <td className="py-3 px-2 text-center">{result.relevance}</td>
                  <td className="py-3 px-2 text-center">{result.synopsis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center ml-10 mr-10 bg-gray-200 rounded-md">
          <span className="text-sm text-gray-500 ml-2">Rows per page: 10</span>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 ml-4">1-10 of {results.length}</span>
            <div className="flex items-center ml-6">
              <button className="text-gray-500 px-2 border-gray-500 rounded-md mr-2">‹</button>
              <button className="text-gray-500 px-2 border-gray-500 rounded-md">›</button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-10">
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-md hover:bg-gray-100 flex items-center">
          Export CSV
        </button>
      </div>
    </div>
  );
};

export default ResultsForm;
