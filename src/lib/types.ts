export interface ParsedChapter {
  id: string; // Chapter ID or page number
  title: string; // "Chapter 1" or "Page 1"
  content: string; // Raw text content (optional, mostly for debugging)
  words: string[]; // Tokenized words
  globalWordOffset: number; // The global index of the first word in this chapter
}

export interface ParsedBook {
  id: string; // Hash or filename
  title: string;
  author?: string;
  coverImage?: string; // base64 or blob URL
  format: 'epub' | 'pdf' | 'txt' | 'md' | 'url';
  chapters: ParsedChapter[];
  totalWords: number;
}

export interface BookPosition {
  bookId: string;
  wordIndex: number;
  timestamp: number;
}
