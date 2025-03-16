// app/(auth)/layout.tsx
import React from "react";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
