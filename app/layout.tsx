import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";

export const metadata = {
  title: "Course Management System",
  description: "A simple course management app built with Next.js and Supabase",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Toaster position="top-right" />
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
        <footer className="border-t mt-10 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Course Management System. All rights
          reserved.
        </footer>
      </body>
    </html>
  );
}
