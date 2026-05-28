import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Session MVP",
  description: "Local-first research session tracker"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
