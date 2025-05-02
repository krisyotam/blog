'use client'
import { useState, useEffect, ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { createHash } from 'crypto'

interface TikzProps {
  children: ReactNode
}

// Create a non-SSR version of the component
const TikzRenderer = ({ children }: TikzProps) => {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Normalize the children to a string
    const tikzCode = typeof children === 'string' 
      ? children 
      : children?.toString() || '';
    
    console.log('Tikz component mounted with code type:', typeof children);

    // Generate hash for TikZ code to look for pre-rendered SVG
    const hashBuffer = createHash('md5').update(tikzCode).digest('hex');
    const preRenderedSvgUrl = `/tikz-svg/${hashBuffer}.svg`;
    
    // First try to fetch the pre-rendered SVG
    fetch(preRenderedSvgUrl)
      .then(res => {
        if (res.ok) {
          return res.text().then(svgContent => {
            console.log('Found pre-rendered SVG');
            setSvg(svgContent);
            setIsLoading(false);
          });
        }
        
        // If pre-rendered SVG not found, fallback to API
        console.log('Pre-rendered SVG not found, falling back to API');
        return fetch('/api/tikz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: tikzCode }),
        })
          .then(res => {
            console.log('Response status:', res.status)
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
      })
      .catch(err => {
        console.error('Fetch error:', err)
        if (!error) {
          setError(`Error: ${err}`)
        }
        setIsLoading(false)
      })
  }, [children, error])

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
