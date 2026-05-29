# Contributing to Article Writer

Thank you for your interest in contributing! This guide will help you navigate the contribution process.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please treat all community members with respect. Any harassment or discrimination will not be tolerated.

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR-USERNAME/Article-Writer.git
cd Article-Writer
npm install
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive names:
- `feature/export-to-docx` ✅
- `fix/preview-scroll-sync` ✅
- `docs/add-architecture` ✅
- `feature/x` ❌

### 3. Make Changes

```bash
npm run dev
```

This starts the dev server at `http://localhost:5173`.

### 4. Run Tests

```bash
# (Test infrastructure to be added)
npm run test
```

### 5. Commit with Clear Messages

```bash
git commit -m "feat: add dark mode toggle

- Adds theme context provider
- Updates CSS variables for light/dark themes
- Persists theme preference to localStorage

Closes #42"
```

**Commit Format:**
- Type: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Scope: optional, e.g., `feat(markdown):`
- Subject: lowercase, imperative, <50 chars
- Body: explain *why*, not *what*
- Footer: reference issues

### 6. Push & Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then [create a PR](https://github.com/acidgreenservers/Article-Writer/compare) with:
- Clear title matching your branch
- Description of changes and motivation
- Reference to related issues ("Closes #42")
- Screenshots/demos for UI changes

## Pull Request Review Process

1. **Automated Checks**
   - Build succeeds (`npm run build`)
   - No TypeScript errors (`npm run typecheck`)
   - Code formatting passes

2. **Human Review**
   - Maintainer reviews for:
     - Alignment with project vision (see [PROJECT.md](./PROJECT.md))
     - Code quality and maintainability
     - Test coverage
     - Documentation
   - Feedback provided, changes requested if needed

3. **Merge**
   - All checks pass
   - At least 1 approval from maintainer
   - PR is squash-merged with clear commit message

## Architecture & Design Guidelines

### Module Organization

Keep related code together:

```
src/features/your-feature/
├── YourComponent.tsx
├── hooks/
│   ├── useYourHook.ts
│   └── __tests__/
│       └── useYourHook.test.ts
├── utils/
│   ├── helper.ts
│   └── __tests__/
│       └── helper.test.ts
└── types.ts
```

### TypeScript Best Practices

✅ **Do:**
```typescript
// Clear types
interface DocumentProps {
  title: string
  content: string
  createdAt: Date
}

function Document({ title, content }: DocumentProps) {
  // ...
}
```

❌ **Don't:**
```typescript
// Implicit any
function process(data) { }

// Generic naming
function doThing(x) { }
```

### Component Guidelines

✅ **Favor functional components** with hooks

✅ **Keep components focused** – one responsibility per component

✅ **Props over global state** – pass data explicitly

✅ **Memoize expensive renders** – use `React.memo` when needed

```typescript
interface EditorProps {
  content: string
  onChange: (content: string) => void
}

const Editor: React.FC<EditorProps> = ({ content, onChange }) => {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export default React.memo(Editor)
```

### Markdown Parser Patterns

When adding new syntax:

1. **Define tokens** in `inlineParser.ts` or `blockParser.ts`
2. **Add test cases** for edge cases (empty input, nested structures)
3. **Update renderer** in `renderer.tsx`
4. **Document** the syntax in README.md

```typescript
// Example: Add strikethrough support
// inlineParser.ts
const STRIKETHROUGH_PATTERN = /~~(.+?)~~/g

// renderer.tsx
case 'strikethrough':
  return <s key={token.id}>{token.content}</s>
```

## Testing

### Unit Tests

Test pure functions and logic:

```typescript
// src/features/markdown/__tests__/blockParser.test.ts
import { parseBlocks } from '../blockParser'

test('parses heading', () => {
  const result = parseBlocks('# Hello')
  expect(result[0].type).toBe('heading')
  expect(result[0].level).toBe(1)
})
```

### Integration Tests

Test workflows:

```typescript
// Test: Write markdown → See preview
test('preview updates on content change', () => {
  const { getByRole, getByText } = render(<App />)
  const textarea = getByRole('textbox')
  
  fireEvent.change(textarea, { target: { value: '# Title' } })
  
  expect(getByText('Title')).toBeInTheDocument()
})
```

## Documentation

### When to Update Docs

- ✅ New features
- ✅ Breaking API changes
- ✅ Architecture decisions (add ADR)
- ✅ Deployment changes

### Where to Document

- **User Docs:** README.md
- **Architecture:** ARCHITECTURE.md
- **Developer Guide:** This file
- **Code:** Inline comments for *why*, not *what*

## Performance Considerations

Before optimizing, measure. Use React DevTools Profiler:

1. Open DevTools → Profiler tab
2. Record a user interaction
3. Identify slow renders
4. Optimize the component

**Common optimizations:**
- Memoize callbacks with `useCallback`
- Memoize values with `useMemo`
- Split large components
- Lazy-load modals

## Security Checklist

Before submitting PRs with user input handling:

- [ ] Input is validated (length, type, format)
- [ ] Output is sanitized (no XSS vectors)
- [ ] No secrets in code (API keys, tokens)
- [ ] No dependencies with known vulnerabilities
- [ ] Data doesn't persist to untrusted sources

See [SECURITY.md](./SECURITY.md) for details.

## Release Process

*Maintainers only*

1. Update version in `package.json` (semantic versioning)
2. Create git tag: `git tag v1.0.0`
3. Push tag: `git push origin v1.0.0`
4. GitHub Actions deploys automatically

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/acidgreenservers/Article-Writer/discussions)
- **Bug?** [Report an Issue](https://github.com/acidgreenservers/Article-Writer/issues)
- **Stuck?** Reach out in a PR comment – we're here to help

## Recognizing Contributors

We maintain a CONTRIBUTORS file. All contributors are credited with:
- GitHub username
- Contribution type (code, docs, design, etc.)
- Link to their profile

---

**Thank you for contributing to Article Writer!** 🚀
