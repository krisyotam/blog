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
  
  // Match both tikzpicture environments
  const tikzRegex = /\\begin{tikzpicture}([\s\S]*?)\\end{tikzpicture}/g;
  let match;
  
  while ((match = tikzRegex.exec(mdxContent)) !== null) {
    const fullMatch = match[0];
    tikzBlocks.push(fullMatch);
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

// Load existing registry
function loadExistingRegistry() {
  const registryFile = path.join(PUBLIC_SVG_DIR, 'registry.json');
  try {
    if (fs.existsSync(registryFile)) {
      return JSON.parse(fs.readFileSync(registryFile, 'utf8'));
    }
  } catch (err) {
    console.warn('Failed to load existing registry:', err);
  }
  return {};
}

// Process all MDX files to extract and compile TikZ diagrams
async function processAllFiles() {
  // Get existing registry and list of SVG files
  const existingRegistry = loadExistingRegistry();
  const existingSvgFiles = new Set();
  
  try {
    // Get list of existing SVG files
    const files = fs.readdirSync(PUBLIC_SVG_DIR);
    files.forEach(file => {
      if (file.endsWith('.svg')) {
        existingSvgFiles.add(file);
      }
    });
  } catch (err) {
    console.warn('Error reading existing SVG files:', err);
  }
  
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
  const svgHashesInUse = new Set();
  
  for (const [hash, tikzCode] of tikzCodeMap.entries()) {
    console.log(`Processing TikZ diagram with hash: ${hash}`);
    svgHashesInUse.add(`${hash}.svg`);
    
    const outputFile = path.join(PUBLIC_SVG_DIR, `${hash}.svg`);
    
    // Skip if SVG already exists and is valid
    if (fs.existsSync(outputFile) && isSvgValid(outputFile)) {
      console.log(`SVG already exists for ${hash}, skipping compilation`);
      tikzRegistry[hash] = {
        hash,
        tikzCode
      };
      continue;
    }
    
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
  
  // Remove orphaned SVGs (SVGs that no longer have corresponding TikZ code)
  for (const svgFile of existingSvgFiles) {
    if (!svgHashesInUse.has(svgFile)) {
      const filePath = path.join(PUBLIC_SVG_DIR, svgFile);
      console.log(`Removing orphaned SVG: ${filePath}`);
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to remove orphaned SVG ${filePath}:`, err);
      }
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