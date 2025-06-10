# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This repository contains a collection of small, self-contained web applications created using Generative AI tools. Each application follows a **single-file architecture** where all HTML, CSS, and JavaScript code is embedded in one file.

### Core Design Principles

- **Zero dependencies**: No external frameworks, libraries, or build tools
- **Self-contained**: Each app is completely functional as a standalone HTML file
- **Canvas-centric**: Most games use HTML5 Canvas for rendering
- **Vanilla JavaScript**: Pure JavaScript without frameworks
- **Educational focus**: Apps demonstrate specific web technologies and game programming concepts

### Application Categories

1. **Games**: Shooting games, Reversi, Pinball, Physics simulations
2. **Music/Educational**: Guitar scale practice, chord training, vocabulary learning
3. **Utilities**: Name generators, interactive character apps

## Development Workflow

### Running Applications
```bash
# Simply open any HTML file in a web browser
# No build process required
```

### Testing
```bash
# Open HTML files directly in browser
# Use browser developer tools for debugging
# No automated test framework in place
```

### Common Technologies Used

- **HTML5 Canvas** for graphics and game rendering
- **Web Audio API** for sound generation and music features
- **Speech Synthesis API** for text-to-speech
- **CSS Grid/Flexbox** for responsive layouts
- **Local Storage** for state persistence

### Code Patterns

**Game Loop Pattern** (common in game apps):
```javascript
function gameLoop() {
    update();    // Game logic
    render();    // Drawing
    requestAnimationFrame(gameLoop);
}
```

**Single-File Structure**:
- HTML markup at top
- CSS styles in `<style>` tags
- JavaScript in `<script>` tags at bottom

### File Naming Conventions

Some files indicate the AI model used for generation:
- `shootingclaude35sonnet.html` - Created with Claude 3.5 Sonnet
- `shootingdeepseekr1.html` - Created with DeepSeek R1
- `shootingo3minihigh.html` - Created with GPT-4o mini

### Japanese Language Support

- All files use UTF-8 encoding
- Many apps include Japanese UI text and comments
- Cultural themes present in game content

## Common Modifications

When editing applications:
1. **Preserve the single-file structure** - keep everything inline
2. **Test in browser immediately** - no compilation step needed
3. **Use vanilla JavaScript patterns** - avoid introducing external dependencies
4. **Maintain Canvas-based rendering** for games
5. **Keep responsive design** for mobile compatibility

## Documentation Requirements for New Applications

When creating new applications, include the following information in HTML comments at the top of the file:

1. **AI Model Used** - Which AI model was used for generation
2. **User Prompt** - The original prompt provided by the user
3. **AI Approach** - The method/approach the AI decided to use
4. **Implementation Intent** - The purpose and goals of the implementation

**Example Comment Block**:
```html
<!--
AI Model: Claude 3.5 Sonnet
User Prompt: Create a simple snake game
AI Approach: HTML5 Canvas with game loop, collision detection using coordinate comparison
Implementation Intent: Educational game demonstrating basic game programming concepts
-->
```