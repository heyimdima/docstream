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
      <div className="container mx-auto h-16 flex items-center">
        {/* Left section - Logo */}
        <div className="w-1/3 flex justify-start">
          <Link href="/" className="font-semibold text-xl">
            docstream
          </Link>
        </div>

        {/* Middle section - Navigation links */}
        <div className="w-1/3 flex justify-center">
          <nav className="flex items-center gap-8">
            <Link
              href="/about"
              className="text-md font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/features"
              className="text-md font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-md font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right section - Sign in button */}
        <div className="w-1/3 flex justify-end">
          <Button variant="outline" asChild>
            <Link href="/chat">New Chat</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
