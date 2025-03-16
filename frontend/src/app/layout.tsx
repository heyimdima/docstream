import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "docstream",
  description: "streaming latest documentation to developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${lexend.className}`}>
      <body>{children}</body>
    </html>
  );
}
