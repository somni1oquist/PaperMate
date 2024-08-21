"use client";
import React from "react";
import SearchForm from "./search/SearchForm";

export default function LandingPage() {
  return (
    <div className="search-form">
      <div className="header">
        <h1>PaperMate</h1>
        <p>
          Your Gateway to Streamlined Research - Search, Analyse, and Excel in
          One Click.
        </p>
      </div>
      <SearchForm />
    </div>
  );
}
