/**
 * Markdown Utility Module
 * 
 * Provides markdown-to-HTML conversion for content rendering.
 * Uses 'marked' library with custom configuration for safe rendering.
 */

import { marked } from 'marked';

// =============================================================================
// Configuration
// =============================================================================

// Configure marked for safe rendering
marked.setOptions({
  gfm: true,        // GitHub Flavored Markdown (tables, strikethrough, etc.)
  breaks: false,    // Don't convert \n to <br>
});

// =============================================================================
// Main Export
// =============================================================================

/**
 * Convert markdown to HTML string
 * 
 * @param markdown - Raw markdown string
 * @returns HTML string
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  // Parse markdown to HTML
  const html = marked.parse(markdown);
  
  // marked.parse can return string | Promise<string>, but with our sync config it's always string
  return typeof html === 'string' ? html : '';
}

/**
 * Extract a clean text excerpt from markdown
 * Removes all markdown formatting and returns plain text
 * 
 * @param markdown - Raw markdown string
 * @param maxLength - Maximum length of excerpt
 * @returns Plain text excerpt
 */
export function extractPlainText(markdown: string, maxLength: number = 200): string {
  if (!markdown) return '';
  
  // Remove markdown headers
  let text = markdown.replace(/^#+\s+.+$/gm, '');
  // Remove markdown links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove images
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
  // Remove markdown formatting (bold, italic, code)
  text = text.replace(/[*_`~]/g, '');
  // Remove blockquote markers
  text = text.replace(/^>\s*/gm, '');
  // Remove horizontal rules
  text = text.replace(/^---+$/gm, '');
  // Remove table formatting
  text = text.replace(/\|/g, ' ');
  text = text.replace(/^[-:]+$/gm, '');
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Truncate at word boundary
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}
