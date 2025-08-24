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

### Creating New Applications
When creating new applications:
1. **Create a dedicated directory** for each application
2. **Place the HTML file as `index.html`** within that directory
3. **Follow the single-file architecture** - keep all HTML, CSS, and JavaScript in one file

Example structure:
```
/my-game/
  index.html
/falling-text/
  index.html
```

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

### Work Logging
Each application directory should maintain development logs for tracking progress and decisions:

**Standard Log Files** (automatically excluded from Git):
- `work.log` - Daily development activities and progress
- `development.log` - Technical decisions and implementation notes  
- `progress.md` - Structured progress tracking with markdown
- `notes.md` - General notes, ideas, and observations

**Log File Usage**:
```bash
# Example log entry format
echo "$(date): Started implementing collision detection" >> my-game/work.log
echo "$(date): Fixed rendering issue with canvas scaling" >> my-game/development.log
```

**Benefits**:
- Track development decisions and reasoning
- Record issues encountered and solutions found
- Maintain project history without cluttering Git
- Aid in debugging and future enhancements

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

## README.md Management

**IMPORTANT**: When updating README.md, only include applications that have been committed and pushed to the git repository. 

### README Update Rules:
1. **Only include pushed applications** - Check `git ls-tree -r --name-only HEAD` to verify what's committed
2. **Remove references to unpushed apps** - Delete entries for applications that exist locally but haven't been pushed
3. **Verify with git status** - Ensure applications are not in untracked files before adding to README
4. **Maintain chronological order** - Keep applications sorted by development date where possible

## Article Creation and Management

### Article Directory Structure
All blog articles and documentation for external platforms (note.com, Qiita, etc.) should be stored in the `articles/` directory:

```
/articles/
  README.md                    # Directory documentation and rules
  {project_name}_article.md    # Main project articles
  {topic}_note.md             # Topic-specific notes
  {feature}_tutorial.md       # Tutorial content
```

### Article Creation Rules
1. **Directory Placement** - Always create articles in `articles/` directory
2. **Git Exclusion** - The entire `articles/` directory is excluded from Git via `.gitignore`
3. **Naming Convention** - Use descriptive names: `{project_name}_article.md`, `{topic}_note.md`
4. **Work Log Integration** - Always reference project work logs when writing articles:
   - Read `work.log` for development timeline and activities
   - Check `development.log` for technical decisions and implementation details
   - Review `progress.md` for structured development milestones
   - Include `notes.md` insights and observations
5. **Content Types**:
   - Technical deep-dive articles for blog platforms
   - Development diary entries
   - Tutorial and how-to guides
   - Project retrospectives and learnings

### Article Content Structure
When creating articles, include:

1. **Project Introduction** - Brief overview and motivation
2. **Technical Implementation** - Key technologies and approaches used
3. **Code Examples** - Relevant code snippets with explanations
4. **Challenges and Solutions** - Problems encountered and how they were solved
5. **Learnings and Insights** - What was learned from the development process
6. **Future Improvements** - Potential enhancements and next steps

**Example Article Template**:
```markdown
# {Project Title} - {Brief Description}

## Introduction
[Project motivation and goals]

## Technical Implementation
[Key technologies and approaches]

## Code Highlights
[Important code snippets with explanations]

## Challenges and Solutions
[Problems and solutions]

## Learnings
[Key insights and takeaways]

## Future Work
[Potential improvements]
```

### Workflow for Article Creation
1. **Read Work Logs** - Review all log files in the project directory:
   - `{project}/work.log` - Development activities and timeline
   - `{project}/development.log` - Technical decisions and solutions
   - `{project}/progress.md` - Milestone achievements
   - `{project}/notes.md` - Ideas and observations
2. **Create article file** in `articles/` directory
3. **Integrate log insights** - Use work logs to inform article content:
   - Development challenges and how they were solved
   - Technical decision rationale from development.log
   - Timeline and progress milestones
   - Key learnings and insights from notes
4. **Write comprehensive content** covering technical aspects
5. **Include code examples** and explanations based on actual implementation
6. **Review and refine** content for accuracy and completeness
7. **Publish manually** to target platform (note.com, etc.)
8. **Articles remain private** in local repository only

## Project Completion Automation

### Complete Project Script
A custom automation script `scripts/complete-project.bat` is available to streamline the project completion workflow.

**Usage**:
```bash
scripts/complete-project.bat [project-directory]
```

**Example**:
```bash
scripts/complete-project.bat uchimizu-game
```

### Automated Workflow Steps
The script performs the following operations:

1. **Article Creation** - Generates a structured article template in `articles/` directory
2. **Git Operations** - Adds files, creates commit with standard format
3. **GitHub Push** - Pushes changes to remote repository
4. **GitHub Pages** - Opens the deployed GitHub Pages URL in browser

### Script Features
- **Error Handling** - Validates project directory and required files
- **Automatic Article Generation** - Creates template with project details and URLs
- **Standard Commit Messages** - Uses consistent commit message format
- **GitHub Pages Integration** - Automatically generates and opens project URL
- **Progress Feedback** - Shows clear progress indicators throughout process

### Manual Override
If the automated script doesn't meet specific needs, you can still:
- Create articles manually in `articles/` directory
- Use standard git commands for commits and pushes  
- Access GitHub Pages manually at `https://ogawahideto.github.io/genai/[project-name]/`

### Script Requirements
- Project must have `index.html` file
- Project directory must exist in repository root
- Git repository must be properly configured
- Internet connection required for GitHub operations

## Claude Code Custom Commands

Custom commands are defined in `.claude/commands.json` to streamline common development workflows.

**Note**: The `.claude/` directory is excluded from Git via `.gitignore` to keep configuration private.

### Available Commands

#### `/complete [project-directory]`
Complete project development workflow:
1. Create structured article in `articles/` directory
2. Update README.md with new project entry (if committed to Git)
3. Commit changes with standard message format
4. Push to GitHub repository
5. Open GitHub Pages URL in browser

**Example**: `/complete uchimizu-game`

#### `/article [project-name] [platform]`
Create a structured article for blog platforms (note.com, Qiita, etc.)
- Generates article template in `articles/` directory
- Customized content structure for different platforms

**Example**: `/article uchimizu-game note`

#### `/deploy [project-directory]`
Deploy project to GitHub Pages:
1. Update README.md if new project exists (verify committed to Git)
2. Commit and push current changes
3. Open deployed project URL in browser

**Example**: `/deploy uchimizu-game`

#### `/newproject [project-name] [description]`
Set up new project with standard structure:
1. Create project directory
2. Generate HTML template with AI documentation
3. Ensure proper Git configuration

**Example**: `/newproject my-game "A fun web game"`

### Command Configuration
Commands are configured in `.claude/commands.json` with:
- **Command definitions** - Name, description, and steps
- **Templates** - Article and content templates
- **Settings** - GitHub configuration and defaults

### Template Variables
Templates support variable substitution:
- `{project_name}` - Project directory name
- `{current_date}` - Current date (YYYY-MM-DD)
- `{github_pages_base}` - Base GitHub Pages URL
- `{brief_description}` - Project description

### Usage Notes
- Commands automatically handle Git operations
- Articles are created in `articles/` directory (Git-ignored)
- GitHub Pages URLs are automatically generated
- Standard commit message format is applied consistently
- **README.md Update**: Automatically updates README.md with new project entries
  - Only includes projects committed to Git (`git ls-tree` verification)
  - Auto-categorizes projects based on content and naming
  - Maintains chronological order within categories
  - Uses current date in YYYY-MM-DD format