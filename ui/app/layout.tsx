import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DataProvider } from "./context/DataContext";
import { MessageProvider } from "./context/MessageContext";
import { LoadingProvider } from "./context/LoadingContext";
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
        <MessageProvider>
          <LoadingProvider>
            <DataProvider>
              {children}
            </DataProvider>
          </LoadingProvider>
        </MessageProvider>
      </body>
    </html>
  );
}
