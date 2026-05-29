const TAG_COLORS = [
  { bg: '#1e3a5f', text: '#79c0ff', border: '#2a5a8f' },
  { bg: '#2d4a1e', text: '#7ee787', border: '#3f6a2e' },
  { bg: '#4a2d1e', text: '#ffa657', border: '#6a3f2e' },
  { bg: '#4a1e3a', text: '#ff7eb6', border: '#6a2e5a' },
  { bg: '#1e4a4a', text: '#56d4dd', border: '#2e6a6a' },
  { bg: '#4a3a1e', text: '#f0c040', border: '#6a5a2e' },
  { bg: '#3a1e4a', text: '#d2a8ff', border: '#5a2e6a' },
  { bg: '#1e4a2d', text: '#7ee787', border: '#2e6a3f' },
  { bg: '#4a1e1e', text: '#ff7b72', border: '#6a2e2e' },
  { bg: '#1e2d4a', text: '#79c0ff', border: '#2e3f6a' },
];

const TAG_COLORS_LIGHT = [
  { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' },
  { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
  { bg: '#ccfbf1', text: '#115e59', border: '#5eead4' },
  { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
  { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
  { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
];

export function getTagColor(tagName: string, isDark: boolean = true) {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return isDark ? TAG_COLORS[index] : TAG_COLORS_LIGHT[index];
}

export function getAllTags(documents: { tags: string[] }[]): string[] {
  const tagSet = new Set<string>();
  documents.forEach(doc => {
    doc.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

export function getTagCounts(documents: { tags: string[] }[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  documents.forEach(doc => {
    doc.tags.forEach(tag => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}