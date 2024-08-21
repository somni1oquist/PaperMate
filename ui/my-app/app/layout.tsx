import React, { ReactNode } from "react";
import SearchForm from "./search/SearchForm";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <SearchForm />
        {children}
        <Footer />
      </body>
    </html>
  );
}
