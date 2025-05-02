import { NextResponse } from 'next/server'
import { spawnSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { randomUUID } from 'crypto'

// Check if a command is available in the system
function commandExists(command: string): boolean {
  try {
    const result = spawnSync(command, ['--version'], { shell: true });
    return result.status === 0;
  } catch (error) {
    return false;
  }
}

// Generate a fallback SVG when LaTeX is not available
function generateFallbackSVG(message: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
    <rect width="400" height="120" fill="#f8f9fa" stroke="#d2d3d4" stroke-width="1"/>
    <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="#666">
      ${message}
    </text>
    <text x="50%" y="75%" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="#888">
      Please check vercel.json configuration
    </text>
  </svg>`;
}

export async function POST(request: Request) {
  console.log('TikZ API route called')
  
  try {
    const json = await request.json() as { code?: string }
    const { code } = json
    
    console.log('Received code:', code ? `${code.substring(0, 50)}...` : 'null')
    
    if (!code) {
      console.error('No TikZ code provided')
      return NextResponse.json({ error: 'No TikZ code provided' }, { status: 400 })
    }

    // Check for available TeX commands
    const hasLatex = commandExists('latex');
    const hasPdflatex = commandExists('pdflatex');
    const hasDvisvgm = commandExists('dvisvgm');
    
    console.log('Available commands:', { 
      latex: hasLatex, 
      pdflatex: hasPdflatex, 
      dvisvgm: hasDvisvgm 
    });
    
    // If LaTeX tools aren't available, return a notice SVG
    if (process.env.VERCEL && (!hasLatex && !hasPdflatex)) {
      const fallbackSVG = generateFallbackSVG("LaTeX rendering requires configuration in vercel.json");
      return new NextResponse(fallbackSVG, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 's-maxage=86400, stale-while-revalidate',
        },
      });
    }
    
    if (!hasLatex && !hasPdflatex) {
      return NextResponse.json({ 
        error: 'TeX compilation not available',
        details: 'Neither latex nor pdflatex is available on this system'
      }, { status: 500 });
    }
    
    if (!hasDvisvgm) {
      return NextResponse.json({ 
        error: 'SVG conversion not available',
        details: 'dvisvgm is not available on this system'
      }, { status: 500 });
    }
    
    // Create a platform-agnostic temp directory
    const tempDir = os.tmpdir();
    const dirId = randomUUID().slice(0, 8);
    const tmp = path.join(tempDir, `tikz-${dirId}`);
    
    try {
      fs.mkdirSync(tmp, { recursive: true });
    } catch (err) {
      console.error('Failed to create temp directory:', err);
      return NextResponse.json({ 
        error: 'Failed to create temporary directory', 
        details: (err as Error).message 
      }, { status: 500 });
    }
    
    console.log('Created temp directory:', tmp)
    
    const texFile = path.join(tmp, 'diagram.tex')
    const dviFile = path.join(tmp, 'diagram.dvi')
    const pdfFile = path.join(tmp, 'diagram.pdf')
    const svgFile = path.join(tmp, 'diagram.svg')

    // full TikZ preamble
    const tex = `
\\documentclass[tikz,border=2pt]{standalone}
\\usepackage{tikz}
\\usetikzlibrary{
  arrows.meta,
  positioning,
  shapes.geometric,
  matrix,
  cd,
  calc
}
\\begin{document}
${code}
\\end{document}
`.trim()

    fs.writeFileSync(texFile, tex)
    console.log('Wrote TeX file:', texFile)

    // Use latex to generate DVI directly
    if (hasLatex) {
      const latexResult = spawnSync('latex', [
        '-interaction=nonstopmode', 
        '-output-directory=' + tmp, // Use single argument format to avoid space issues
        texFile
      ], { shell: true }); // Use shell: true for Windows
      
      console.log('latex stdout:', latexResult.stdout?.toString())
      console.log('latex stderr:', latexResult.stderr?.toString())
      
      if (latexResult.error || latexResult.status !== 0) {
        console.error('latex error:', latexResult.error)
        return NextResponse.json({ 
          error: 'TikZ compilation failed: latex error',
          details: latexResult.stderr?.toString() || latexResult.error?.message
        }, { status: 500 })
      }
    }
    // If latex isn't available but pdflatex is, use it and convert PDF to SVG directly
    else if (hasPdflatex) {
      const pdflatexResult = spawnSync('pdflatex', [
        '-interaction=nonstopmode', 
        '-output-directory=' + tmp, // Use single argument format to avoid space issues
        texFile
      ], { shell: true }); // Use shell: true for Windows
      
      console.log('pdflatex stdout:', pdflatexResult.stdout?.toString())
      
      if (pdflatexResult.error || pdflatexResult.status !== 0) {
        console.error('pdflatex error:', pdflatexResult.error)
        return NextResponse.json({ 
          error: 'TikZ compilation failed: pdflatex error',
          details: pdflatexResult.stderr?.toString() || pdflatexResult.error?.message
        }, { status: 500 })
      }
      
      // If using pdflatex, we need pdf2svg or Inkscape or similar to convert the PDF to SVG
      return NextResponse.json({ 
        error: 'System configuration issue',
        details: 'This server is configured with pdflatex but not latex. Contact the administrator to install the latex package.'
      }, { status: 500 });
    }
    
    // Convert DVI to SVG
    const dvisvgmResult = spawnSync('dvisvgm', [
      '--no-fonts', 
      dviFile, 
      '-o', 
      svgFile
    ], { shell: true }); // Use shell: true for Windows
    
    console.log('dvisvgm stdout:', dvisvgmResult.stdout?.toString())
    console.log('dvisvgm stderr:', dvisvgmResult.stderr?.toString())
    
    if (dvisvgmResult.error || dvisvgmResult.status !== 0) {
      console.error('dvisvgm error:', dvisvgmResult.error)
      return NextResponse.json({ 
        error: 'TikZ compilation failed: dvisvgm error',
        details: dvisvgmResult.stderr?.toString() || dvisvgmResult.error?.message
      }, { status: 500 })
    }

    try {
      const svg = fs.readFileSync(svgFile, 'utf8')
      console.log('SVG generated successfully, length:', svg.length)
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 's-maxage=86400, stale-while-revalidate',
        },
      })
    } catch (err) {
      console.error('Failed to read SVG file:', err)
      return NextResponse.json({ 
        error: 'Failed to read generated SVG file',
        details: (err as Error).message
      }, { status: 500 })
    }
  } catch (err) {
    console.error('Error processing TikZ request:', err)
    return NextResponse.json({ 
      error: 'Error processing TikZ request', 
      details: (err as Error).message
    }, { status: 500 })
  }
}
