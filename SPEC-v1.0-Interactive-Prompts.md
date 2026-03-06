# WPGulpPro v1.0.0 Interactive Prompts Specification

**Version:** 1.0.0
**Date:** 2026-03-06
**Status:** Implemented
**Supersedes:** SPEC-v2.md (Interactive Prompts section)

---

## Executive Summary

WPGulpPro v1.0.0 introduces an interactive installation experience, transforming the previously silent installer into a conversational CLI that guides users through project configuration. This specification documents the implementation decisions, technical architecture, and user experience design.

---

## 1. Version Reset Rationale

### 1.1 Decision: v4.0.0 → v1.0.0

**Previous Version:** v4.0.0 (inherited from WPGulp modernization)
**New Version:** v1.0.0 (fresh start for WPGulpPro)

**Rationale:**
- WPGulpPro is now a distinct product, not just a fork
- Interactive prompts represent a fundamental UX change
- Clean versioning signals a new beginning
- Easier marketing: "v1.0.0 release" vs "v4.0.0 patch"

**Migration Notes:**
- No breaking changes for existing users (config file names unchanged)
- Changelog continues from v1.0.0 (v4.x documented as "legacy" in changelog intro)
- npm package name remains `wpgulppro`

---

## 2. Technical Architecture

### 2.1 Dependency: prompts Library

**Selected:** `prompts` v2.4.2 (~50KB)

**Alternatives Considered:**
| Library | Size | Pros | Cons | Decision |
|---------|------|------|------|----------|
| `prompts` | ~50KB | Lightweight, modern, ESM-compatible | Less feature-rich than inquirer | ✅ Selected |
| `inquirer` | ~500KB | Most popular, extensive features | Heavy, more dependencies | ❌ Too large |
| `clack` | ~100KB | Beautiful UI, modern | Newer, less battle-tested | ❌ Not stable enough |

**Installation:**
```json
{
  "dependencies": {
    "prompts": "^2.4.2"
  }
}
```

### 2.2 Module Structure

```
installer/
├── index.js              # Main entry point (updated for prompts)
└── utils/
    ├── handleError.js    # Existing error handler
    ├── printNextSteps.js # Existing next steps
    └── collectPrompts.js # NEW: Interactive prompts + generators
```

### 2.3 Installation Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. Welcome Banner                                      │
│     "WPGulpPro Installer - Modern Gulp workflow"        │
├─────────────────────────────────────────────────────────┤
│  2. Project Metadata Prompts                            │
│     • Project name (auto kebab-case)                    │
│     • Description                                       │
│     • Author name                                       │
├─────────────────────────────────────────────────────────┤
│  3. Configuration Prompts                               │
│     • JS source directory                               │
│     • CSS output directory                              │
│     • Enable sourcemaps?                                │
│     • Enable RTL?                                       │
├─────────────────────────────────────────────────────────┤
│  4. Telemetry Prompt (optional)                         │
│     • Share anonymous usage data?                       │
├─────────────────────────────────────────────────────────┤
│  5. Summary & Confirmation                              │
│     • Display all selections                            │
│     • Confirm or cancel                                 │
├─────────────────────────────────────────────────────────┤
│  6. Download & Generate                                 │
│     • Download template files (6 files)                 │
│     • Generate custom package.json                      │
│     • Generate custom wpgulp.config.js                  │
├─────────────────────────────────────────────────────────┤
│  7. Install Dependencies                                │
│     • Run npm install                                   │
├─────────────────────────────────────────────────────────┤
│  8. Save Telemetry Config (if enabled)                  │
│     • Write .wpgulppro-config.json                      │
├─────────────────────────────────────────────────────────┤
│  9. Display Next Steps                                  │
│     • Usage instructions                                │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Prompt Specifications

### 3.1 Project Metadata Prompts

#### Project Name
```javascript
{
  type: 'text',
  name: 'projectName',
  message: 'What is your project name?',
  initial: toKebabCase(defaultDirName),
  format: (val) => toKebabCase(val),
  validate: validateProjectName
}
```

**Validation Rules:**
- Required (non-empty)
- Max 214 characters (npm limit)
- Only lowercase letters, numbers, hyphens
- Cannot start/end with hyphen

