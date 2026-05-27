/**
 * Estimates reading time for a body of text.
 * Strips markdown/HTML artifacts before counting.
 * Returns minutes rounded up, minimum 1.
 */
export function readingTime(text: string): number {
  const WPM = 225;
  const clean = text
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1") // links
    .replace(/<[^>]+>/g, "") // HTML tags
    .replace(/#{1,6}\s/g, "") // headings
    .replace(/[*_~`>]/g, "") // formatting chars
    .trim();
  const words = clean.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WPM));
}
