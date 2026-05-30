import { useState, useRef, useEffect, useCallback } from 'react';
import { getTagColor, getAllTags } from '../utils/tags';
import { darkTheme, lightTheme, type ThemeColors } from '../utils/theme';

interface TagInputProps {
  tags: string[];
  allDocuments: { tags: string[] }[];
  onChange: (tags: string[]) => void;
  isDark: boolean;
}

export function TagInput({ tags, allDocuments, onChange, isDark }: TagInputProps) {
  const theme: ThemeColors = isDark ? darkTheme : lightTheme;
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allTags = getAllTags(allDocuments);
  const suggestions = allTags.filter(
    tag => !tags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
    setSelectedIndex(-1);
    setShowSuggestions(false);
  }, [tags, onChange]);

  const removeTag = useCallback((tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  }, [tags, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      // Confirm tag on Enter, Tab, or comma
      if (inputValue.trim() || selectedIndex >= 0) {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          addTag(suggestions[selectedIndex]);
        } else if (inputValue.trim()) {
          addTag(inputValue);
        }
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showSuggestions && suggestions.length > 0) {
        setShowSuggestions(true);
      } else {
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    if (inputValue) {
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className="flex flex-wrap items-center gap-1.5 w-full px-3 py-1.5 rounded-md text-sm outline-none transition-colors cursor-text"
        style={{
          backgroundColor: theme.inputBg,
          border: `1px solid ${theme.borderColor}`,
          color: theme.primaryText,
          minHeight: 38,
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map(tag => {
          const color = getTagColor(tag, isDark);
          return (
            <span
              key={tag}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium shrink-0 animate-in fade-in zoom-in duration-200"
              style={{
                backgroundColor: color.bg,
                color: color.text,
                border: `1px solid ${color.border}`,
              }}
            >
              {tag}
              <button
                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                className="flex items-center justify-center w-3.5 h-3.5 rounded-sm hover:bg-black/10 transition-colors"
                style={{ color: color.text }}
              >
                ×
              </button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm py-1"
          style={{ color: theme.primaryText, caretColor: theme.accentBlue }}
        />
      </div>

      {showSuggestions && (
        <div
          className="absolute left-0 right-0 top-full mt-1 rounded-md overflow-hidden z-50 shadow-lg animate-in slide-in-from-top-2 duration-200"
          style={{
            backgroundColor: theme.modalBg,
            border: `1px solid ${theme.borderColor}`,
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          {suggestions.map((tag, i) => {
            const color = getTagColor(tag, isDark);
            return (
              <div
                key={tag}
                onClick={() => addTag(tag)}
                onMouseEnter={() => setSelectedIndex(i)}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer"
                style={{
                  backgroundColor: i === selectedIndex ? theme.hoverBg : 'transparent',
                  color: theme.primaryText,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color.bg, border: `1px solid ${color.border}` }}
                />
                <span>{tag}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
