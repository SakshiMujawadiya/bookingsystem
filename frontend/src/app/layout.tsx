import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import ToastContainer from "@/components/ToastContainer";

export const metadata: Metadata = {
  title: "Meeting Room Booking",
  description: "Book meeting rooms, view schedules, and manage reservations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="min-h-full flex flex-col font-sans bg-gray-50/50 text-gray-900">
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
