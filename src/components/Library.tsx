import React, { useState, useEffect } from 'react';
import { Upload, BookOpen, Trash2, ArrowRight, Globe } from 'lucide-react';
import type { ParsedBook } from '../lib/types';
import { getAllBooksFromDb, deleteBookFromDb } from '../lib/db';
import { useProgress } from '../hooks/useProgress';
import { WelcomeModal } from './WelcomeModal';
import { useUrlFetcher } from '../hooks/useUrlFetcher';
import type { ExtractedPage } from '../lib/extractor';
import clsx from 'clsx';

interface LibraryProps {
  onUpload: (file: File) => void;
  onResume: (book: ParsedBook) => void;
  onUrlParsed: (page: ExtractedPage) => void;
  isParsing?: boolean;
}

export const Library: React.FC<LibraryProps> = ({ 
  onUpload, 
  onResume,
  onUrlParsed,
  isParsing = false
}) => {
  const [books, setBooks] = useState<ParsedBook[]>([]);
  const [booksLoaded, setBooksLoaded] = useState(false);
  const [url, setUrl] = useState('');
  const { fetchUrl, loading: isFetching, error: urlError } = useUrlFetcher();
  // Dismiss state — modal can be closed mid-session without reappearing
  const [dismissed, setDismissed] = useState(false);
  const showWelcome = booksLoaded && books.length === 0 && !dismissed;
  const { getProgress, clearProgress } = useProgress();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadBooks();
  }, [isParsing]); // Reload when parsing finishes

  const loadBooks = async () => {
    const all = await getAllBooksFromDb();
    setBooks(all);
    setBooksLoaded(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Remove this book from your library?")) {
      await deleteBookFromDb(id);
      clearProgress(id);
      loadBooks();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  const handleUrlSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;
    
    const page = await fetchUrl(url.trim());
    if (page) {
      onUrlParsed(page);
    }
  };

  return (
    <>
      {showWelcome && <WelcomeModal onDismiss={() => setDismissed(true)} />}
      <div className="min-h-screen w-full">
        <div className="max-w-6xl mx-auto p-6 md:p-12">
      <div className="flex flex-col items-center text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="w-20 h-20 mb-8 p-1 bg-white dark:bg-white/10 rounded-[32px] shadow-2xl shadow-orp/20 flex items-center justify-center border border-border-color">
          <img src="/logo.svg" alt="Fixxate Logo" className="w-14 h-14" />
        </div>
        <div className="text-[42px] font-thin tracking-[-1px] text-text-color mb-1 leading-none">
          Fixx<b className="text-orp font-semibold">ate</b>
        </div>
        <div className="text-[12px] text-text3 font-mono tracking-[3px] uppercase mb-4 opacity-80">
          rapid serial visual presentation
        </div>
        <div className="px-3 py-1 bg-bg2 rounded-full border border-border-color text-text3 text-[10px] font-mono font-bold uppercase tracking-wider">
          {books.length} book{books.length !== 1 && 's'} in library
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-16">
        {/* Dropzone */}
        <div 
          className={clsx(
            "relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all bg-white/50 dark:bg-[#1f2028]/50 backdrop-blur-sm",
            isDragging 
              ? "border-accent-color bg-accent-bg" 
              : "border-border-color hover:border-text-muted hover:bg-black/5 dark:hover:bg-white/5",
            isParsing && "opacity-50 pointer-events-none"
          )}
          style={{ minHeight: '380px' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isParsing ? (
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-16 h-16 rounded-3xl bg-accent-color/20 flex items-center justify-center mb-6">
                <BookOpen size={32} className="text-accent-color animate-bounce" />
              </div>
              <div className="font-semibold text-xl text-text-color">Parsing...</div>
              <div className="text-sm text-text-muted mt-2">Extracting your knowledge</div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-8 shadow-inner">
                <Upload size={32} />
              </div>
              <div className="font-bold text-xl text-text-color mb-2">Upload File</div>
              <div className="text-sm text-text-muted mb-8 max-w-xs">Drag & drop your local EPUB, PDF, or Markdown files</div>
              
              <div className="flex gap-4 mb-8">
                <span className="text-[10px] font-bold px-2 py-1 bg-green-500/10 text-green-500 rounded border border-green-500/20">EPUB</span>
                <span className="text-[10px] font-bold px-2 py-1 bg-blue-500/10 text-blue-500 rounded border border-blue-500/20">PDF</span>
                <span className="text-[10px] font-bold px-2 py-1 bg-purple-500/10 text-purple-500 rounded border border-purple-500/20">MD</span>
              </div>
              
              <div className="text-[10px] text-text3 uppercase font-bold tracking-widest bg-bg3 px-3 py-1 rounded-full">Local Only</div>
              
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                accept=".epub,application/epub+zip,.pdf,application/pdf,.md,.markdown,text/markdown"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        {/* URL Input Card */}
        <div className="border border-border-color rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-white/50 dark:bg-[#1f2028]/50 backdrop-blur-sm min-h-[380px]">
          <div className="w-16 h-16 rounded-3xl bg-orp/10 text-orp flex items-center justify-center mb-8 shadow-inner">
            <Globe size={32} />
          </div>
          <div className="font-bold text-xl text-text-color mb-2">Web Scraper</div>
          <div className="text-sm text-text-muted mb-8 max-w-xs">Enter an article URL to extract content and read distraction-free</div>
          
          <form onSubmit={handleUrlSubmit} className="flex flex-col gap-3 w-full">
            <input 
              type="url"
              placeholder="https://example.com/article..."
              className="w-full px-5 py-4 bg-bg shadow-inner border border-border-color rounded-2xl focus:border-orp outline-none text-sm transition-all text-text font-mono"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isFetching}
            />
            <button 
              type="submit"
              disabled={isFetching || !url.trim()}
              className="w-full py-4 bg-orp text-white rounded-2xl font-bold text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-orp/20 flex items-center justify-center gap-2"
            >
              {isFetching ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Fetch & Parse <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          {urlError && (
            <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl w-full">
              <div className="text-[11px] text-red-500 font-mono mb-3 leading-relaxed">
                {urlError}
              </div>
              <button 
                onClick={() => {
                  const title = prompt("Enter a title for this article:");
                  if (!title) return;
                  const text = prompt("Paste the article text here:");
                  if (!text) return;
                  onUrlParsed({
                    title: title,
                    url: "manual-paste",
                    paragraphs: text.split('\n\n').filter(p => p.trim()).map(p => ({
                      text: p.replace(/\s+/g, ' ').trim(),
                      type: 'text'
                    }))
                  });
                }}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-text text-[10px] font-bold rounded-xl uppercase tracking-widest transition-all border border-text/10"
              >
                Manual Paste Fallback
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Library Heading */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-sm font-bold uppercase tracking-[4px] text-text3 whitespace-nowrap">Your Library</h2>
        <div className="h-px w-full bg-border-color/50"></div>
      </div>

      <div className="pb-12">
          {books.length === 0 ? (
            <div className="border border-border-color border-dashed rounded-2xl p-12 text-center text-text-muted bg-white/50 dark:bg-[#222]/50">
              Your library is empty. Upload a file to get started.
            </div>
          ) : (
            books.map(book => {
              const progressEntry = getProgress(book.id);
              const wordIndex = progressEntry?.wordIndex || 0;
              const progressPct = book.totalWords > 0 ? (wordIndex / book.totalWords) * 100 : 0;
              
              return (
                <div 
                  key={book.id}
                  className="group flex flex-col sm:flex-row items-stretch border border-border-color rounded-xl overflow-hidden bg-white dark:bg-[#1f2028] hover:border-text-muted/50 transition-colors cursor-pointer shadow-sm hover:shadow"
                  onClick={() => onResume(book)}
                >
                  {/* Format badge */}
                  <div className={clsx(
                    "w-full sm:w-20 p-4 flex flex-row sm:flex-col items-center justify-center font-bold text-xs tracking-wider uppercase border-b sm:border-b-0 sm:border-r border-border-color",
                    book.format === 'epub' && "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
                    book.format === 'pdf' && "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400",
                    book.format === 'md' && "bg-purple-50 text-purple-600 dark:bg-purple-900/10 dark:text-purple-400",
                    book.format === 'txt' && "bg-slate-50 text-slate-600 dark:bg-slate-900/10 dark:text-slate-400",
                    book.format === 'url' && "bg-orp/5 text-orp border-orp/20 dark:bg-orp/10"
                  )}>
                    {book.format === 'url' ? 'WEB' : book.format}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-4">
                      <h3 className="font-semibold text-lg text-text-color line-clamp-2 md:line-clamp-1 truncate m-0 leading-tight">{book.title}</h3>
                      <button 
                        className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 -mt-1 -mr-1"
                        onClick={(e) => handleDelete(e, book.id)}
                        title="Delete book"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="text-sm text-text-muted mb-4 line-clamp-1">
                      {book.author ? `${book.author} · ` : ''}
                      {book.totalWords.toLocaleString()} words
                    </div>
                    
                    {/* Mini progress bar */}
                    <div className="w-full bg-border-color h-1.5 rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-blue-600 dark:bg-blue-500 transition-all rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-text-muted font-medium">
                      <span>{Math.round(progressPct)}%</span>
                      {wordIndex > 0 ? <span>Resume</span> : <span>Start</span>}
                    </div>
                  </div>
                  
                  {/* Action */}
                  <div className="p-4 sm:p-5 border-t sm:border-t-0 border-border-color flex items-center justify-center sm:bg-black/[0.02] dark:sm:bg-white/[0.02]">
                    <button 
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors w-full sm:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResume(book);
                      }}
                    >
                      {wordIndex > 0 ? 'Resume' : 'Start'} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
    </>
  );
};
