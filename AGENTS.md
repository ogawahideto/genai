# Repository Guidelines

## Project Structure & Modules

- Micro-apps: one folder per app (kebab-case). Prefer single-file architecture: inline HTML/CSS/JS in `index.html`; when split, use `script.js` and `styles.css` colocated (e.g., `uchimizu-game/`). Zero external deps.
- React app: `swingby/` (Create React App) with `src/`, `public/`; deploys via `.github/workflows/deploy-swingby.yml`.
- Utilities: `scripts/complete-project.bat`, `create_article.ps1` (writes `articles/<app>_article.md`, Git-ignored).
- Logs (Git-ignored): per app `work.log`, `development.log`, `progress.md`, `notes.md`.
- Docs & meta: `README.md`, `LICENSE`, `.gitignore`.

## Build, Test, and Dev

- Micro-apps: open `<app>/index.html` directly in a browser (no build). Use DevTools for debugging. Optional local server: `npx serve <app>`.
- React app (`swingby/`):
  - `cd swingby && npm install`
  - `npm start` (dev), `npm run build` (to `swingby/build`), `npm test` (Jest/CRA).
- CI/CD: pushes affecting `swingby/**` trigger GitHub Actions build and Pages deploy.

## Coding Style & Naming

- Indentation: 2 spaces; no tabs.
- Directories: kebab-case (e.g., `moon-phase/`). Files: `index.html`, `script.js`, `styles.css` when split.
- Micro-apps: vanilla ES6+, Canvas-first for games, no external libs; avoid global leaks (IIFE/module pattern).
- React (`swingby/`): PascalCase components, hooks for state, paths under `src/`. ESLint config extends CRA defaults.

## Testing Guidelines

- Micro-apps: manual browser testing (loads, no console errors, core flows). No automated framework required.
- React: Jest/RTL tests under `swingby/src/**/__tests__/*` or `*.test.{js,jsx,tsx}`; run `npm test`.
- Prefer smoke tests for core logic; snapshot stable UI.

## Commit & PRs

- Commits: imperative, scope by folder when helpful. Examples: `uchimizu-game: fix water level calc`, `swingby: add trajectory panel`.
- README updates: only list apps pushed to Git; verify with `git ls-tree -r --name-only HEAD`.
- PRs: include summary, affected paths, demo URL (`https://ogawahideto.github.io/genai/<app>/`), and screenshots/GIFs.
- Windows: `scripts/complete-project.bat <app-dir>` creates article, commits, pushes, and opens Pages URL.

## Work Logs & Articles

- Per-app logs (Git-ignored): `work.log`, `development.log`, `progress.md`, `notes.md` for decisions and timeline.
- Articles: store in `articles/` (Git-ignored). Generate with `create_article.ps1` or `scripts/complete-project.bat`.

## Security & Configuration

- No secrets or external keys; keep apps self-contained.
- Ensure asset paths work under `/genai/<app>/` when served on GitHub Pages.
