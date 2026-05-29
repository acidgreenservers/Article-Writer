# Security Policy

## Overview

Article Writer prioritizes user security and data privacy. This document outlines our security practices, policies, and how to report vulnerabilities responsibly.

## Security Principles

### 1. Data Privacy

- **No Server Processing:** All content stays on the user's device (client-side only)
- **No Tracking:** No analytics, cookies, or telemetry
- **No Accounts:** No login required, no personal data collection
- **Local Storage:** Documents persist only in browser localStorage (user-controlled)

### 2. Input Sanitization

Markdown input is carefully parsed and sanitized to prevent XSS attacks:

```typescript
// ✅ Safe: Markdown is parsed, not eval'd
const ast = parseMarkdown(userInput)
const jsx = renderToReact(ast)  // JSX escapes content

// ❌ Unsafe: Direct HTML injection
const html = userInput  // NEVER do this
```

**Specific Protections:**
- HTML tags in markdown are escaped and displayed as text
- URL protocols are validated (no `javascript:` URIs)
- Event handlers in content are stripped
- Scripts are never executed

### 3. Dependency Security

**Minimal Dependencies = Minimal Attack Surface**

Current dependencies:
- `react@18.2+` – Well-maintained, security patches prioritized
- `vite@5.0+` – Build tool, not runtime dependency
- `typescript@5.3+` – Static type checker, no runtime risk

**Practices:**
- Pin versions to exact semver (no floating versions)
- Automated dependabot alerts for security patches
- Regular audits: `npm audit`
- No deprecated packages

### 4. Build Security

**GitHub Actions Workflow:**
```yaml
# Uses trusted, verified actions
- uses: actions/checkout@v4       # Verified, signed
- uses: actions/setup-node@v4     # Verified, signed
- uses: actions/upload-pages-artifact@v3
- uses: actions/deploy-pages@v4   # Official
```

**Build Integrity:**
- Source code is auditable (public repo)
- Build process is transparent (see `.github/workflows/deploy-pages.yml`)
- Artifacts are served directly from GitHub
- No build secrets (no API keys, no auth tokens)

## Security Best Practices for Users

### 1. Browser Security

- Keep your browser updated
- Use HTTPS (GitHub Pages enforces this)
- Clear cookies/cache if concerned about persistence

### 2. Exporting Content

- Exported files are generated client-side (no server processing)
- PDFs are created by your browser's print engine
- HTML is sanitized before export
- Downloaded files are your responsibility to secure

### 3. Document Storage

- Documents stored in localStorage are encrypted if HTTPS is used (browser automatic)
- Clear localStorage if using shared devices: Settings → Clear Browsing Data
- Export and backup important documents

## Threat Model

### In Scope (We Protect Against)

✅ **XSS via Markdown:** Markdown cannot execute scripts
✅ **URL Injection:** URLs are validated before creating links
✅ **Dependency Vulnerabilities:** We audit and patch regularly
✅ **Man-in-the-Middle:** GitHub Pages uses HTTPS with HSTS

### Out of Scope (User Responsibility)

❌ **Malicious Browser Extensions:** Extensions run with full device access
❌ **Compromised Device:** If your OS is compromised, no app can be trusted
❌ **Weak Passwords:** Document encryption depends on secure browser practices
❌ **Social Engineering:** No technical control can prevent user manipulation

## Code Security Guidelines

### For Contributors

When submitting code, ensure:

1. **No eval() or Function() constructors**
   ```typescript
   // ❌ Never
   eval(userInput)
   new Function(userInput)()
   
   // ✅ Instead
   parseAndValidate(userInput)
   ```

2. **Sanitize rendered content**
   ```typescript
   // ✅ Safe: React escapes by default
   <div>{userContent}</div>
   
   // ❌ Unsafe: dangerouslySetInnerHTML
   <div dangerouslySetInnerHTML={{ __html: userContent }} />
   ```

3. **Validate URLs**
   ```typescript
   function isValidUrl(url: string): boolean {
     try {
       const parsed = new URL(url)
       return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
     } catch {
       return false
     }
   }
   ```

4. **No sensitive data in logs**
   ```typescript
   // ❌ Avoid
   console.log('User document:', fullContent)
   
   // ✅ Instead
   console.log('Document loaded: length', content.length)
   ```

5. **Test with malicious input**
   ```typescript
   // Test vectors
   const maliciousInputs = [
     '<script>alert("xss")</script>',
     'javascript:alert(1)',
     '<img src=x onerror="alert(1)">',
     '[link](javascript:alert(1))',
   ]
   ```

## Incident Response

### Reporting Security Vulnerabilities

**Please do NOT open public issues for security vulnerabilities.**

Instead:

1. **Email:** security@acidgreenservers.dev (or check GitHub Security tab)
2. **Include:**
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if applicable)

3. **Timeline:**
   - We aim to acknowledge within 48 hours
   - We'll investigate and provide timeline
   - We'll credit you in security advisory (unless you prefer anonymity)

### Responsible Disclosure

We ask that you:
- Give us reasonable time to fix (30 days standard)
- Don't disclose publicly until we've released a fix
- Don't exploit the vulnerability beyond proof-of-concept
- Act in good faith

### Our Commitment

- Transparent communication throughout the process
- Timely patches and releases
- Security advisories on GitHub
- Credit to reporter (with permission)

## Security Roadmap

### Current (Q2 2026)

✅ Markdown XSS protection
✅ HTTPS enforcement
✅ Dependency auditing
✅ Input validation

### Planned (Q3-Q4 2026)

🔜 **Content Security Policy (CSP)** – Stricter browser protections
🔜 **Subresource Integrity (SRI)** – Verify external resources
🔜 **Security Headers** – HSTS, X-Frame-Options, etc.
🔜 **Automated Security Testing** – SAST/DAST in CI/CD
🔜 **Third-party Audit** – Independent security review

## Compliance

- **GDPR:** No data collection, no compliance needed
- **CCPA:** No personal data, no compliance needed
- **WCAG 2.1:** Accessibility audit in progress
- **OWASP Top 10:** Addressed in design and testing

## Security Audit Checklist

### Before Each Release

- [ ] `npm audit` shows no critical vulnerabilities
- [ ] Dependencies are up-to-date
- [ ] No secrets in code (check with `git secrets`)
- [ ] All user input is validated
- [ ] URLs are sanitized
- [ ] No unsafe HTML rendering
- [ ] Security headers are set
- [ ] HTTPS is enforced
- [ ] CSP policy is present

## Questions or Concerns?

Reach out via:
- **GitHub Issues** (for non-sensitive topics)
- **GitHub Discussions** (for questions)
- **Email** (for security concerns)

---

**Last Updated:** 2026-05-29
**Version:** 1.0
