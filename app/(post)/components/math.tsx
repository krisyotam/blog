// components/Math.tsx
import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css"; // make sure this CSS is bundled

export type MathType = "inline" | "block";

interface MathProps {
  type?: MathType;
  children?: React.ReactNode;
  formula?: string; // For direct LaTeX input
  tex?: string;     // For data-attribute approach
}

export default function Math({
  type = "block",
  children,
  formula,
  tex,
}: MathProps) {
  // Priority order: tex prop > formula prop > children
  let mathText = tex || formula || "";
  
  if (!mathText && children) {
    // Turn whatever MDX puts between the tags into a single string
    mathText = React.Children.toArray(children).join("");
    
    // Handle string literals from MDX, both with single or double quotes
    if ((mathText.startsWith('"') && mathText.endsWith('"')) || 
        (mathText.startsWith("'") && mathText.endsWith("'"))) {
      mathText = mathText.slice(1, -1);
    }
  }
  
  // Automatically apply displaystyle for block equations
  if (type === "block" && !mathText.startsWith("\\displaystyle")) {
    mathText = "\\displaystyle " + mathText;
  }

  // Render to HTML at build/server time
  const html = katex.renderToString(mathText, {
    displayMode: type === "block",
    throwOnError: false,
    trust: true
  });

  const Tag = type === "inline" ? "span" : "div";
  return <Tag dangerouslySetInnerHTML={{ __html: html }} />;
}
