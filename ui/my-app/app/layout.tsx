import React, { ReactNode } from "react";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>PaperMate</title>
      </head>
      <body>
        <div className="papermate-container">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
