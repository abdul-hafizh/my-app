import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { ReactNode } from "react";

export const metadata = {
  title: "Payment Gateway",
  description: "Merchant Payment Gateway Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />

          <div className="ml-72 min-h-screen">
            <Topbar />

            <main className="p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}