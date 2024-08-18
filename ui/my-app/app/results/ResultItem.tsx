// ui/my-app/app/results/ResultItem.tsx
import React from 'react';

interface Paper {
  title: string;
  abstract: string;
  author: string;
  journal: string;
  published_date: string;
}

interface ResultItemProps {
  paper: Paper;
}

const ResultItem: React.FC<ResultItemProps> = ({ paper }) => {
  return (
    <li>
      <h2>{paper.title}</h2>
      <p>{paper.abstract}</p>
      <p>{paper.author}</p>
      <p>{paper.journal}</p>
      <p>{paper.published_date}</p>
    </li>
  );
};

export default ResultItem;
