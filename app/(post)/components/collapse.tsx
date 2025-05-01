"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

export interface CollapseProps {
  /** Title shown when collapsed */
  title: string
  /** Content (MDX/Markdown) to display inside */
  children: React.ReactNode
  /** Additional classes for the outer wrapper */
  className?: string
}

export default function Collapse({ title, children, className }: CollapseProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={cn(
        "my-6 rounded-none bg-gray-200 dark:bg-[#333]",
        className
      )}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-2 text-left font-medium select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <ChevronRight
          className={cn(
            "w-4 h-4 transform transition-transform",
            isOpen && "rotate-90"
          )}
        />
      </button>
      {isOpen && (
        <div className={cn(
          "px-4 pb-4",
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
        )}>
          {children}
        </div>
      )}
    </div>
  )
}