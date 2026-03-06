# WPGulpPro Technical Specification

**Version:** 4.0.0
**Date:** 2026-03-06
**Status:** Released
**Maintainer:** Faisal Ahammad (@faisalahammad)

---

## Executive Summary

WPGulpPro is the evolution of [WPGulp](https://github.com/ahmadawais/WPGulp) by Ahmad Awais. This fork modernizes the original WordPress Gulp workflow with:

- **Node 20/22/24 LTS compatibility**
- **Dart Sass migration** (replacing deprecated node-sass)
- **Updated dependencies** (chalk v4, execa v5, ora v5)
- **Bug fixes** (swapped utility files corrected)
- **Independent versioning** (no longer tracking original WPGulp versions)

---

## Product Positioning

### Market Position

WPGulpPro is positioned as the **successor** to WPGulp, maintaining the zero-config philosophy while modernizing the underlying technology stack.

### Messaging

> "WPGulpPro is the evolution of WPGulp"

Not "a fork" or "a copy" — but the natural continuation of the project with active maintenance.

### Attribution

Simple attribution to original author:
- Ahmad Awais credited in readme header
- Link to original repository provided
- License file contains dual copyright

---

## Architecture

### Project Structure

```
WPGulpPro/
├── installer/              # npx wpgulppro entry point
│   ├── index.js           # Main installer script
│   └── utils/
│       ├── handleError.js      # Error handler utility
│       └── printNextSteps.js   # Post-install instructions
├── WPGulpPro/            # Template files downloaded to user's project
│   ├── .editorconfig
│   ├── .eslintignore
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── .nvmrc             # Node version (lts/*)
│   ├── gulpfile.babel.js  # Gulp 4 tasks with Dart Sass
│   ├── package.json       # Template dependencies
│   ├── package-lock.json
│   └── wpgulp.config.js   # User configuration
├── .github/
│   └── workflows/
│       └── test.yml       # CI workflow (Node 20/22/24 matrix)
├── .npmignore             # Files excluded from npm publish
├── .nvmrc                 # Node version (lts/*)
├── DEVELOPMENT.md         # Development guide
├── LICENSE                # MIT with dual copyright
├── changelog.md           # Version history
├── package.json           # Installer package config
├── readme.md              # User documentation
└── code-of-conduct.md     # Community guidelines
```

### Two Dependency Trees

1. **Installer** (`/package.json`)
   - Purpose: Runs the `npx wpgulppro` command
   - Dependencies: chalk, execa, ora, download, etc.
   - Format: CommonJS (CJS)

2. **Template** (`WPGulpPro/package.json`)
   - Purpose: Installed in user's WordPress project
   - Dependencies: gulp, sass, @babel/core, browser-sync, etc.
   - Format: CommonJS (CJS)

---

## Technical Decisions

### 1. Module System: CommonJS (CJS)

**Decision:** Keep CJS throughout both installer and template.

**Rationale:**
- Gulp 4 uses CJS by default
- Most WordPress developers are familiar with CJS
- Lower barrier to entry than ESM
- No `.mjs` extension complexity

**Tradeoffs:**
- Cannot use latest ESM-only packages (chalk v5, ora v8)
- Must pin to CJS-compatible versions

### 2. Sass Compiler: Dart Sass

**Decision:** Migrate from `node-sass` to `sass` (Dart Sass).

**Rationale:**
- `node-sass` is deprecated and unmaintained
- `node-sass` fails to build on Node 20+ (Python 2 requirement)
- Dart Sass is official Sass implementation
- Drop-in replacement for most use cases

**Implementation:**
```javascript
const sass = require('gulp-sass')(require('sass'));
```

### 3. Node.js Version: >=20.0.0

**Decision:** Require Node 20 or higher.

**Rationale:**
- Node 18 reaches EOL April 2025
- Node 20/22/24 are active/maintenance LTS
- Modern JavaScript features available
- Security updates guaranteed

**Engine Guard:**
```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### 4. Dependency Strategy

#### Installer (CJS-Compatible)

| Package | Version | Rationale |
|---------|---------|-----------|
| chalk | ^4.1.2 | Last CJS version |
| execa | ^5.1.1 | Last CJS-friendly |
| ora | ^5.4.1 | Last CJS version |
| download | ^8.0.0 | ESM but works with CJS |
| log-symbols | ^4.1.0 | CJS-compatible |
| clear-any-console | ^1.16.3 | Latest available |
| cli-check-node | ^1.3.4 | Unmaintained, functional |
| cli-handle-unhandled | ^1.1.1 | Unmaintained, functional |

#### Template (Gulp 4 + Dart Sass)

| Package | Version | Rationale |
|---------|---------|-----------|
| gulp | ^4.0.2 | Stable, CJS-compatible |
| gulp-sass | ^5.1.0 | Requires `sass` peer |
| sass | ^1.85.0 | Dart Sass compiler |
| @babel/core | ^7.26.9 | Latest v7 |
| @babel/preset-env | ^7.26.9 | Latest v7 |
| browser-sync | ^2.29.3 | Latest v2 (v3 has breaking changes) |
| gulp-autoprefixer | ^8.0.0 | CJS-compatible |
| gulp-imagemin | ^7.1.0 | v8+ is ESM-only |

### 5. Image Optimization: Smart Detection

**Decision:** Use `gulp-imagemin` v7 with smart detection.

**Rationale:**
- v8+ is ESM-only (would require ESM wrapper)
- v7 has vulnerabilities but acceptable for dev tool
- Smart detection skips unsupported formats

**Tradeoffs:**
- WebP/AVIF support limited
- npm audit shows vulnerabilities (acceptable risk)

### 6. Versioning: Independent

**Decision:** WPGulpPro uses independent versioning.

**Rationale:**
- Original WPGulp is unmaintained (since 2019)
- No upstream changes to track
- Flexibility for breaking changes
- Clear differentiation from original

**Version Scheme:**
- v4.0.0: Node 20/22/24 LTS compatibility release
- v4.X.0: Minor features
- v4.0.X: Bug fixes
- v5.0.0: Breaking changes

### 7. npm Distribution: Package Only

**Decision:** Distribute via npm only, not WordPress.org.

**Rationale:**
- npm is standard for build tools
- WordPress.org plugin directory is for plugins/themes
- Simpler update workflow
- Smaller maintenance burden

### 8. Error Handling: Silent Fallback

**Decision:** Use silent fallback for network failures.

**Rationale:**
- Less noise in console
- Users care about results, not process
- Errors shown only when critical

**Implementation:**
```javascript
try {
    await Promise.all(filesToDownload.map(x => download(x, CWD)));
    spinner.succeed(`DOWNLOADED WPGulp files`);
} catch (error) {
    handleError(error);
}
```

---

## User Experience

### Installation Flow

1. User runs `npx wpgulppro` in their theme/plugin folder
2. Installer downloads 7 files from GitHub
3. Dotfiles are renamed (editorconfig → .editorconfig)
4. npm install runs to install template dependencies
5. Success message with next steps displayed

### Alternative Installation (Pre-npm)

Since the npm package is not yet published:

1. **GitHub Install:** `npm install faisalahammad/WPGulp`
2. **npm link:** Clone repo → `npm link` → run `wpgulppro`
3. **ZIP Download:** Download from GitHub → extract → `npm install`

### Error Messages

| Error | Message | Resolution |
|-------|---------|------------|
| Node < 20 | "Requires Node 20 or higher" | Upgrade Node |
| Network failure | "Failed to download files" | Check internet, retry |
| npm install fails | "Command failed with exit code 1" | Check npm/node-sass |
| Gulp task fails | "Cannot find module" | Run `npm install` |

---

## Development Workflow

### Testing

```bash
# Install dependencies
npm install

# Link globally
npm link

# Test installer
mkdir ~/test-wpgulppro && cd ~/test-wpgulppro
wpgulppro

# Test gulp tasks
npm run styles -- --once
npm run images
npm run js-custom
```

### CI/CD

GitHub Actions runs on every push:

```yaml
name: Test on Node LTS Versions
on: [push, pull_request]
jobs:
  test:
    strategy:
      matrix:
        node-version: [20, 22, 24]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm install --prefix WPGulp
      - run: npx gulp styles --once --prefix WPGulp
```

### Commit Messages

Uses [Emoji Log](https://github.com/ahmadawais/Emoji-Log):

- `🚀 RELEASE:` Version releases
- `🐛 FIX:` Bug fixes
- `👌 IMPROVE:` Improvements
- `📦 NEW:` New features
- `📖 DOC:` Documentation
- `🤖 TEST:` Tests
- `‼️ BREAKING:` Breaking changes

---

## Known Issues & Limitations

### 1. npm Package Unpublished

**Status:** Temporary
**Impact:** Users cannot use `npx wpgulppro` directly
**Workaround:** Use GitHub install or npm link

### 2. Image Format Support

**Status:** Known limitation
**Impact:** WebP/AVIF optimization may fail
**Workaround:** Use external image optimization

### 3. Transitive Dependencies

**Status:** Known issue
**Impact:** npm audit shows 52 vulnerabilities
**Rationale:** From gulp, browser-sync (transitive)
**Risk:** Low (dev dependency, not production)

---

## Future Roadmap

### v4.1.0 (Planned)

- [ ] Add ESLint + Prettier pre-configured
- [ ] Add optional TypeScript support
- [ ] Add Tailwind CSS integration option
- [ ] Improve error messages

### v4.2.0 (Considered)

- [ ] Block theme support (theme.json)
- [ ] WebP/AVIF image support
- [ ] PostCSS plugin integration
- [ ] CSS Minification alternatives

### v5.0.0 (Future)

- [ ] ESM support (optional)
- [ ] Gulp 5 compatibility
- [ ] Vite as alternative to Gulp
- [ ] Monorepo support

---

## Specification Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-03-06 | 1.0.0 | Initial specification |
| 2026-03-06 | 1.0.1 | Added npm workaround section |
| 2026-03-06 | 1.0.2 | Updated social links |

---

## References

- [WPGulp Original](https://github.com/ahmadawais/WPGulp)
- [Dart Sass Documentation](https://sass-lang.com/dart-sass)
- [Gulp 4 Documentation](https://gulpjs.com/)
- [Node.js LTS Schedule](https://nodejs.org/en/about/previous-releases)
- [npm CLI Documentation](https://docs.npmjs.com/cli)

---

## Approval

**Spec Author:** Claude Opus 4.6 (AI Assistant)
**Spec Approved By:** Faisal Ahammad (@faisalahammad)
**Implementation Status:** ✅ Complete
