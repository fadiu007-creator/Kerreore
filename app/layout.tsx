import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kerreore — Rent a car by the hour",
  description: "Peer-to-peer hourly car rental made simple.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
