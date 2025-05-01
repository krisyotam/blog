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
    "bg-gray-200",                           
    "dark:bg-[#333]",                        
    "border-l-4",                            
    "border-gray-300",                        // Updated to softer border color in light mode
    "dark:border-zinc-800",                  
  ].join(" ");

  const footer = [
    "mt-4",
    "pt-4",
    "border-t",
    "border-gray-300",                        // Updated to softer border color in light mode
    "dark:border-zinc-800",                  
    "text-right",
    "text-sm",
    "text-muted-foreground",                  
    "dark:text-zinc-400",                    
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