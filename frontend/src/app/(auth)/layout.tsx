// app/(auth)/layout.tsx
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950 relative">
      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  );
}
