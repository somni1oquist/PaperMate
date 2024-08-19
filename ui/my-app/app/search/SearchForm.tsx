"use client";

import { useRouter } from "next/router";
import React, { useState } from "react";

const SearchForm = () => {
  const [query, setQuery] = useState("");
  const [fromDay, setFromDay] = useState("");
  const [fromMonth, setFromMonth] = useState("");
  const [fromYear, setFromYear] = useState("");
  const [toDay, setToDay] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [toYear, setToYear] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [abstract, setAbstract] = useState("");
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(true);
  const [isChatbotEnabled, setIsChatbotEnabled] = useState(false);

  const router = useRouter();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (isAdvancedSearch) {
      console.log({
        fromDay,
        fromMonth,
        fromYear,
        toDay,
        toMonth,
        toYear,
        title,
        author,
        abstract,
        query,
      });
      // Add your advanced search logic here
    } else {
      router.push(`/results?page=1&query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="search-form-wrapper">
      {/* Toggle Buttons */}
      <div className="toggle-group">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={isAdvancedSearch}
            onChange={() => setIsAdvancedSearch(!isAdvancedSearch)}
          />
          <span className="slider round"></span>
          <span>Advanced Search</span>
        </label>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={isChatbotEnabled}
            onChange={() => setIsChatbotEnabled(!isChatbotEnabled)}
          />
          <span className="slider round"></span>
          <span>Chatbot</span>
        </label>
      </div>

      {/* Search Box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search for papers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </div>

      {/* Advanced Search Form */}
      {isAdvancedSearch && (
        <div className="form-container">
          <form onSubmit={handleSearch}>
            <div className="advanced-search-title">ADVANCED SEARCH</div>
            <div className="date-group">
              <label>From:</label>
              <div className="date-inputs">
                <select
                  value={fromDay}
                  onChange={(e) => setFromDay(e.target.value)}
                >
                  <option value="">Day</option>
                  {/* Add day options here */}
                </select>
                <select
                  value={fromMonth}
                  onChange={(e) => setFromMonth(e.target.value)}
                >
                  <option value="">Month</option>
                  {/* Add month options here */}
                </select>
                <select
                  value={fromYear}
                  onChange={(e) => setFromYear(e.target.value)}
                >
                  <option value="">Year</option>
                  {/* Add year options here */}
                </select>
              </div>
            </div>
            <div className="date-group">
              <label>To:</label>
              <div className="date-inputs">
                <select
                  value={toDay}
                  onChange={(e) => setToDay(e.target.value)}
                >
                  <option value="">Day</option>
                  {/* Add day options here */}
                </select>
                <select
                  value={toMonth}
                  onChange={(e) => setToMonth(e.target.value)}
                >
                  <option value="">Month</option>
                  {/* Add month options here */}
                </select>
                <select
                  value={toYear}
                  onChange={(e) => setToYear(e.target.value)}
                >
                  <option value="">Year</option>
                  {/* Add year options here */}
                </select>
              </div>
            </div>
            <input
              type="text"
              placeholder="Enter Title Here"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Author Here"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Abstract Here"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SearchForm;
