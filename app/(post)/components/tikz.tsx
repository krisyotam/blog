'use client'
import { useState, useEffect, ReactNode } from 'react'
import dynamic from 'next/dynamic'

interface TikzProps {
  children: ReactNode
}

// Create a non-SSR version of the component
const TikzRenderer = ({ children }: TikzProps) => {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Normalize the children to a string
    const tikzCode = typeof children === 'string' 
      ? children 
      : children?.toString() || '';
    
    console.log('Tikz component mounted with code type:', typeof children);
    
    fetch('/api/tikz', {
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
            return Promise.reject(text)
          })
        }
        return res.text()
      })
      .then(svg => {
        console.log('Got SVG response with length:', svg?.length)
        setSvg(svg)
      })
      .catch(err => {
        console.error('Fetch error:', err)
        if (!error) {
          setError(`Error: ${err}`)
        }
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

  if (!svg) {
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
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

// Export a client-only version with no SSR to avoid hydration errors
export default dynamic(() => Promise.resolve(TikzRenderer), { ssr: false })
