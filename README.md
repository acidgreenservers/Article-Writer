# Article Writer

A professional-grade markdown editor with real-time preview, export capabilities, and a intuitive UI for writing and publishing articles.

## Features

- **Live Preview** – Real-time markdown rendering as you write
- **Rich Export** – Export to HTML, PDF, and formatted markdown
- **Syntax Highlighting** – Full markdown syntax support with custom inline/block parsing
- **Image Management** – Embedded image panel for media organization
- **Modal Forms** – Streamlined link and image insertion workflows
- **Responsive Design** – Works seamlessly across desktop and tablet
- **Zero Dependencies** – Built with vanilla TypeScript + React, minimal bundle size

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
git clone https://github.com/acidgreenservers/Article-Writer.git
cd Article-Writer
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

Production-optimized build outputs to `dist/`.

### Preview Build

```bash
npm run preview
```

## Deployment

This project is configured for **GitHub Pages** deployment via GitHub Actions.

1. Push to the `main` branch
2. GitHub Actions automatically builds and deploys to `https://acidgreenservers.github.io/Article-Writer/`

See [ARCHITECTURE.md](./ARCHITECTURE.md) for deployment details.

## Project Structure

```
src/
├── features/
│   ├── markdown/          # Markdown parsing & rendering
│   │   ├── inlineParser.ts
│   │   ├── blockParser.ts
│   │   ├── renderer.tsx
│   │   └── exporters.ts
│   └── editor/            # Editor UI components
│       ├── Editor.tsx
│       ├── Toolbar.tsx
│       ├── Sidebar.tsx
│       ├── StatusBar.tsx
│       ├── PreviewPanel.tsx
│       └── ExportModal.tsx
├── components/            # Reusable UI components
│   ├── ImagePanel.tsx
│   ├── ConfirmModal.tsx
│   └── LinkModal.tsx
├── types/                 # TypeScript type definitions
├── utils/                 # Helper utilities
├── App.tsx                # Root component
├── main.tsx               # Entry point
└── index.css              # Global styles
```

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** – System design, data flow, and extension points
- **[PROJECT.md](./PROJECT.md)** – Project purpose, vision, and strategic roadmap
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** – Developer guidelines and contribution workflow
- **[SECURITY.md](./SECURITY.md)** – Security posture and vulnerability reporting

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions

## License

MIT License © 2026 acidgreenservers. See [LICENSE](./LICENSE) for details.

## Support

For issues, questions, or suggestions, open a [GitHub Issue](https://github.com/acidgreenservers/Article-Writer/issues).
