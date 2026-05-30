# Article Writer

A robust, topologically smooth markdown editor with local persistence.

## Architecture

- **`src/db/`**: Unified IndexedDB layer with a resilient versioned migration system.
- **`src/hooks/`**: Core application logic and state management (e.g., `useDocuments`).
- **`src/components/`**: UI components built with React and Tailwind CSS.
- **`tests/`**: Comprehensive test suite using Vitest and React Testing Library.

## Stability Features

- **Versioned Migrations**: Handles schema updates gracefully without data loss.
- **Auto-Save**: Background persistence with state tracking.
- **Memory Safety**: Automatic cleanup of Blob URLs and event listeners.
- **Strong Typing**: Hardened TypeScript interfaces for documents and images.

## Development

```bash
npm install
npm run dev
npm test
```
