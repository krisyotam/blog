// components/Excerpt.tsx
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

export interface ExcerptProps {
  children: ReactNode;
  title: string;
  author: string;
  version?: string;
  year?: string;
  className?: string;
}

export function Excerpt({
  children,
  title,
  author,
  version,
  year,
  className,
}: ExcerptProps) {
  const base = [
    "p-6",
    "rounded-none",                          
    "my-6",
    "bg-gray-200",                            // Updated to match books.tsx light mode
    "dark:bg-[#333]",                         // Updated to match books.tsx dark mode
    "border-l-4",                             // Keeping the left border for design distinction
    "border-[hsl(var(--border))]",            
    "dark:border-zinc-800",                   // Removed !important
  ].join(" ");

  const footer = [
    "mt-4",
    "pt-4",
    "border-t",
    "border-[hsl(var(--border))]",
    "dark:border-zinc-800",                   // Removed !important
    "text-right",
    "text-sm",
    "text-muted-foreground",                  
    "dark:text-zinc-400",                     // Removed !important
  ].join(" ");

  return (
    <div className={cn(base, className)}>
      <div>{children}</div>
      <div className={footer}>
        {title}
        {version ? `, ${version}` : ""}
        {year ? `, ${year}` : ""} — {author}
      </div>
    </div>
  );
}