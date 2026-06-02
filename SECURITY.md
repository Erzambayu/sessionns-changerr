# 🔒 Security Policy

## 🛡️ Supported Versions

We actively maintain security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.10.x  | ✅ Current stable  |
| 1.9.x   | ✅ Maintenance     |
| 1.8.x   | ⚠️ Critical fixes only |
| < 1.8.0 | ❌ End of life     |

**Current version:** v1.10.0

---

## 🚨 Reporting a Vulnerability

**Please DO NOT open public issues for security vulnerabilities.**

We take security seriously. If you discover a security issue, report it privately:

### Preferred Method: Email

📧 **Email:** erzambayu@users.noreply.github.com

**Subject:** `[SECURITY] Brief vulnerability description`

**Include:**
- Vulnerability description
- Steps to reproduce
- Impact assessment (data leak, XSS, privilege escalation, etc.)
- Affected versions
- Proof of concept (if available)
- Your contact info (for follow-up)

---

## ⏱️ Response Timeline

| Stage | Timeline |
|-------|----------|
| **Initial acknowledgment** | Within 48 hours |
| **Impact assessment** | Within 5 business days |
| **Fix development** | 7-14 days (depends on severity) |
| **Patch release** | Within 21 days for critical issues |
| **Public disclosure** | After patch deployed (coordinated disclosure) |

We'll keep you informed throughout the process.

---

## 🎯 Security Scope

### ✅ In Scope

We actively address vulnerabilities in:

- **Cookie/storage data leaks** — unauthorized access to saved sessions
- **XSS (Cross-Site Scripting)** — malicious script injection via session names, notes, or imported data
- **Authentication bypass** — PIN protection circumvention
- **Privilege escalation** — exploiting permissions to access unintended domains
- **Cryptographic weaknesses** — PBKDF2 implementation flaws, weak salt generation
- **Data exfiltration** — leaking session data to third parties
- **Incognito/container isolation bypass** — session leakage across contexts
- **Extension API abuse** — misuse of `chrome.cookies`, `chrome.storage`, `chrome.scripting`
- **Import/Export vulnerabilities** — arbitrary code execution, path traversal, ZIP bombs

### ⚠️ Out of Scope

The following are NOT considered security issues:

- **Phishing attacks** — user social engineering (extension can't prevent this)
- **User misconfiguration** — disabling PIN, exporting to untrusted storage
- **Browser vulnerabilities** — bugs in Chrome/Firefox itself (report to browser vendors)
- **Physical access attacks** — attacker with device access bypassing OS locks
- **Denial of service** — resource exhaustion, storage quota abuse (mitigations exist)
- **Third-party website behavior** — sites blocking session switching, CAPTCHA triggers

---

## 🛠️ Security Features

### Current Protections

- **🔐 PBKDF2 PIN hashing** — SHA-256, 200K iterations, per-install random salt (v1.8.0+)
- **♿ XSS mitigation** — DOM-based rendering with `createElement` / `setAttribute`, no `innerHTML` injection (v1.8.0+)
- **🔒 PIN-gated actions** — switch, delete, rename, export, clear require PIN verification
- **⏱️ Auto-lock timeout** — configurable re-authentication (1m / 5m / 15m / 1h)
- **🚫 Sanity checks** — auto-refresh aborts if cookie count drops >70% (prevents data loss)
- **🔓 Firefox permission isolation** — runtime `<all_urls>` grant, no blanket access
- **📦 Input validation** — imported JSON/ZIP sanitized, no arbitrary code execution
- **🧹 No telemetry** — 100% local-first, no data sent to external servers

### Known Limitations

- **🔐 PIN is not encryption** — stored sessions are plaintext in `chrome.storage.local`. PIN gates actions, but doesn't encrypt data. Physical disk access bypasses this.
- **🍪 Cookie exfiltration risk** — malicious website on same domain can read cookies we restore. Use caution with untrusted sites.
- **📦 Export security** — exported backups contain plaintext cookies/tokens. Store securely (password-protected archives, encrypted drives).
- **🦊 Firefox MV3 permission banner** — users can accidentally revoke `<all_urls>`, breaking session restore. Not a security flaw, but UX footgun.

---

## 📜 Past Security Issues

### v1.8.0 (2026-05-15) — Critical XSS Fix

**Issue:** HTML injection in session list rendering  
**Impact:** Imported session names with `<script>` tags could execute arbitrary JavaScript in popup context  
**Fix:** Migrated to `createElement` + `setAttribute` rendering  
**Credit:** Internal security audit  
**CVE:** None assigned (pre-disclosure patch)

### v1.8.0 (2026-05-15) — Auto-refresh Data Loss

**Issue:** Auto-refresh overwrote saved sessions when user logged out  
**Impact:** Session data permanently lost if cookie count dropped (logout detection failed)  
**Fix:** Sanity check aborts refresh if cookie count drops >70% or becomes empty  
**Credit:** Community bug report (#34)

### v1.7.0 (2026-04-20) — Incognito Cookie Leak

**Issue:** `getCookiesForDomain` iterated all cookie stores, including incognito  
**Impact:** Private browsing cookies could leak into normal mode sessions  
**Fix:** Use tab's `cookieStoreId` for targeted store access  
**Credit:** Internal testing

---

## 🔍 Security Best Practices for Users

1. **Set a strong PIN** — 6 digits minimum, avoid patterns (1234, 1111)
2. **Enable auto-lock** — use 1-5 minute timeout for shared computers
3. **Secure backups** — encrypt exported JSON/ZIP files (7-Zip AES-256, VeraCrypt)
4. **Audit sessions regularly** — delete stale/unused sessions to minimize exposure
5. **Avoid untrusted sites** — don't save sessions for sketchy domains (session hijacking risk)
6. **Update promptly** — install security patches ASAP when notified

---

## 🤝 Coordinated Disclosure

We follow [ISO/IEC 29147:2018](https://www.iso.org/standard/72311.html) coordinated disclosure:

1. **Private report** — via email (above)
2. **Assessment + fix** — internal development (no public details)
3. **Patch release** — version bump with generic changelog ("security improvements")
4. **Public disclosure** — 30 days after patch (or when 90% adoption reached)
5. **Credit** — reporter credited in release notes (unless anonymous requested)

---

## 📚 Security Resources

- [Chrome Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)
- [OWASP Browser Extension Security](https://cheatsheetseries.owasp.org/cheatsheets/Browser_Extension_Security_Cheat_Sheet.html)
- [Web Crypto API Security Considerations](https://www.w3.org/TR/WebCryptoAPI/#security-considerations)
- [Mozilla Add-on Security Review Guidelines](https://extensionworkshop.com/documentation/publish/add-on-policies/)

---

## ❓ Questions?

- **General security questions:** GitHub Discussions
- **Vulnerability reports:** erzambayu@users.noreply.github.com (private)
- **Development security:** See [CONTRIBUTING.md](CONTRIBUTING.md) AI-assisted code review

**Stay secure! 🔒**
