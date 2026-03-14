import { useState } from 'react';
import { Library } from './components/Library';
import { RSVPDisplay } from './components/RSVPDisplay';
import { parseBook } from './lib/parsers';
import type { ParsedBook } from './lib/types';
import { saveBookToDb } from './lib/db';
import { useSettings } from './hooks/useSettings';
import { CurateScreen } from './components/CurateScreen';
import type { ExtractedPage } from './lib/extractor';

export default function App() {
  const [activeBook, setActiveBook] = useState<ParsedBook | null>(null);
  const [curatingPage, setCuratingPage] = useState<ExtractedPage | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const { settings, updateSettings } = useSettings();

  const handleUpload = async (file: File) => {
    try {
      setIsParsing(true);
      const book = await parseBook(file);
      await saveBookToDb(book);
      setActiveBook(book);
    } catch (e) {
      console.error(e);
      alert('Failed to parse book. Check developer console for details.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleUrlParsed = (page: ExtractedPage) => {
    setCuratingPage(page);
  };

  const handleCurateStart = async (curatedText: string) => {
    if (!curatingPage) return;
    
    // Convert extracted content into a ParsedBook format
    const words = curatedText.split(/\s+/).filter(w => w.length > 0);
    const book: ParsedBook = {
      id: `url-${btoa(curatingPage.url).slice(0, 16)}`,
      title: curatingPage.title,
      format: 'url',
      totalWords: words.length,
      chapters: [{
        id: 'main',
        title: 'Main Content',
        content: curatedText,
        words: words,
        globalWordOffset: 0
      }]
    };

    await saveBookToDb(book);
    setCuratingPage(null);
    setActiveBook(book);
  };

  if (curatingPage) {
    return (
      <CurateScreen 
        page={curatingPage} 
        onBack={() => setCuratingPage(null)} 
        onStart={handleCurateStart}
        wpm={settings.wpm}
      />
    );
  }

  if (!activeBook) {
    return (
      <Library 
        onUpload={handleUpload} 
        onResume={setActiveBook} 
        onUrlParsed={handleUrlParsed}
        isParsing={isParsing} 
      />
    );
  }

  return (
    <RSVPDisplay 
      book={activeBook} 
      onExit={() => setActiveBook(null)} 
      settings={settings} 
      onUpdateSettings={updateSettings} 
    />
  );
}
