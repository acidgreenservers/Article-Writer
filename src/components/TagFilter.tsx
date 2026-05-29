import { getTagColor, getTagCounts } from '../utils/tags';
import type { ThemeColors } from '../utils/theme';

interface TagFilterProps {
  documents: { tags: string[] }[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearFilter: () => void;
  theme: ThemeColors;
}

export function TagFilter({ documents, selectedTags, onToggleTag, onClearFilter, theme }: TagFilterProps) {
  const isDark = theme.mainBg === '#0d1117';
  const tagCounts = getTagCounts(documents);

  if (tagCounts.length === 0) return null;

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.mutedText }}>
          Tags
        </span>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearFilter}
            className="text-xs px-1.5 py-0.5 rounded transition-colors"
            style={{ color: theme.mutedText }}
            onMouseEnter={(e) => { e.currentTarget.style.color = theme.primaryText; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = theme.mutedText; }}
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tagCounts.map(({ name, count }) => {
          const color = getTagColor(name, isDark);
          const isSelected = selectedTags.includes(name);
          return (
            <button
              key={name}
              onClick={() => onToggleTag(name)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: isSelected ? color.bg : 'transparent',
                color: isSelected ? color.text : theme.mutedText,
                border: `1px solid ${isSelected ? color.border : theme.borderColor}`,
                opacity: isSelected ? 1 : 0.7,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = color.bg;
                  e.currentTarget.style.color = color.text;
                  e.currentTarget.style.borderColor = color.border;
                  e.currentTarget.style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.mutedText;
                  e.currentTarget.style.borderColor = theme.borderColor;
                  e.currentTarget.style.opacity = '0.7';
                }
              }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color.text }} />
              {name}
              <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}