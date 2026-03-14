import React, { useState, useEffect } from 'react';
import { Upload, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import type { ParsedBook } from '../lib/types';
import { getAllBooksFromDb, deleteBookFromDb } from '../lib/db';
import { useProgress } from '../hooks/useProgress';
import { WelcomeModal, isFirstVisit } from './WelcomeModal';
import clsx from 'clsx';

interface LibraryProps {
  onUpload: (file: File) => void;
  onResume: (book: ParsedBook) => void;
  isParsing?: boolean;
}

export const Library: React.FC<LibraryProps> = ({ 
  onUpload, 
  onResume,
  isParsing = false
}) => {
  const [books, setBooks] = useState<ParsedBook[]>([]);
  const [showWelcome, setShowWelcome] = useState(() => isFirstVisit());
  const { getProgress, clearProgress } = useProgress();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadBooks();
  }, [isParsing]); // Reload when parsing finishes

  const loadBooks = async () => {
    const all = await getAllBooksFromDb();
    setBooks(all);
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

  return (
    <>
      {showWelcome && <WelcomeModal onDismiss={() => setShowWelcome(false)} />}
      <div className="max-w-5xl mx-auto p-6 pt-12 md:p-12 h-screen overflow-y-auto">
      <div className="flex flex-col items-start mb-8">
        <div className="text-[26px] font-light tracking-[-0.5px] text-text-color mb-1">
          Fix<b className="text-orp font-semibold">ate</b>
        </div>
        <div className="text-[11px] text-text3 font-mono tracking-[1px] uppercase mb-1">
          rapid serial visual presentation
        </div>
        <div className="text-text3 text-xs font-mono">{books.length} book{books.length !== 1 && 's'} in library</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8 items-start">
        {/* Dropzone */}
        <div 
          className={clsx(
            "relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all bg-white dark:bg-[#222]",
            isDragging 
              ? "border-accent-color bg-accent-bg" 
              : "border-border-color hover:border-text-muted hover:bg-black/5 dark:hover:bg-white/5",
            isParsing && "opacity-50 pointer-events-none"
          )}
          style={{ minHeight: '320px' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isParsing ? (
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-12 h-12 rounded-full bg-accent-color/20 flex items-center justify-center mb-4">
                <BookOpen size={24} className="text-accent-color animate-bounce" />
              </div>
              <div className="font-semibold text-lg text-text-color">Parsing book...</div>
              <div className="text-sm text-text-muted mt-2">Extracting text & applying NLP rules</div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                <Upload size={24} />
              </div>
              <div className="font-semibold text-lg text-text-color mb-2">Upload a book</div>
              <div className="text-sm text-text-muted mb-6">Drag & drop or click to browse</div>
              
              <div className="flex gap-3 mb-8">
                <span className="text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">EPUB</span>
                <span className="text-xs font-semibold px-2 py-1 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">PDF</span>
              </div>
              
              <div className="text-xs text-text-muted uppercase tracking-wider">up to 50 MB</div>
              
              {/* Hidden input */}
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                accept=".epub,application/epub+zip,.pdf,application/pdf"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        {/* Book List */}
        <div className="flex flex-col gap-4">
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
                    book.format === 'epub' 
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400" 
                      : "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400"
                  )}>
                    {book.format}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-lg text-text-color line-clamp-1 m-0">{book.title}</h3>
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
