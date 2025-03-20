"use client";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  // Size mappings
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const sizeClass = sizeClasses[size];

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClass} animate-spin rounded-full border-t-transparent border-primary`}
        aria-label="Loading"
      />
      <p className="mt-3 text-sm text-muted-foreground"></p>
    </div>
  );
}
