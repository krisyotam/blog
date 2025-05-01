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
    "bg-gray-200",                       
    "dark:bg-[#333]",                    
    "border-l-4",
    "border-gray-300",                    // Updated to softer border color in light mode
    "dark:border-zinc-800",              
  ].join(" ");

  const footer = [
    "mt-4",
    "pt-4",
    "border-t",
    "border-gray-300",                    // Updated to softer border color in light mode
    "dark:border-zinc-800",              
    "text-sm",
    "text-muted-foreground",
    "dark:text-zinc-400",                
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