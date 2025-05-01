// components/Quote.tsx
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

export interface QuoteProps {
  children: ReactNode;
  author: string;
  className?: string;
}

export function Quote({ children, author, className }: QuoteProps) {
  const base = [
    "p-6",
    "rounded-none",
    "my-6",
    "bg-gray-200",                        // Updated to match books.tsx light mode
    "dark:bg-[#333]",                     // Updated to match books.tsx dark mode
    "border-l-4",
    "border-[hsl(var(--border))]",        
    "dark:border-zinc-800",               // Removed !important
  ].join(" ");

  const footer = [
    "mt-4",
    "pt-4",
    "border-t",
    "border-[hsl(var(--border))]",
    "dark:border-zinc-800",               // Removed !important
    "text-sm",
    "text-muted-foreground",
    "dark:text-zinc-400",                 // Removed !important
    "flex",
    "justify-end",
  ].join(" ");

  return (
    <div className={cn(base, className)}>
      <div>{children}</div>
      <div className={footer}>– {author}</div>
    </div>
  );
}