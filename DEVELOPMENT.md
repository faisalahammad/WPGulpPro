# WPGulpPro Development Guide

> **Note:** This document was originally created as `AUDIT.md` during the v4.0.0 modernization. It has been converted to a living development guide.

---

## Quick Start

```bash
# Install dependencies
npm install

# Link package globally (for testing)
npm link

# Test the installer
mkdir ~/test-wpgulppro && cd ~/test-wpgulppro
wpgulppro
```

---

## Architecture

### Project Structure

```
WPGulpPro/
├── installer/          # npx wpgulppro entry point
│   ├── index.js       # Main installer script
│   └── utils/
│       ├── handleError.js
│       └── printNextSteps.js
├── WPGulpPro/         # Template files (downloaded to user's project)
│   ├── gulpfile.babel.js
│   ├── package.json
│   └── wpgulp.config.js
├── .github/workflows/ # CI configuration
├── package.json       # Installer package config
└── readme.md
```

### Two Dependency Trees

1. **Installer** (`/package.json`): Runs the `npx wpgulppro` command
2. **Template** (`WPGulpPro/package.json`): Installed in user's WordPress project

---

## Version 4.0.0 Changes

### Node.js Compatibility Matrix

| Node Version | Codename | Status | EOL |
|--------------|----------|--------|-----|
| Node 20 | Iron | ✅ Supported | Apr 2026 |
| Node 22 | Jod | ✅ Supported | Apr 2027 |
| Node 24 | Krypton | ✅ Supported | Apr 2028 |

### Key Dependencies

#### Installer (CJS-compatible)

| Package | Version | Notes |
|---------|---------|-------|
| chalk | ^4.1.2 | Last CJS-compatible |
| execa | ^5.1.1 | Last CJS-friendly |
| ora | ^5.4.1 | Last CJS-friendly |
| download | ^8.0.0 | ESM but works with CJS |
| log-symbols | ^4.1.0 | CJS-compatible |

#### Template (Gulp 4 + Dart Sass)

| Package | Version | Notes |
|---------|---------|-------|
| gulp-sass | ^5.1.0 | Requires `sass` peer |
| sass | ^1.85.0 | Dart Sass (replaces node-sass) |
| @babel/core | ^7.26.9 | Latest v7 |
| browser-sync | ^2.29.3 | Latest v2 |

---

## Development Tasks

### Running Tests

```bash
# Install template dependencies
cd WPGulp
npm install

# Test gulp tasks
npm run styles -- --once
npm run images
npm run js-custom
```

### CI Workflow

GitHub Actions runs on every push:

- Node 20, 22, 24 matrix
- Tests installer and template
- Runs `npm audit`

---

## Making Changes

### Modifying the Installer

1. Edit `installer/index.js`
2. Update URLs if GitHub paths change
3. Test with `npm link`

### Modifying Template Files

1. Edit files in `WPGulpPro/` folder
2. Update `WPGulpPro/package.json` for dependencies
3. Test by running installer

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update installer dependencies
npm update --save

# Update template dependencies (edit WPGulpPro/package.json manually)
```

### Version Numbering

WPGulpPro uses **independent versioning** (does not track original WPGulp):

- v4.0.0: Node 20/22/24 LTS compatibility release
- v4.1.0: Minor features
- v4.0.1: Bug fixes
- v5.0.0: Breaking changes

---

## Publishing

### To npm

```bash
# Login (requires 2FA)
npm adduser

# Dry run first
npm publish --dry-run

# Publish
npm publish
```

### After Publishing

1. Verify on npmjs.com
2. Test: `npx wpgulppro --version`
3. Update GitHub release

---

## Troubleshooting

### Common Issues

**Installer downloads old files:**
- URLs in `installer/index.js` point to wrong branch
- Fix: Update raw GitHub URLs

**node-sass build fails:**
- Ensure `sass` package is in template dependencies
- Remove `node-sass` from package.json

**gulp tasks fail:**
- Check `@babel/register` is installed
- Verify gulpfile uses Gulp 4 syntax

### Debugging the Installer

```bash
# Enable verbose output
DEBUG=* wpgulppro

# Check downloaded files
ls -la

# Verify package.json content
cat package.json
```

---

## Code Style

### Commit Messages

Uses [Emoji Log](https://github.com/ahmadawais/Emoji-Log):

- `🚀 RELEASE:` Version releases
- `🐛 FIX:` Bug fixes
- `👌 IMPROVE:` Improvements
- `📦 NEW:` New features
- `📖 DOC:` Documentation
- `🤖 TEST:` Tests

### JavaScript Standards

- ES6+ (transpiled with Babel)
- CJS module format (installer)
- No global gulp dependency required

---

## Credits

- **Original WPGulp:** Ahmad Awais ([@MrAhmadAwais](https://twitter.com/MrAhmadAwais/))
- **WPGulpPro:** Faisal Ahammad ([@faisalahammadwp](https://twitter.com/faisalahammadwp/))

---

## License

MIT - See LICENSE file for details.
