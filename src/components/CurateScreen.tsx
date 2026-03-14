import React, { useState, useMemo } from 'react';
import { X, ArrowLeft, Play, Sparkles, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import type { ExtractedPage, ExtractedParagraph } from '../lib/extractor';

interface CurateScreenProps {
  page: ExtractedPage;
  onBack: () => void;
  onStart: (curatedText: string) => void;
  wpm: number;
}

export const CurateScreen: React.FC<CurateScreenProps> = ({ 
  page, 
  onBack, 
  onStart,
  wpm
}) => {
  const [items, setItems] = useState<(ExtractedParagraph & { id: number; removed: boolean })[]>(
    page.paragraphs.map((p, i) => ({ ...p, id: i, removed: false }))
  );

  const stats = useMemo(() => {
    const active = items.filter(i => !i.removed);
    const wordCount = active.reduce((sum, item) => sum + item.text.split(/\s+/).length, 0);
    const readingTime = Math.ceil(wordCount / wpm);
    return { wordCount, readingTime, activeCount: active.length };
  }, [items, wpm]);

  const toggleRemove = (id: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, removed: !item.removed } : item
    ));
  };

  const smartTrim = () => {
    setItems(prev => {
      return prev.map((item, index) => {
        if (item.type === 'heading') return item;
        
        // Logic: remove very short paragraphs, first/last bits of noise
        const wc = item.text.split(/\s+/).length;
        const isShort = wc < 30;
        const isFirstFew = index < 2;
        const isLastFew = index > prev.length - 3;
        
        if (isShort || isFirstFew || isLastFew) {
          return { ...item, removed: true };
        }
        return item;
      });
    });
  };

  const restoreAll = () => {
    setItems(prev => prev.map(item => ({ ...item, removed: false })));
  };

  const handleStart = () => {
    const curatedText = items
      .filter(i => !i.removed)
      .map(i => i.text)
      .join('\n\n');
    onStart(curatedText);
  };

  return (
    <div className="flex flex-col h-screen bg-bg text-text overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center gap-4 p-4 border-b border-border-color">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-bg2 rounded-lg transition-colors text-text-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-lg truncate m-0">{page.title}</h2>
          <div className="text-xs text-text-muted font-mono truncate">
            {page.url}
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end text-xs font-mono text-text-muted">
          <span>{stats.wordCount.toLocaleString()} words</span>
          <span>~{stats.readingTime} min</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border-color bg-bg2/50 backdrop-blur-sm sticky top-0 z-10">
        <span className="text-xs font-mono text-text-muted flex-1">
          {stats.activeCount} of {items.length} sections active
        </span>
        <button 
          onClick={smartTrim}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:border-purple-400 border border-transparent transition-all"
        >
          <Sparkles size={14} />
          Smart Trim
        </button>
        <button 
          onClick={restoreAll}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text hover:bg-bg2 rounded-lg transition-all"
        >
          <RotateCcw size={14} />
          Restore All
        </button>
        <button 
          onClick={handleStart}
          disabled={stats.wordCount === 0}
          className="flex items-center gap-2 px-5 py-2 bg-orp text-white rounded-lg font-bold text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orp/20"
        >
          <Play size={16} fill="currentColor" />
          Read Now
        </button>
      </div>

      {/* Paragraph List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 max-w-4xl mx-auto w-full pb-20">
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => toggleRemove(item.id)}
            className={clsx(
              "group relative p-5 rounded-2xl border transition-all cursor-pointer",
              item.removed 
                ? "bg-bg/50 border-border-color opacity-40 grayscale" 
                : "bg-bg2 border-border-color hover:border-text-muted/50 shadow-sm",
              item.type === 'heading' && !item.removed && "border-l-4 border-l-orp"
            )}
          >
            <div className={clsx(
              "text-sm leading-relaxed",
              item.type === 'heading' ? "font-bold text-base text-text" : "text-text-muted",
              item.removed && "line-through"
            )}>
              {item.text}
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-mono text-text3 uppercase tracking-wider">
                {item.text.split(/\s+/).length} words
              </span>
              <button 
                className={clsx(
                  "p-1.5 rounded-full transition-colors",
                  item.removed 
                    ? "text-orp bg-orp/10 hover:bg-orp/20" 
                    : "text-text3 hover:text-red-500 hover:bg-red-500/10"
                )}
              >
                {item.removed ? <RotateCcw size={14} /> : <X size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