**Transformation:**
```
"My WordPress Theme" → "my-wordpress-theme"
"Test_Project" → "test-project"
"WP 2024" → "wp-2024"
```

#### Project Description
```javascript
{
  type: 'text',
  name: 'description',
  message: 'Project description?',
  initial: 'A WordPress project built with WPGulpPro'
}
```

#### Author Name
```javascript
{
  type: 'text',
  name: 'author',
  message: 'Author name?',
  initial: ''  // Empty default - user must enter
}
```

### 3.2 Configuration Prompts

#### JS Source Directory
```javascript
{
  type: 'text',
  name: 'jsDir',
  message: 'JavaScript source directory?',
  initial: 'assets/js',
  validate: (val) => val && val.length > 0 ? true : 'JS directory is required'
}
```

**Default:** `assets/js` (WordPress convention)

#### CSS Output Directory
```javascript
{
  type: 'text',
  name: 'cssDir',
  message: 'CSS output directory?',
  initial: 'assets/css',
  validate: (val) => val && val.length > 0 ? true : 'CSS directory is required'
}
```

**Default:** `assets/css` (WordPress convention)

#### CSS Sourcemaps
```javascript
{
  type: 'toggle',
  name: 'sourceMaps',
  message: 'Enable CSS sourcemaps in production?',
  initial: true,
  active: 'yes',
  inactive: 'no'
}
```

**Default:** `true` (enabled for better debugging)

#### RTL Stylesheets
```javascript
{
  type: 'toggle',
  name: 'rtl',
  message: 'Enable RTL stylesheet generation?',
  initial: false,
  active: 'yes',
  inactive: 'no'
}
```

