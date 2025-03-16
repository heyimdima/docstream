// components/Header.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-background/80 backdrop-blur-sm shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="flex h-16 items-center px-4 md:px-6 lg:px-8">
        {/* Left section - Logo */}
        <div className="flex-none">
          <Link href="/" className="font-semibold text-xl">
            docstream
          </Link>
        </div>

        {/* Middle section - Navigation links */}
        <div className="flex-1 flex justify-center">
          <nav className="flex items-center gap-6">
            <Link href="/about" className="text-sm font-medium hover:underline">
              About
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium hover:underline"
            >
              Features
            </Link>
            <Link
              href="/features"
              className="text-sm font-medium hover:underline"
            >
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right section - New Chat button */}
        <div className="flex-none">
          <Button size="sm">
            <Link href="/chat">New Chat</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
