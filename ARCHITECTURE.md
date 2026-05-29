# Architecture

## System Overview

Article Writer is a client-side markdown editor built on a modular, layered architecture. The system separates concerns across three primary domains: parsing, rendering, and UI.

```
┌─────────────────────────────────────┐
│      User Interface Layer           │
│  (Editor, Toolbars, Modals)         │
├─────────────────────────────────────┤
│      State & Control Layer          │
│  (App.tsx, Hooks, Context)          │
├─────────────────────────────────────┤
│   Processing Layer                  │
│  (Markdown Parsing & Rendering)     │
├─────────────────────────────────────┤
│      Utility Layer                  │
│  (Document Utils, Types, DB)        │
└─────────────────────────────────────┘
```

## Core Modules

### 1. Markdown Feature (`src/features/markdown/`)

Responsible for parsing markdown syntax and rendering to React components.

#### **inlineParser.ts**
- Tokenizes inline markdown (bold, italic, links, code)
- Processes character-level patterns: `**bold**`, `*italic*`, `` `code` ``
- Returns structured token stream for renderer

#### **blockParser.ts**
- Parses block-level markdown (headings, paragraphs, lists, code blocks)
- Maintains state for nested structures (lists, quotes)
- Outputs abstract syntax tree (AST)

#### **renderer.tsx**
- Converts AST tokens to React components
- Handles syntax highlighting for code blocks
- Bridges parsed markdown to visual UI

#### **exporters.ts**
- Converts markdown to alternative formats:
  - HTML (for web distribution)
  - PDF (via print-to-PDF)
  - Markdown (preserves formatting)

### 2. Editor Feature (`src/features/editor/`)

UI components for the editing experience.

#### **Editor.tsx**
- Main textarea input component
- Handles text input, selection, cursor position
- Manages undo/redo state

#### **Toolbar.tsx**
- Action buttons (export, undo, settings)
- Format shortcuts (bold, italic, heading)
- Integrates with modals for advanced features

#### **Sidebar.tsx**
- Navigation or document outline
- Document metadata display

#### **StatusBar.tsx**
- Word count, character count
- Line and column position
- Document info

#### **PreviewPanel.tsx**
- Real-time preview of rendered markdown
- Side-by-side split view
- Scroll synchronization (optional)

#### **ExportModal.tsx**
- Format selection (HTML, PDF, Markdown)
- Export options and metadata
- Download trigger

### 3. Components (`src/components/`)

Reusable UI primitives.

- **ImagePanel.tsx** – Image upload/preview interface
- **LinkModal.tsx** – URL entry form with validation
- **ConfirmModal.tsx** – Generic confirmation dialog

### 4. Types (`src/types/`)

Global TypeScript definitions ensuring type safety across modules.

### 5. Utils (`src/utils/`)

- **documentUtils.ts** – Document creation, saving, loading
- **db.ts** – LocalStorage or IndexedDB persistence layer

## Data Flow

### Write Path

```
User Input (textarea)
    ↓
Editor.tsx (state update)
    ↓
App.tsx (state management)
    ↓
PreviewPanel.tsx receives markdown
    ↓
markdown/blockParser.ts (tokenize)
    ↓
markdown/inlineParser.ts (inline tokens)
    ↓
markdown/renderer.tsx (React components)
    ↓
Browser Render (preview visible)
```

### Export Path

```
User clicks Export
    ↓
ExportModal.tsx (format selection)
    ↓
markdown/exporters.ts (format conversion)
    ↓
Document generation (HTML/PDF/MD)
    ↓
Download (browser native)
```

## State Management

**Current Approach:** React Context + Hooks

- **Document State:** Markdown content, metadata
- **UI State:** Sidebar visibility, modal open/close, selection
- **Undo/Redo:** History stack in context

**Future:** Redux or Zustand for complex workflows

## Deployment Architecture

### GitHub Pages Pipeline

```
Git Push (main)
    ↓
GitHub Actions Trigger
    ↓
Checkout Code
    ↓
Install Dependencies (npm ci)
    ↓
Build (vite build) → dist/
    ↓
Upload Pages Artifact
    ↓
Deploy to GitHub Pages
    ↓
https://acidgreenservers.github.io/Article-Writer/
```

**Base Path:** `/Article-Writer/` (configured in `vite.config.ts`)

## Performance Considerations

1. **Debounced Preview** – Preview updates debounced to prevent excessive re-renders
2. **Code Splitting** – Vite automatically chunks large features
3. **Lazy Loading** – Modals loaded on-demand
4. **CSS Optimization** – Tree-shaking unused styles

## Extension Points

### Adding a New Export Format

1. Create handler in `exporters.ts`
2. Add format option to `ExportModal.tsx`
3. Wire export button to handler

### Adding Custom Markdown Syntax

1. Define token pattern in `inlineParser.ts` or `blockParser.ts`
2. Add renderer case in `renderer.tsx`
3. Test with integration tests

### Adding Toolbar Features

1. Create feature component
2. Wire action to `Toolbar.tsx` button
3. Update Editor state via callback

## Security

See [SECURITY.md](./SECURITY.md) for details on:
- Input sanitization
- XSS prevention
- Safe markdown rendering

## Testing Strategy

- **Unit:** Parser, exporter functions
- **Integration:** Editor → Preview flow
- **E2E:** User workflows (write → export → download)

## Future Enhancements

- Collaborative editing (WebSocket)
- Plugin system for custom markdown extensions
- Advanced export (DOCX, EPUB)
- Version history with git integration