**Default:** `false` (most projects don't need RTL)

### 3.3 Telemetry Prompt

```javascript
{
  type: 'confirm',
  name: 'telemetry',
  message: 'Share anonymous usage data to improve WPGulpPro?',
  hint: 'y/n',
  initial: false
}
```

**Default:** `false` (opt-in only)
**Skip Behavior:** User can press Enter to skip (treated as `false`)

---

## 4. File Generation

### 4.1 Generated package.json

**Template Structure:**
```javascript
{
  name: projectName,           // User input (kebab-case)
  description: description,     // User input
  version: '1.0.0',
  author: author || 'Your Name',
  license: 'MIT',
  devDependencies: { /* 27 packages */ },
  scripts: { /* 9 npm scripts */ },
  engines: { node: '>=20.0.0' }
}
```

**Key Differences from Downloaded Template:**
- `name` is user-provided (not "your-project")
- `description` is user-provided
- `author` is user-provided
- No `repository` field (user can add later)

### 4.2 Generated wpgulp.config.js

**User-Configurable Paths:**
```javascript
// Based on user input:
const jsCustomSRC = './${jsDir}/custom/*.js';
const jsCustomDestination = './${jsDir}/';
const styleSRC = './${cssDir}/style.scss';
const watchStyles = './${cssDir}/**/*.scss';
const watchJsVendor = './${jsDir}/vendor/*.js';
const watchJsCustom = './${jsDir}/custom/*.js';
```

**Static Defaults (not prompted):**
- Images: `./assets/img/raw/` → `./assets/img/`
- Translation: `WPGULPPRO` text domain
- Bug report: Your GitHub issues URL

### 4.3 Downloaded Files (6 files)

The following files are downloaded from GitHub (not generated):

1. `.editorconfig`
2. `.eslintignore`
3. `.eslintrc.js`
4. `.gitignore`
5. `gulpfile.babel.js`
6. `wpgulp.config.js` (template - overwritten by generated version)

**Note:** `package.json` is NOT downloaded - it's generated locally.

---

## 5. Confirmation Flow

### 5.1 Summary Display

Before installation begins, users see:

```
Project Summary:
─────────────────
  Name:        my-wordpress-theme
  Description: A custom WordPress theme
  Author:      Faisal Ahammad
  JS Dir:      assets/js
  CSS Dir:     assets/css
  Sourcemaps:  yes
  RTL:         no

? Proceed with installation? (Y/n)
```

### 5.2 Cancellation Behavior

If user declines:
```
Installation cancelled.
```
- No files downloaded
- No files created
- Process exits with code 0 (clean exit)

---

## 6. Error Handling

### 6.1 Prompt-Level Errors

| Error | Display | Recovery |
|-------|---------|----------|
| Empty project name | "Project name is required" | Re-prompt |
| Invalid characters | "Project name can only contain lowercase letters, numbers, and hyphens" | Re-prompt |
| Name too long | "Project name must be less than 214 characters" | Re-prompt |
| Empty JS/CSS dir | "Directory is required" | Re-prompt |

### 6.2 Download Errors

If download fails:
```
✖ ERROR: Failed to download files
<error details>
```
- Partial files may exist (no auto-cleanup)
- User can inspect and retry

### 6.3 npm Install Errors

If `npm install` fails:
```
✖ ERROR: Command failed with exit code 1
<npm error output>
```
- Files already created remain
- User can run `npm install` manually

---

## 7. Telemetry Implementation

### 7.1 Config File (.wpgulppro-config.json)

**Location:** User's project root

**Structure:**
```json
{
  "telemetry": true,
  "telemetryId": "wppt-1709683200000-abc123def",
  "firstInstall": "2026-03-06T10:00:00.000Z",
  "projectName": "my-wordpress-theme"
}
```

### 7.2 Data Collection (Future)

When telemetry is enabled, future versions may collect:
- Node.js version
- npm version
- Platform (darwin/linux/win32)
- Installation duration
- Installation success/failure
- Command usage (which gulp tasks are run)

**NOT Collected:**
- Project paths
- Author information
- Project code
- File contents

### 7.3 Opt-Out Mechanism

Users can disable telemetry:
1. Delete `.wpgulppro-config.json`
2. Or set `"telemetry": false` in config file

---

## 8. UX Design Decisions

### 8.1 Prompt Order Rationale

**Metadata First:**
- Project name is most important identifier
- Users think about "what" before "how"
- Description helps personalize the experience

**Configuration Second:**
- Technical decisions come after creative ones
- Users have context about their project now
- Defaults (assets/js, assets/css) are sensible

**Telemetry Last:**
- Least critical question
- Can be skipped without consequence
- Doesn't block core functionality

### 8.2 Default Values

| Setting | Default | Rationale |
|---------|---------|-----------|
| JS Dir | `assets/js` | WordPress theme/plugin convention |
| CSS Dir | `assets/css` | WordPress convention |
| Sourcemaps | `true` | Essential for debugging |
| RTL | `false` | Niche requirement (~10% of projects) |
| Telemetry | `false` | Privacy-first, opt-in only |

### 8.3 Confirmation Before Action

**Why confirm?**
- Prevents accidental installations
- Users can verify all settings
- Psychological commitment reduces support requests

**Why not auto-proceed?**
- npm install takes 2-3 minutes
- Downloading files wastes bandwidth on mistakes
- Users appreciate control

---

## 9. Tradeoffs & Limitations

### 9.1 Known Tradeoffs

| Decision | Tradeoff | Mitigation |
|----------|----------|------------|
| prompts library | Less features than inquirer | Sufficient for current needs |
| No config file migration | Existing WPGulp users must manually migrate | Document migration in changelog |
| package.json generated | Can't include comments in JSON | Add comments to generated wpgulp.config.js |
| RTL not in prompts | Extra step for RTL projects | RTL task available in gulpfile |

### 9.2 Limitations

1. **No project type detection** - Doesn't auto-detect theme vs plugin
2. **No preset templates** - No "blank theme", "plugin", "full site" presets
3. **No advanced config** - Autoprefixer browsers, image optimization settings not exposed
4. **No skip option** - Can't skip prompts and use all defaults (yet)

### 9.3 Future Enhancements

| Feature | Priority | Complexity |
|---------|----------|------------|
| `--yes` flag (skip prompts, use defaults) | High | Low |
| Project type presets (theme/plugin) | Medium | Medium |
| Advanced config mode | Low | High |
| Config file migration wizard | Medium | Medium |
| Offline mode (bundled templates) | Low | High |

---

## 10. Testing Strategy

### 10.1 Manual Testing

```bash
# Test interactive installation
mkdir ~/test-wpgulppro
cd ~/test-wpgulppro
npm install faisalahammad/WPGulpPro
npx wpgulppro
# Follow prompts, verify generated files
```

### 10.2 Automated Testing (Future)

```javascript
// Test project name validation
expect(validateProjectName('my-project')).toBe(true);
expect(validateProjectName('My Project')).toBe(true); // auto-converted
expect(validateProjectName('my_project')).toContain('only contain');
expect(validateProjectName('')).toContain('required');
```

### 10.3 Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty directory name | Prompt shows empty default, user must enter |
| Special chars in dir name | Auto-converted to kebab-case |
| Ctrl+C during prompts | Clean exit, no files created |
| Ctrl+C during download | Partial files may exist |
| npm install fails | Files created, user can retry manually |

---

## 11. Performance Considerations

### 11.1 Installation Time

| Step | Time (approx) |
|------|---------------|
| Prompts | 30-60 seconds (user input) |
| Download (6 files) | 5-10 seconds |
| Generate files | <1 second |
| npm install | 60-180 seconds |
| **Total** | **2-4 minutes** |

### 11.2 Package Size Impact

| Addition | Size | Impact |
|----------|------|--------|
| prompts library | ~50KB | Minimal |
| collectPrompts.js | ~12KB | Minimal |
| Updated index.js | +3KB | Minimal |
| **Total** | **~65KB** | **<1% of total package** |

---

## 12. Git Commits

### 12.1 Implementation Commits

```
d1c872b 📦 NEW: Interactive prompts for project configuration (v1.0.0)
```

### 12.2 Related Commits

```
cf35944 🐛 FIX: Update credits, URLs, and branding throughout
ae7ea60 🔧 RENAME: WPGulp → WPGulpPro (template folder)
```

---

## 13. Approval

**Spec Author:** Claude Opus 4.6 (AI Assistant)
**Implementation:** Complete
**Testing:** Manual testing passed
**Status:** ✅ Released as v1.0.0

---

## Appendix A: Complete User Journey

```bash
$ mkdir my-theme && cd my-theme
$ npm install faisalahammad/WPGulpPro
$ npx wpgulppro

WPGulpPro Installer
Modern Gulp workflow for WordPress

Let's configure your project:

? What is your project name? › my-theme
? Project description? › A custom WordPress theme
? Author name? › Faisal Ahammad

? JavaScript source directory? › assets/js
? CSS output directory? › assets/css
? Enable CSS sourcemaps in production? › yes
? Enable RTL stylesheet generation? › no
? Share anonymous usage data to improve WPGulpPro? › No

Project Summary:
─────────────────
  Name:        my-theme
  Description: A custom WordPress theme
  Author:      Faisal Ahammad
  JS Dir:      assets/js
  CSS Dir:     assets/css
  Sourcemaps:  yes
  RTL:         no

? Proceed with installation? (Y/n) › y

✔ DOWNLOADED WPGulpPro files
✔ GENERATED package.json
✔ GENERATED wpgulp.config.js
✔ INSTALLED npm packages

✔ ALL DONE! WPGulpPro is ready to use.

ℹ npm start
ℹ For more commands, read the docs at:
  https://github.com/faisalahammad/WPGulpPro

ℹ Get Started
  1. Editing the wpgulp.config.js file
  2. And then running npm start

Follow the maintainer: https://twitter.com/faisalahammadwp
```

---

## Appendix B: Generated Files

### package.json (Generated)

```json
{
  "name": "my-theme",
  "description": "A custom WordPress theme",
  "version": "1.0.0",
  "author": "Faisal Ahammad",
  "license": "MIT",
  "devDependencies": { ... },
  "scripts": { ... }
}
```

### wpgulp.config.js (Generated)

```javascript
/**
 * WPGulpPro Configuration File
 *
 * @package WPGulpPro
 * @author Faisal Ahammad <https://twitter.com/faisalahammadwp/>
 * @credit Originally based on WPGulp by Ahmad Awais
 */

const jsCustomSRC = './assets/js/custom/*.js';
const jsCustomDestination = './assets/js/';
const styleSRC = './assets/css/style.scss';
// ... etc
```

---

**END OF SPECIFICATION**
