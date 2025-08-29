import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strips markdown formatting from text to create clean snippets
 * @param markdown - The markdown text to strip
 * @param maxLength - Maximum length of the snippet (default: 150)
 * @returns Clean text without markdown formatting
 */
export function stripMarkdown(markdown: string, maxLength: number = 150): string {
  if (!markdown) return '';
  
  // Remove markdown formatting
  let cleanText = markdown
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove inline code
    .replace(/`(.*?)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Truncate to maxLength and add ellipsis if needed
  if (cleanText.length > maxLength) {
    cleanText = cleanText.substring(0, maxLength).trim();
    // Try to break at a word boundary
    const lastSpace = cleanText.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) { // Only break at word if it's not too early
      cleanText = cleanText.substring(0, lastSpace);
    }
    cleanText += '...';
  }
  
  return cleanText;
}
