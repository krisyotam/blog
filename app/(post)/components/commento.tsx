"use client"

import { useRef, useEffect, useState } from "react"
import Script from "next/script"
import { RefreshCw } from "lucide-react"

export function Commento() {
  const commentoRef = useRef<HTMLDivElement>(null)
  const [isReloading, setIsReloading] = useState(false)

  // Function to reload the Commento component
  const reloadCommento = () => {
    setIsReloading(true)

    // Remove existing Commento elements
    const existingCommento = document.getElementById("commento")
    if (existingCommento) {
      while (existingCommento.firstChild) {
        existingCommento.removeChild(existingCommento.firstChild)
      }
    }

    // Re-load the Commento script
    const script = document.createElement("script")
    script.src = "https://cdn.commento.io/js/commento.js"
    script.async = true
    script.onload = () => {
      setTimeout(() => {
        setIsReloading(false)
        enhanceCommento()
      }, 1000)
    }
    document.body.appendChild(script)
  }

  // Function to enhance Commento with LaTeX support, truncation, and pagination
  const enhanceCommento = () => {
    // Skip if commento container doesn't exist yet
    if (!document.getElementById("commento")) return

    // Wait a bit for Commento to fully render its comments
    setTimeout(() => {
      // Truncate long comments
      const commentTexts = document.querySelectorAll(".commento-comment-text")
      commentTexts.forEach((commentEl) => {
        const el = commentEl as HTMLElement
        const originalText = el.innerHTML

        if (originalText.length > 500) {
          const truncatedText = originalText.substring(0, 500)
          el.innerHTML = `
            <div class="truncated-comment">${truncatedText}...</div>
            <div class="full-comment" style="display: none;">${originalText}</div>
            <button class="expand-comment font-serif text-xs uppercase tracking-wider text-primary/70 hover:text-primary mt-2">
              Read more
            </button>
          `

          // Add click handler to expand button
          const expandBtn = el.querySelector(".expand-comment")
          if (expandBtn) {
            expandBtn.addEventListener("click", () => {
              el.querySelector(".truncated-comment")?.remove()
              el.querySelector(".full-comment")?.setAttribute("style", "display: block;")
              expandBtn.remove()
            })
          }
        }
      })

      // Add pagination for top-level comments
      const topLevelComments = document.querySelectorAll(".commento-comments > .commento-comment")
      if (topLevelComments.length > 4) {
        // Hide comments beyond the first 4
        for (let i = 4; i < topLevelComments.length; i++) {
          ;(topLevelComments[i] as HTMLElement).style.display = "none"
        }

        // Create pagination container
        const paginationContainer = document.createElement("div")
        paginationContainer.className = "commento-pagination flex justify-center mt-6 space-x-2"

        // Calculate number of pages
        const totalPages = Math.ceil(topLevelComments.length / 4)

        // Create page buttons
        for (let page = 1; page <= totalPages; page++) {
          const pageBtn = document.createElement("button")
          pageBtn.className = `pagination-btn px-3 py-1 border border-primary/20 font-serif text-sm ${page === 1 ? "bg-primary/10" : ""}`
          pageBtn.textContent = page.toString()
          pageBtn.dataset.page = page.toString()

          pageBtn.addEventListener("click", () => {
            // Update active button
            document.querySelectorAll(".pagination-btn").forEach((btn) => {
              btn.classList.remove("bg-primary/10")
            })
            pageBtn.classList.add("bg-primary/10")

            // Show/hide comments based on page
            const startIdx = (page - 1) * 4
            const endIdx = Math.min(startIdx + 4, topLevelComments.length)

            topLevelComments.forEach((comment, idx) => {
              ;(comment as HTMLElement).style.display = idx >= startIdx && idx < endIdx ? "block" : "none"
            })
          })

          paginationContainer.appendChild(pageBtn)
        }

        // Add pagination after comments
        const commentoCommentsEl = document.querySelector(".commento-comments")
        if (commentoCommentsEl) {
          commentoCommentsEl.appendChild(paginationContainer)
        }
      }

      // Render LaTeX in comments
      if (window.MathJax) {
        window.MathJax.typeset()
      }
    }, 1000) // Wait 1 second for Commento to load comments
  }

  useEffect(() => {
    // Set up a mutation observer to detect when Commento adds comments
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          enhanceCommento()
        }
      }
    })

    // Start observing the commento container once it exists
    const waitForCommento = setInterval(() => {
      const commentoEl = document.getElementById("commento")
      if (commentoEl) {
        clearInterval(waitForCommento)
        observer.observe(commentoEl, { childList: true, subtree: true })
        enhanceCommento() // Initial enhancement
      }
    }, 300)

    return () => {
      observer.disconnect()
      clearInterval(waitForCommento)
    }
  }, [])

  return (
    <div className="my-8 border border-border bg-card p-6 shadow-sm rounded-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-center">
        <div className="h-px w-16 bg-primary/30"></div>
        <div className="mx-4 text-center text-sm uppercase tracking-[0.2em] text-muted-foreground">Discussion</div>
        <div className="h-px w-16 bg-primary/30"></div>
      </div>

      {/* LaTeX disclaimer */}
      <div className="mb-6 text-center">
        <p className="text-sm text-muted-foreground italic">
          You can use LaTeX in your comments. Use <code className="px-1 py-0.5 bg-muted rounded">$...$</code> for inline
          math and <code className="px-1 py-0.5 bg-muted rounded">$$...$$</code> for block equations.
        </p>
      </div>

      {/* Reload button */}
      <div className="mb-6 text-center">
        <button
          onClick={reloadCommento}
          disabled={isReloading}
          className="inline-flex items-center px-3 py-1.5 border border-border rounded-sm bg-secondary hover:bg-secondary/80 transition-colors text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`h-3 w-3 mr-2 ${isReloading ? "animate-spin" : ""}`} />
          {isReloading ? "Loading comments..." : "Click here if comments have not loaded"}
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="flex items-center justify-center">
          <div className="h-px w-full bg-border"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-card px-4 text-muted-foreground">✦</span>
        </div>
      </div>

      {/* Comments container */}
      <div className="max-h-[600px] overflow-y-auto pr-2" ref={commentoRef}>
        {/* MathJax for LaTeX rendering */}
        <Script
          id="mathjax-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.MathJax = {
                tex: {
                  inlineMath: [['$', '$']],
                  displayMath: [['$$', '$$']]
                },
                svg: {
                  fontCache: 'global'
                },
                options: {
                  enableMenu: false
                }
              };
            `,
          }}
        />
        <Script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" strategy="afterInteractive" />

        {/* Commento script */}
        <Script src="https://cdn.commento.io/js/commento.js" strategy="afterInteractive" />
        <div id="commento"></div>
      </div>

      {/* Bottom decorative element */}
      <div className="mt-6 text-center">
        <div className="text-center text-sm text-muted-foreground">❧</div>
      </div>

      {/* Custom styles for Commento */}
      <style jsx global>{`
        /* Styling for truncated comments */
        .truncated-comment {
          position: relative;
        }
        
        .expand-comment {
          cursor: pointer;
          transition: color 0.2s ease;
        }
        
        /* Pagination styling */
        .commento-pagination {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid hsl(var(--border));
        }
        
        .pagination-btn {
          transition: all 0.2s ease;
        }
        
        .pagination-btn:hover {
          background-color: hsl(var(--secondary));
        }

        /* Commento styling to match site theme */
        .commento-root * {
          font-family: inherit;
        }

        .commento-root .commento-card {
          border-radius: 0.25rem;
          border: 1px solid hsl(var(--border));
          background-color: hsl(var(--background));
        }

        .commento-root .commento-body {
          border-top: 1px solid hsl(var(--border));
        }

        .commento-root .commento-name {
          color: hsl(var(--foreground));
        }

        .commento-root .commento-submit-button {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-radius: 0.25rem;
          transition: opacity 0.2s ease;
        }

        .commento-root .commento-submit-button:hover {
          opacity: 0.9;
        }

        .commento-root textarea {
          border: 1px solid hsl(var(--border));
          border-radius: 0.25rem;
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }

        .commento-root .commento-markdown-help {
          border: 1px solid hsl(var(--border));
          border-radius: 0.25rem;
          background-color: hsl(var(--background));
        }
      `}</style>
    </div>
  )
}

// Add TypeScript interface for MathJax
declare global {
  interface Window {
    MathJax: any
  }
}
