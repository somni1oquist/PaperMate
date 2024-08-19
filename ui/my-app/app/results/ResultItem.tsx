// app/components/ResultsForm.tsx
"use client";

import React from 'react';

const ResultsForm: React.FC = () => {
  const results = Array.from({ length: 10 }, (_, i) => ({
    title: `Literature ${i + 1}`,
    abstract: "ABC",
    author: "ABC",
    journal: "ABC",
    date: "14/APR/2020",
    relevance: "8/10",
  }));

  return (
    <div className="p-1.5 bg-transparent rounded-lg">
      <h2 className="text-center text-xl font-semibold mb-1.5">Search Results</h2>
      <div className="overflow-x-auto ml-10 mr-10">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-3 text-center">Literature Title</th>
              <th className="py-3 px-20 text-center">Abstract</th>
              <th className="py-3 px-1 text-center">Author</th>
              <th className="py-3 px-1 text-center">Journal Source</th>
              <th className="py-3 px-1 text-center">Published Date</th>
              <th className="py-3 px-1 text-center">Relevance Score</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {results.map((result, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-center whitespace-nowrap">{result.title}</td>
                <td className="py-3 px-12 text-center">{result.abstract}</td>
                <td className="py-3 px-3 text-center">{result.author}</td>
                <td className="py-3 px-3 text-center">{result.journal}</td>
                <td className="py-3 px-6 text-center">{result.date}</td>
                <td className="py-3 px-3 text-center">{result.relevance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center ml-10 mr-10 bg-gray-200 rounded-md">
        <span className="text-sm text-gray-500 ml-2">Rows per page: 10</span>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 ml-4">1-10 of 276</span>
          <div className="flex items-center ml-6">
            <button className="text-gray-500 px-2 border-gray-500 rounded-md mr-2">‹</button>
            <button className="text-gray-500 px-2 border-gray-500 rounded-md">›</button>
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
