import { useState, useCallback } from 'react';
import { extractMainContent, type ExtractedPage } from '../lib/extractor';

const PROXIES = [
  { url: (target: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`, json: true },
  { url: (target: string) => `https://corsproxy.io/?${encodeURIComponent(target)}`, json: false },
  { url: (target: string) => `https://api.codetabs.com/v1/proxy/?quest=${target}`, json: false },
];

function loadReadability(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Readability) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mozilla/readability@0.5.0/Readability.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Readability library'));
    document.head.appendChild(script);
  });
}

export function useUrlFetcher() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUrl = useCallback(async (url: string): Promise<ExtractedPage | null> => {
    setLoading(true);
    setError(null);

    try {
      await loadReadability();
    } catch (err) {
      console.warn('Readability load failed, falling back to heuristics');
    }

    for (let i = 0; i < PROXIES.length; i++) {
      const proxy = PROXIES[i];
      try {
        const response = await fetch(proxy.url(url));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let html = '';
        if (proxy.json) {
          const data = await response.json();
          html = data.contents;
        } else {
          html = await response.text();
        }

        if (!html || html.length < 500) {
          throw new Error('Retrieved content too small');
        }

        const extracted = extractMainContent(html, url);
        if (extracted.paragraphs.length < 2) {
          throw new Error('No readable content found on page');
        }

        setLoading(false);
        return extracted;
      } catch (err: any) {
        console.warn(`Proxy ${i + 1} failed:`, err.message);
      }
    }

    setLoading(false);
    setError(`Failed to fetch content after trying ${PROXIES.length} methods. The site might be blocking external requests or requires JavaScript to render.`);
    return null;
  }, []);

  return { fetchUrl, loading, error };
}
