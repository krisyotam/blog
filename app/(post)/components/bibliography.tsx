import { Book, FileText, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import fs from 'fs/promises'
import path from 'path'

interface BibliographyEntry {
  id: string
  author: string
  title: string
  year: number
  publisher: string
  url: string
  type: "book" | "article" | "video" | "paper" | string
}

interface BibliographyProps {
  className?: string
  dir?: string // Directory path from which to load the bibliography.json file
}

export async function Bibliography({ className, dir }: BibliographyProps) {
  // If a directory is provided, try to load the bibliography.json from that directory
  // Otherwise, just render an empty bibliography
  const bibliography = dir ? await loadBibliography(dir) : []

  // Get icon based on entry type
  const getEntryIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "book":
        return <Book className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      case "video":
        return <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      case "article":
      case "paper":
      default:
        return <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    }
  }

  // Apply the same styling as Box/Citation component
  const baseStyles = cn(
    "relative max-w-2xl mx-auto",
    "p-6",
    "rounded-none",
    "my-6",
    "bg-gray-200",
    "dark:bg-[#333]",
    "[&>*:first-child]:mt-0",
    "[&>*:last-child]:mb-0",
    className
  )

  if (bibliography.length === 0) {
    return null
  }

  return (
    <div className={baseStyles}>
      <h3 className="text-sm font-medium mb-4">Bibliography</h3>
      <div className="space-y-2">
        {bibliography.map((entry) => (
          <div
            key={entry.id}
            className="py-1.5 px-2 flex items-start gap-2 text-xs"
          >
            {getEntryIcon(entry.type)}
            <div className="overflow-hidden">
              <span>
                {entry.author} ({entry.year}). <span className="italic">{entry.title}</span>. {entry.publisher}.
                {' '}
                <a 
                  href={entry.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View resource
                </a>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper function to load bibliography data from a directory
async function loadBibliography(dir: string): Promise<BibliographyEntry[]> {
  try {
    const filePath = path.join(process.cwd(), dir, 'bibliography.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch (e) {
    console.error(`Failed to load bibliography from ${dir}:`, e)
    return []
  }
}

export default Bibliography
