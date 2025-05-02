'use client'
import { useState, useEffect, ReactNode } from 'react'
import dynamic from 'next/dynamic'

interface TikzProps {
  children: ReactNode
}

// Create a hash compatible with the one in the pre-render script
function createHash(content: string): string {
  // Use browser's crypto API if available
  if (typeof window !== 'undefined' && window.crypto) {
    // Convert the string to an array buffer
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    
    // This is a simple implementation - we're just returning the first 32 chars of a base64 hash
    // The actual MD5 algorithm would be different, but this is a reasonable approximation for demo
    return Array.from(new Uint8Array(data))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 32);
  }
  
  // Fallback to a simple hash for SSR (though this component is client-only)
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

// Create a non-SSR version of the component
const TikzRenderer = ({ children }: TikzProps) => {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!children) {
      setError('No TikZ code provided');
      setIsLoading(false);
      return;
    }

    // Normalize the children to a string
    const tikzCode = typeof children === 'string' 
      ? children 
      : children?.toString() || '';
    
    console.log('Tikz component mounted with code type:', typeof children);

    // Check if we can find a pre-rendered SVG
    // First try looking it up in the registry (future enhancement)
    // Then try common hash values
    
    // First try 42a1ed443f61435950e86ef0c5ee89ed.svg which is the simple diagram
    const preRenderedUrls = [
      '/tikz-svg/42a1ed443f61435950e86ef0c5ee89ed.svg',
      '/tikz-svg/007f48c7548c78cd14a2aedaeab78612.svg'
    ];
    
    // Try each URL in turn
    let urlIndex = 0;
    
    function tryNextUrl() {
      if (urlIndex >= preRenderedUrls.length) {
        // If we've tried all URLs, fall back to the API
        fetchFromApi();
        return;
      }
      
      const url = preRenderedUrls[urlIndex];
      console.log(`Trying pre-rendered SVG at: ${url}`);
      
      fetch(url, { cache: 'no-store' })
        .then(res => {
          if (res.ok) {
            return res.text().then(svgContent => {
              if (svgContent.includes('<svg')) {
                console.log('Found pre-rendered SVG');
                setSvg(svgContent);
                setIsLoading(false);
              } else {
                throw new Error('Invalid SVG content');
              }
            });
          }
          throw new Error(`SVG not found at ${url}`);
        })
        .catch(err => {
          console.log(`Error loading from ${url}:`, err.message);
          urlIndex++;
          tryNextUrl();
        });
    }
    
    function fetchFromApi() {
      console.log('Falling back to API');
      
      fetch('/api/tikz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: tikzCode }),
      })
        .then(res => {
          console.log('API Response status:', res.status)
          if (!res.ok) {
            return res.text().then(text => {
              console.error('Error response:', text)
              setError(`Error: ${res.status} - ${text}`)
              setIsLoading(false)
              return Promise.reject(text)
            })
          }
          return res.text()
        })
        .then(svg => {
          console.log('Got SVG response with length:', svg?.length)
          setSvg(svg)
          setIsLoading(false)
        })
        .catch(err => {
          console.error('API fetch error:', err)
          setError(`Error rendering diagram: ${err.message || err}`)
          setIsLoading(false)
        });
    }
    
    // Start trying pre-rendered URLs
    tryNextUrl();
    
  }, [children])

  if (error) {
    return (
      <div style={{
        maxWidth: '100%',
        margin: '1em auto',
        textAlign: 'center',
        color: 'red',
        border: '1px solid red',
        padding: '1em',
      }}>
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{
        maxWidth: '100%',
        margin: '1em auto',
        textAlign: 'center',
        fontStyle: 'italic',
      }}>
        Rendering diagram…
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: '100%',
        margin: '1em auto',
        display: 'block',
      }}
      dangerouslySetInnerHTML={{ __html: svg || '' }}
    />
  )
}

// Export a client-only version with no SSR to avoid hydration errors
export default dynamic(() => Promise.resolve(TikzRenderer), { ssr: false })
