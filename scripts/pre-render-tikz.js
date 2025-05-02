#!/usr/bin/env node

/**
 * Pre-renders TikZ diagrams in MDX files to static SVGs
 * This script runs during the build process to generate SVGs
 * from TikZ code found in MDX files.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { randomUUID } = require('crypto');
const os = require('os');
const glob = require('glob');

// Directory to store the generated SVGs
const PUBLIC_SVG_DIR = path.join(process.cwd(), 'public', 'tikz-svg');

// Ensure the output directory exists
if (!fs.existsSync(PUBLIC_SVG_DIR)) {
  fs.mkdirSync(PUBLIC_SVG_DIR, { recursive: true });
} else {
  // Delete all existing SVG files to ensure clean regeneration
  console.log('Cleaning existing SVG files...');
  const existingFiles = fs.readdirSync(PUBLIC_SVG_DIR);
  for (const file of existingFiles) {
    if (file.endsWith('.svg')) {
      const filePath = path.join(PUBLIC_SVG_DIR, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted: ${filePath}`);
      } catch (err) {
        console.error(`Failed to delete ${filePath}:`, err);
      }
    }
  }
  console.log('Finished cleaning existing SVG files');
}

// Check if LaTeX commands are available
function commandExists(command) {
  try {
    const result = spawnSync(command, ['--version'], { shell: true });
    return result.status === 0;
  } catch (error) {
    return false;
  }
}

const hasLatex = commandExists('latex');
const hasDvisvgm = commandExists('dvisvgm');

if (!hasLatex) {
  console.warn('⚠️ LaTeX not found. TikZ diagrams will not be pre-rendered.');
  process.exit(0);
}

if (!hasDvisvgm) {
  console.warn('⚠️ dvisvgm not found. TikZ diagrams will not be pre-rendered.');
  process.exit(0);
}

// Extract TikZ code blocks from MDX files
function extractTikzBlocks(mdxContent) {
  const tikzBlocks = [];
  const uniqueBlocksMap = new Map(); // Maps diagram content to count of occurrences
  
  // First pattern: Raw tikzpicture environments
  const tikzRegex = /\\begin{tikzpicture}([\s\S]*?)\\end{tikzpicture}/g;
  let match;
  
  while ((match = tikzRegex.exec(mdxContent)) !== null) {
    const fullMatch = match[0];
    const normalizedContent = fullMatch.replace(/\s+/g, ''); // Normalize whitespace
    
    if (!uniqueBlocksMap.has(normalizedContent)) {
      uniqueBlocksMap.set(normalizedContent, 1);
      tikzBlocks.push(fullMatch);
    } else {
      uniqueBlocksMap.set(normalizedContent, uniqueBlocksMap.get(normalizedContent) + 1);
    }
  }

  // Second pattern: String.raw blocks in MDX with tikzpicture
  const stringRawRegex = /String\.raw`\s*(\\begin{tikzpicture}[\s\S]*?\\end{tikzpicture})\s*`/g;
  
  while ((match = stringRawRegex.exec(mdxContent)) !== null) {
    if (match[1]) {
      const tikzCode = match[1];
      const normalizedContent = tikzCode.replace(/\s+/g, ''); // Normalize whitespace
      
      if (!uniqueBlocksMap.has(normalizedContent)) {
        uniqueBlocksMap.set(normalizedContent, 1);
        tikzBlocks.push(tikzCode);
      } else {
        uniqueBlocksMap.set(normalizedContent, uniqueBlocksMap.get(normalizedContent) + 1);
      }
    }
  }
  
  // Log any diagrams that appear multiple times
  for (const [content, count] of uniqueBlocksMap.entries()) {
    if (count > 1) {
      console.log(`Note: Found ${count} instances of the same TikZ diagram`);
    }
  }
  
  return tikzBlocks;
}

// Generate a hash for the TikZ code to use as the filename
function generateHash(code) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(code).digest('hex');
}

// Check if SVG file is valid
function isSvgValid(svgPath) {
  try {
    const content = fs.readFileSync(svgPath, 'utf8');
    return content.includes('<svg') && content.includes('</svg>');
  } catch (err) {
    return false;
  }
}

// Compile TikZ code to SVG
function compileTikzToSvg(tikzCode) {
  // Create a platform-agnostic temp directory
  let baseDir = os.platform() === 'win32' ? 'c:\\tikztemp' : os.tmpdir();
  const dirId = randomUUID().slice(0, 8);
  let tmp = path.join(baseDir, dirId);
  
  try {
    fs.mkdirSync(tmp, { recursive: true });
  } catch (err) {
    console.error('Failed to create temp directory:', err);
    
    // Try a fallback location if the first one fails
    if (os.platform() === 'win32') {
      baseDir = 'c:\\temp';
      const fallbackTmp = path.join(baseDir, `tikz-${dirId}`);
      try {
        fs.mkdirSync(baseDir, { recursive: true });
        fs.mkdirSync(fallbackTmp, { recursive: true });
        console.log('Created fallback temp directory:', fallbackTmp);
        // Use the fallback directory
        tmp = fallbackTmp;
      } catch (fallbackErr) {
        console.error('Failed to create fallback directory:', fallbackErr);
        return null;
      }
    } else {
      console.error('Failed to create temporary directory:', err);
      return null;
    }
  }
  
  const texFile = path.join(tmp, 'diagram.tex');
  const dviFile = path.join(tmp, 'diagram.dvi');
  const svgFile = path.join(tmp, 'diagram.svg');

  // Full TikZ preamble
  const tex = `
\\documentclass[tikz,border=2pt]{standalone}
\\usepackage{tikz}
\\usetikzlibrary{
  arrows.meta,
  positioning,
  shapes.geometric,
  matrix,
  cd,
  calc,
  decorations.pathmorphing,
  backgrounds
}
\\begin{document}
${tikzCode}
\\end{document}
`.trim();

  fs.writeFileSync(texFile, tex);
  console.log('Wrote TeX file:', texFile);

  // Use latex to generate DVI
  const outputDir = tmp.replace(/\\/g, '/');
  
  const latexResult = spawnSync('latex', [
    '-interaction=nonstopmode', 
    `-output-directory=${outputDir}`,
    texFile
  ], { shell: true });
  
  if (latexResult.error || latexResult.status !== 0) {
    console.error('LaTeX compilation failed:', latexResult.stderr?.toString());
    return null;
  }
  
  // Convert DVI to SVG
  const dvisvgmResult = spawnSync('dvisvgm', [
    '--no-fonts', 
    dviFile, 
    '-o', 
    svgFile
  ], { shell: true });
  
  if (dvisvgmResult.error || dvisvgmResult.status !== 0) {
    console.error('DVI to SVG conversion failed:', dvisvgmResult.stderr?.toString());
    return null;
  }

  try {
    const svg = fs.readFileSync(svgFile, 'utf8');
    console.log('SVG generated successfully, length:', svg.length);
    return svg;
  } catch (err) {
    console.error('Failed to read SVG file:', err);
    return null;
  }
}

// Process all MDX files to extract and compile TikZ diagrams
async function processAllFiles() {
  const mdxFiles = glob.sync('app/**/*.mdx');
  const tikzCodeMap = new Map();
  
  console.log(`Found ${mdxFiles.length} MDX files to process`);
  
  for (const file of mdxFiles) {
    console.log(`Processing file: ${file}`);
    const content = fs.readFileSync(file, 'utf8');
    const tikzBlocks = extractTikzBlocks(content);
    
    for (const tikzCode of tikzBlocks) {
      const hash = generateHash(tikzCode);
      tikzCodeMap.set(hash, tikzCode);
    }
    
    console.log(`Found ${tikzBlocks.length} TikZ diagrams in ${file}`);
  }
  
  console.log(`Found ${tikzCodeMap.size} unique TikZ diagrams to render`);
  
  // Compile each unique TikZ code to SVG
  const tikzRegistry = {};
  
  for (const [hash, tikzCode] of tikzCodeMap.entries()) {
    console.log(`Processing TikZ diagram with hash: ${hash}`);
    
    const outputFile = path.join(PUBLIC_SVG_DIR, `${hash}.svg`);
    
    // Always regenerate SVG
    console.log(`Compiling TikZ diagram with hash: ${hash}`);
    const svg = compileTikzToSvg(tikzCode);
    
    if (svg) {
      fs.writeFileSync(outputFile, svg);
      console.log(`Saved SVG to: ${outputFile}`);
      
      tikzRegistry[hash] = {
        hash,
        tikzCode
      };
    }
  }
  
  // Write registry file
  const registryFile = path.join(PUBLIC_SVG_DIR, 'registry.json');
  fs.writeFileSync(registryFile, JSON.stringify(tikzRegistry, null, 2));
  console.log(`Wrote registry file: ${registryFile}`);
}

processAllFiles().catch(err => {
  console.error('Error processing files:', err);
  process.exit(1);
}); 