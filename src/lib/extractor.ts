export interface ExtractedParagraph {
  text: string;
  type: 'heading' | 'text';
}

export interface ExtractedPage {
  title: string;
  paragraphs: ExtractedParagraph[];
  url: string;
}

/**
 * Extracts the main content from an HTML string.
 * Uses Mozilla Readability if available as a global, otherwise falls back to heuristics.
 */
export function extractMainContent(html: string, url: string): ExtractedPage {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // If Readability is loaded globally (via the CDN script in useUrlFetcher)
  if ((window as any).Readability) {
    try {
      // Add base tag to help Readability with relative URLs
      const baseEl = doc.createElement('base');
      baseEl.setAttribute('href', url);
      doc.head.appendChild(baseEl);

      const reader = new (window as any).Readability(doc, {
        charThreshold: 20,
        nbTopCandidates: 5
      });
      const article = reader.parse();

      if (article && article.content) {
        const contentDoc = parser.parseFromString(article.content, 'text/html');
        const paragraphs: ExtractedParagraph[] = [];
        const seen = new Set<string>();

        contentDoc.querySelectorAll('h1, h2, h3, h4, p, li, blockquote').forEach(el => {
          const text = el.textContent?.replace(/\s+/g, ' ').trim() || '';
          if (text.length < 15 || seen.has(text.slice(0, 100))) return;
          seen.add(text.slice(0, 100));

          const tag = el.tagName.toLowerCase();
          paragraphs.push({
            text,
            type: tag.startsWith('h') ? 'heading' : 'text'
          });
        });

        if (paragraphs.length > 2) {
          return {
            title: article.title || doc.title || 'Untitled Article',
            url,
            paragraphs
          };
        }
      }
    } catch (e) {
      console.error('Readability extraction failed:', e);
    }
  }

  // Fallback: Enhanced Heuristics if Readability is missing or fails
  console.log('Using fallback heuristics for extraction');

  // 1. Cleanup
  const noiseSelectors = [
    'nav', 'header', 'footer', 'aside', 'script', 'style', 'iframe', 'noscript',
    'form', 'button', 'input', '.menu', '.sidebar', '.comments', '.ad', 
    '.social', '.share', '.banner', '.cookie', '.popup', '#nav', '#footer'
  ];
  noiseSelectors.forEach(selector => {
    doc.querySelectorAll(selector).forEach(el => el.remove());
  });

  // 2. Identify the main title
  const title = doc.querySelector('h1')?.textContent?.trim() || doc.title || url;

  // 3. Score all potential containers
  let bestContainer: Element = doc.body;
  let maxScore = 0;

  doc.querySelectorAll('div, section, article, main').forEach(el => {
    // Basic score based on number of paragraphs and text length
    const pCount = el.querySelectorAll('p').length;
    const textLength = el.textContent?.length || 0;
    const score = pCount * 10 + Math.sqrt(textLength);

    if (score > maxScore) {
      maxScore = score;
      bestContainer = el;
    }
  });

  // 4. Extract from the best container
  const paragraphs: ExtractedParagraph[] = [];
  const seen = new Set<string>();

  bestContainer.querySelectorAll('p, h1, h2, h3, h4, li, blockquote').forEach(el => {
    const text = el.textContent?.replace(/\s+/g, ' ').trim() || '';
    if (text.length < 20 || seen.has(text.slice(0, 100))) return;
    seen.add(text.slice(0, 100));

    const tag = el.tagName.toLowerCase();
    paragraphs.push({
      text,
      type: tag.startsWith('h') ? 'heading' : 'text'
    });
  });

  return {
    title,
    url,
    paragraphs: paragraphs.length > 0 ? paragraphs : [{ text: "Could not extract content.", type: 'text' }]
  };
}
