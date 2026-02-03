# Bass Training App

A feature-rich, single-file web application for electric bass training. It uses the Web Audio API for real-time pitch detection and provides interactive exercises to improve your fingering, timing, and fretboard knowledge.

## Features

*   **Real-Time Pitch Detection**: Detects the note you are playing via microphone using an autocorrelation algorithm optimized for bass frequencies.
*   **Interactive Tablature**: Notes scroll across the screen with visual feedback for timing and pitch accuracy.
*   **Training Modes**:
    *   **Scale Training**: Practice scales (Major, Minor, Pentatonic, etc.) with automatic "Musical" starting positions (e.g., C Major starts at 3rd fret A-string).
    *   **Spider Exercise**: Classic 1-2-3-4 chromatic finger strengthening exercise across all strings.
    *   **Permutations**: Advanced fingering patterns (e.g., 1-3-2-4) to build dexterity.
    *   **Chromatic Warmup**: Simple chromatic runs.
    *   **Random Notes**: Test your sight-reading and fretboard reaction.
*   **Playback Controls**:
    *   **Pause/Resume**: Stop the scrolling to take a break.
    *   **Rewind**: Jump back 5 seconds to retry a section.
*   **Customization**:
    *   **Key & Scale Type**: Select from various keys and modes (Dorian, Mixolydian, etc.).
    *   **Fret Count**: Adjustable for 20, 21, 22, 23, or 24-fret basses.
    *   **Notation**: Toggle between ABC (C, D, E) and Solfège (Do, Re, Mi).
    *   **Tempo**: Adjustable BPM (30-180).

## How to Use

1.  Open `index.html` in a modern web browser (Chrome, Edge, Firefox).
2.  Click **"START ENGINE"** to initialize audio (browser security requirement).
3.  Allow microphone access when prompted.
4.  Tune your bass! The app expects standard tuning (E-A-D-G).
5.  Select a **Mode** (e.g., Scale Training) and **Key**.
6.  Press **"Start Training"**.
7.  Play the notes as they cross the target line.
    *   **Green**: Perfect timing and pitch.
    *   **Red**: Miss or wrong note.

## Technical Details

*   **Architecture**: Single-file HTML (contains all CSS/JS). No external dependencies or frameworks.
*   **Audio**: Vanilla Web Audio API (`AudioContext`, `AnalyserNode`).
*   **Graphics**: HTML5 Canvas for high-performance rendering (60fps).
*   **Design**: Cyberpunk/Neon aesthetic with responsive layout.

## License

MIT License
