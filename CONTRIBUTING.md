# 🤝 Contributing to Session Switcher 2

Thank you for your interest in contributing! This guide will help you get started.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [AI-Assisted Development](#ai-assisted-development)
- [Style Guide](#style-guide)

---

## 📜 Code of Conduct

- **Be respectful** — treat all contributors with kindness
- **Constructive feedback** — focus on ideas, not people
- **Inclusive language** — avoid discriminatory terms
- **Security first** — report vulnerabilities privately (see [SECURITY.md](SECURITY.md))

---

## 🛠️ How Can I Contribute?

### 🐛 Reporting Bugs

1. **Search existing issues** — bug might already be reported
2. **Create new issue** with:
   - Clear title (e.g., "Session restore fails on Firefox 115")
   - Steps to reproduce
   - Expected vs. actual behavior
   - Browser version + OS
   - Console errors (if any)

**Template:**
```markdown
**Bug Description:** Sessions don't restore on Instagram

**Steps to Reproduce:**
1. Save session on instagram.com
2. Switch to another session
3. Switch back

**Expected:** Should restore login
**Actual:** Stays logged out

**Environment:**
- Browser: Chrome 120.0.6099.109
- OS: Windows 11
- Extension version: 1.10.0

**Console Errors:**
[paste error logs here]
```

---

### 💡 Suggesting Features

1. **Check [AI_INTEGRATION.md](AI_INTEGRATION.md)** — might already be planned
2. **Open Discussion** (not issue) to gather feedback first
3. **Explain use case** — why is this useful?
4. **Consider alternatives** — are there simpler solutions?

---

### 🔧 Code Contributions

We welcome:
- Bug fixes
- Performance improvements
- Browser compatibility fixes
- UI/UX enhancements
- AI-powered features (see [AI_INTEGRATION.md](AI_INTEGRATION.md))
- Documentation improvements
- Test coverage

**Good first issues:** Look for `good-first-issue` label on [Issues](https://github.com/Erzambayu/sessionns-changerr/issues).

---

## 💻 Development Setup

### Prerequisites

- **Node.js 18+** (for linting, not runtime)
- **Git**
- **Chrome/Firefox** (for testing)

### Setup Steps

```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/sessionns-changerr.git
cd sessionns-changerr

# 3. Add upstream remote
git remote add upstream https://github.com/Erzambayu/sessionns-changerr.git

# 4. Install dev dependencies
npm install

# 5. Validate setup
npm run check
```

### Load Extension (Development)

**Chrome:**
1. `chrome://extensions/` → Enable Developer Mode
2. Click "Load unpacked" → select repo folder
3. Make changes → click Refresh (🔄) icon

**Firefox:**
1. `about:debugging#/runtime/this-firefox`
2. "Load Temporary Add-on" → select `manifest.json`
3. Reload on every change

---

## 🧪 Testing

### Manual Testing Checklist

Before submitting PR, test:

- [ ] **Save session** on 3 different sites (Google, GitHub, Twitter)
- [ ] **Switch sessions** — verify cookies/storage restored
- [ ] **New session** — confirm logout + clean state
- [ ] **Edit session** — rename + reorder
- [ ] **Delete session** — confirm removal
- [ ] **Export/Import** — JSON + ZIP formats
- [ ] **PIN protection** — set PIN → verify gated actions
- [ ] **Quick switcher** — `Ctrl+K` → fuzzy search works
- [ ] **Keyboard shortcuts** — `/`, `1-9`, `Esc` work
- [ ] **Firefox-specific** — permission banner, event page
- [ ] **Accessibility** — tab navigation, screen reader (if possible)

### Automated Tests

We use ESLint for code quality:

```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint:fix

# Full validation (manifest + syntax + lint)
npm run check
```

---

## 📝 Submitting Changes

### Branch Naming

- `fix/short-description` — bug fixes
- `feat/short-description` — new features
- `docs/short-description` — documentation only
- `refactor/short-description` — code cleanup (no behavior change)

**Example:** `fix/instagram-restore-broken`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body> (optional)

<footer> (optional)
```

**Types:**
- `fix:` — bug fix
- `feat:` — new feature
- `docs:` — documentation change
- `refactor:` — code refactor (no behavior change)
- `perf:` — performance improvement
- `test:` — add/update tests
- `chore:` — build/tooling changes

**Examples:**
```
fix(restore): handle Instagram IndexedDB timeout

Instagram's IDB stores 500MB+ of blob cache. Added per-store 
timeout (1.5s) and skip blob > 256KB to prevent restore hang.

Closes #42
```

```
feat(ai): add smart session suggestions

Analyze user switching patterns (time, domain, frequency) and 
suggest relevant sessions. Uses GPT-4o with 3-result ranking.

Part of #AI_INTEGRATION roadmap Phase 1.
```

### Pull Request Process

1. **Create feature branch**
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make changes + commit**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

3. **Sync with upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. **Push to your fork**
   ```bash
   git push origin feat/your-feature
   ```

5. **Open PR on GitHub**
   - Clear title + description
   - Reference related issues (`Closes #123`)
   - Add screenshots (for UI changes)
   - Check "Allow edits from maintainers"

6. **CI checks must pass**
   - Lint (ESLint)
   - Manifest validation
   - Syntax check

7. **Code review**
   - Maintainer reviews within 3-7 days
   - Address feedback → push new commits
   - PR merged when approved

---

## 🤖 AI-Assisted Development

This project uses **GPT-4o/o1** (via OpenAI Codex for OSS grant) to accelerate development.

### AI-Powered Workflows

**1. Code Review Assistant**
```bash
# Get AI feedback on your changes
git diff main...your-branch | gpt-4o "Review this browser extension code for security, MV3 compliance, and cross-browser compat"
```

**2. Documentation Generation**
```bash
# Auto-generate JSDoc comments
npm run ai:docs  # (coming soon)
```

**3. Test Case Generation**
```bash
# Generate test scenarios for new feature
echo "Feature: Smart session suggestions" | gpt-4o "Generate 10 edge-case test scenarios"
```

**4. Bug Diagnosis**
```bash
# Analyze error logs
cat error.log | gpt-4o "This is a browser extension error. Explain root cause and suggest fix"
```

### AI Contribution Guidelines

When building AI features:

1. **Privacy first** — never send sensitive data (passwords, auth tokens, cookie values)
2. **Opt-in** — AI features disabled by default
3. **Transparency** — show user what data will be sent
4. **Graceful degradation** — extension works 100% offline if AI unavailable
5. **Cost awareness** — cache responses, rate limit API calls
6. **Modular** — easy to swap OpenAI → Anthropic → local LLM

See [AI_INTEGRATION.md](AI_INTEGRATION.md) for detailed AI roadmap.

---

## 🎨 Style Guide

### JavaScript

- **ES2020+** — use modern syntax (async/await, optional chaining, nullish coalescing)
- **No frameworks** — vanilla JS only (keep extension lightweight)
- **Descriptive names** — `getUserSessions()` not `getData()`
- **Error handling** — always wrap risky operations in try/catch
- **Comments** — explain *why*, not *what*

**Good:**
```js
// Skip Instagram's blob cache — can exceed 500MB and timeout restore
if (storeName.match(/cache|blob|media/i)) {
  continue;
}
```

**Bad:**
```js
// Skip store if name matches regex
if (storeName.match(/cache|blob|media/i)) {
  continue;
}
```

### CSS

- **Custom properties** — use CSS variables for colors/spacing
- **BEM naming** — `.block__element--modifier`
- **Mobile-first** — base styles for small screens, `@media` for desktop
- **No vendor prefixes** — autoprefixer handles this

### Commit Style

- **Atomic commits** — one logical change per commit
- **Present tense** — "Add feature" not "Added feature"
- **Max 72 chars** — first line summary
- **Body optional** — explain complex changes

---

## 📚 Resources

- [Chrome MV3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Firefox WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Web Crypto API (PBKDF2)](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## ❓ Questions?

- **General discussion:** [GitHub Discussions](https://github.com/Erzambayu/sessionns-changerr/discussions)
- **Bug reports:** [GitHub Issues](https://github.com/Erzambayu/sessionns-changerr/issues)
- **Security issues:** Email erzambayu@users.noreply.github.com (private disclosure)

---

## 🙏 Thank You!

Every contribution makes this project better. We appreciate:
- Bug reports
- Feature suggestions
- Code contributions
- Documentation improvements
- Spreading the word

**Happy coding! 🚀**
