## 2026-05-30 - [Toolbar Accessibility and Keyboard Navigation]
**Learning:** Icon-only buttons and buttons with brief text (like "B", "I", "H2") are often overlooked in accessibility. Providing 'aria-label' and 'title' attributes is essential for screen readers and user guidance. Additionally, visual hover states should always be mirrored by focus states to ensure keyboard users have equal visual feedback.
**Action:** Always include 'aria-label', 'title', and focus/blur handlers (or 'focus-visible' CSS) for interactive elements to guarantee accessibility and inclusive UX.
