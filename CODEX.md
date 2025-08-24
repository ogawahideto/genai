# CODEX.md

This file guides Codex CLI when working with code in this repository.

## Project Architecture

This repo hosts many small, single-file web apps. Each app keeps HTML, CSS, and JavaScript in one `index.html` without external dependencies.

- Zero dependencies: no frameworks or build tools
- Self-contained: each app runs standalone in browser
- Canvas-centric: many games render via HTML5 Canvas
- Vanilla JavaScript: no frameworks
- Educational focus: demonstrate specific web/game techniques

## Workflow

- New apps: create a folder and put `index.html` inside it
- Run: open `index.html` in a browser (no build step)
- Testing: manual in-browser checks; devtools for debugging

## Logs (Git-ignored)

Each app directory can have:
- `work.log`: daily activity
- `development.log`: technical notes
- `progress.md`: milestones
- `notes.md`: ideas/observations

## Conventions

- Keep single-file structure and responsive design
- Prefer Canvas for games and Web Audio API for sound
- Use a simple game loop where relevant
- Add a short HTML comment header with:
  - AI Model, User Prompt, AI Approach, Implementation Intent

Example header:
```
<!--
AI Model: <model>
Codex CLI Version: <version>
User Prompt: <prompt>
AI Approach: <approach>
Implementation Intent: <intent>
-->
```

## README.md Rules

- Only list apps that are committed and pushed
- Verify with `git ls-tree -r --name-only HEAD`
- Maintain chronological order when possible

## Articles

- Store under `articles/` (ignored by Git)
- Use descriptive names: `{project_name}_article.md`, `{topic}_note.md`
- Derive content from project logs (work/development/progress/notes)

## Automation & Commands

Custom commands for Codex live in `.codex/commands.json`, mirroring the Claude setup:

- `/complete [project]`: create article → update README → commit/push → open GitHub Pages
- `/article [project] [platform]`: create a blog/article template in `articles/`
- `/deploy [project]`: update README (if committed) → commit/push → open GitHub Pages
- `/newproject [name] [description]`: scaffold a folder and HTML template, ensure `articles/` is ignored

Settings include:
- GitHub user/repo and Pages base URL
- Articles directory (`articles`)
- Commit author default (`Codex <noreply@openai.com>`)
- Auto documentation variables for the HTML header

These mirror `.claude/commands.json` so workflows remain consistent when using Codex.

