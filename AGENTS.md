# Repository Guidelines

## Project Structure & Module Organization
- Micro-apps: one folder per app (kebab-case). Prefer single-file `index.html`; when split, colocate `script.js` and `styles.css` (e.g., `uchimizu-game/`). Zero external deps.
- React app: `swingby/` (Create React App). Source under `swingby/src/`, static assets in `swingby/public/`. Deploy via `.github/workflows/deploy-swingby.yml`.
- Utilities: `scripts/complete-project.bat`, `create_article.ps1` (writes `articles/<app>_article.md`, Git-ignored).
- Logs (Git-ignored): per app `work.log`, `development.log`, `progress.md`, `notes.md`.
- Docs & meta: `README.md`, `LICENSE`, `.gitignore`.

## Build, Test, and Development
- Micro-apps: open `<app>/index.html` directly in a browser. Optional local server: `npx serve <app>`.
- React (`swingby/`): `cd swingby && npm install`; `npm start` (dev), `npm run build` (outputs to `swingby/build`), `npm test` (Jest/CRA).
- CI/CD: pushes affecting `swingby/**` trigger GitHub Actions build and Pages deploy.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; no tabs.
- Directories: kebab-case (e.g., `moon-phase/`). Files: `index.html`, `script.js`, `styles.css` when split.
- Micro-apps: vanilla ES6+, Canvas-first for games; avoid global leaks (IIFE/module pattern). No external libraries.
- React: PascalCase components, hooks for state, paths under `src/`. ESLint extends CRA defaults.

## Testing Guidelines
- Micro-apps: manual browser smoke tests (loads, no console errors, core flows work).
- React: Jest + React Testing Library under `swingby/src/**/__tests__/*` or `*.test.{js,jsx,tsx}`. Run with `npm test`.

## Commit & Pull Request Guidelines
- Commits: imperative, scope by folder when helpful. Examples: `uchimizu-game: fix water level calc`, `swingby: add trajectory panel`.
- PRs: include summary, affected paths, demo URL `https://ogawahideto.github.io/genai/<app>/`, and screenshots/GIFs.
- README updates: only list apps pushed to Git; verify with `git ls-tree -r --name-only HEAD`.
- Windows: `scripts/complete-project.bat <app-dir>` creates article, commits, pushes, and opens the Pages URL.

## Security & Configuration
- No secrets or external keys; keep apps self-contained.
- Ensure asset paths work under `/genai/<app>/` on GitHub Pages; prefer relative paths.
- Avoid external CDNs; bundle assets locally within each app folder.

