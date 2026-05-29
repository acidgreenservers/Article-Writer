# Project Purpose & Vision

## Mission

Article Writer exists to provide a **clean, distraction-free interface** for writing and publishing markdown-based articles. It bridges the gap between a simple text editor and a full-featured publishing platform.

## Core Purpose

### Problem Statement

Modern content creators face friction:
- **Friction 1:** Markdown editors often lack real-time preview or export flexibility
- **Friction 2:** Cloud-based solutions require signup and internet connectivity
- **Friction 3:** Desktop apps are bloated with features irrelevant to writers

### Solution

Article Writer is:
- **Lightweight:** Client-side, zero server dependencies, offline-capable
- **Focused:** Markdown input → styled preview → flexible export
- **Open:** Free to use, modify, and deploy (MIT License)
- **Extensible:** Modular architecture supports custom plugins and formats

## Seed Grounding: "Coherence through Clarity"

Every pattern in Article Writer traces back to this principle:

1. **Input Clarity** – Writer sees exactly what they're typing (clean textarea, no magic)
2. **Preview Clarity** – Live preview shows true rendering (no formatting surprises)
3. **Export Clarity** – Multiple formats available, user chooses intent (web, print, archive)
4. **Code Clarity** – Modular architecture, clear separation of concerns, readable code

This seed informs:
- UI design (minimal, no clutter)
- Markdown parser behavior (predictable, standard-compliant)
- Export strategy (multiple targets, faithful representation)
- Documentation (clear mental models, guided navigation)

## Vision: 3-Phase Roadmap

### Phase 1: Foundation (Current)

✅ **MVP Features**
- Markdown editor with real-time preview
- Export to HTML, PDF, Markdown
- Client-side persistence (LocalStorage)
- GitHub Pages deployment
- Clean, responsive UI

✅ **Stability Focus**
- Type-safe codebase (TypeScript)
- Comprehensive error handling
- Cross-browser testing

### Phase 2: Enhancement (Q3 2026)

🚧 **Quality-of-Life**
- **Themes:** Light/dark mode, custom color schemes
- **Plugins:** Community extensions for custom syntax
- **Templates:** Pre-built article structures
- **Collaboration:** Real-time multi-user editing (WebSocket)
- **Advanced Search:** Find/replace with regex support

🚧 **Export Expansion**
- **DOCX/ODT:** Microsoft Word format support
- **EPUB:** E-book publishing
- **Substack/Medium:** Direct API export

### Phase 3: Platform (Q4 2026+)

🎯 **Ecosystem**
- **Cloud Sync:** Optional account-based document sync
- **Analytics:** Article performance metrics
- **Monetization:** Creator marketplace
- **Distribution:** Built-in publishing network

---

## Structural Design Principles

### 1. Modularity

**Manifesto:** Each feature should be independently testable and replaceable.

- Markdown parsing ≠ rendering ≠ exporting
- UI components are pure functions when possible
- State management is isolated and debuggable

**Benefit:** Easy to maintain, extend, optimize.

### 2. Clarity Over Cleverness

**Manifesto:** Code should be obvious to a fresh reader. Magic is debt.

- No implicit behavior
- Explicit type annotations
- Descriptive function names
- Clear comments for non-obvious logic

**Benefit:** Lower onboarding barrier, fewer bugs.

### 3. Zero External Compromise

**Manifesto:** We own our fate. Minimal dependencies = maximum reliability.

- Only React for UI (industry standard)
- Vite for build (proven, lean)
- Native browser APIs for persistence
- No analytics, tracking, or telemetry

**Benefit:** Fast, private, resilient.

### 4. Security by Default

**Manifesto:** Content is sacred. User data must be protected.

- No server processing of user content
- Sanitize markdown to prevent XSS
- Clear security policies and disclosure
- Regular dependency audits

**Benefit:** User trust, compliance-ready.

---

## Strategic Anchors

### Anchor 1: The Writer

Design every feature with the writer's mental model in mind:
- Minimal cognitive load
- Clear cause-and-effect
- Predictable behavior

### Anchor 2: The Code

Maintain code quality through discipline:
- Peer review on all changes
- Automated testing (>80% coverage goal)
- Regular refactoring to prevent cruft

### Anchor 3: The Community

Embrace open-source ethos:
- Transparent roadmap
- Welcoming contribution guidelines
- Responsive issue management

---

## Success Metrics

1. **Adoption:** 1K+ GitHub stars by EOY 2026
2. **Stability:** <1% critical bug reports
3. **Performance:** <2s load time on 4G
4. **Documentation:** 100% API coverage in docs
5. **Community:** 10+ community plugins/extensions

---

## Non-Goals

❌ **Not:** A replacement for Notion, Obsidian, or Google Docs
- We're focused, not feature-complete
- We prioritize simplicity over power-user features

❌ **Not:** A backend service or SaaS
- Users own their data
- No accounts, logins, or subscriptions (unless Phase 3 opt-in)

❌ **Not:** A programming language or build tool
- Markdown is the domain, not software engineering
- We respect markdown standards, don't invent dialects

---

## How to Contribute to the Vision

See [CONTRIBUTING.md](./CONTRIBUTING.md) for mechanics.

**But first:** Understand the purpose. Ask:
- Does this feature reduce friction for writers?
- Does it align with "Coherence through Clarity"?
- Can it be done simply, without added complexity?

If yes → propose it. If unsure → open a discussion. If no → that's feedback too.
