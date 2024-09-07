import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DataProvider } from "./context/DataProvider";
import { ErrorProvider } from "./context/ErrorProvider";
// import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PaperMate",
  description: "ToDo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DataProvider>
          <ErrorProvider>
            {children}
          </ErrorProvider>
        </DataProvider>
      </body>
    </html>
  );
}
