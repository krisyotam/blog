// components/posts/typography/Box.tsx
import { cn } from "@/lib/utils"
import React, { ReactNode } from "react"

export interface BoxProps {
  children: ReactNode
  className?: string
}

export function Box({ children, className }: BoxProps) {
  const base = [
    "p-6",
    "rounded-none",
    "my-6",
    "bg-gray-200",
    "dark:bg-[#333]",
    // Fix spacing issues with MDX content
    "[&>*:first-child]:mt-0",      // Remove top margin from first child
    "[&>*:last-child]:mb-0",       // Remove bottom margin from last child
    "[&_h1]:mt-0",                 // Remove space above h1
    "[&_h2]:mt-0",                 // Remove space above h2
    "[&_h3]:mt-0",                 // Remove space above h3
    "[&_h4]:mt-0",                 // Remove space above h4
    "[&_p]:my-2",                  // Control paragraph spacing
    "[&_ul]:my-2",                 // Control list spacing
    "[&_ol]:my-2",                 // Control list spacing
  ].join(" ")

  return <div className={cn(base, className)}>{children}</div>
}