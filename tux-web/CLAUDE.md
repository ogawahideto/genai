# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This directory contains the **Tux Racer 0.61** source code, intended as a base for porting the game to the web (WebAssembly/WebGL via Emscripten).

Two subdirectories:
- `tuxracer-0.61/` — C/C++ source and autoconf build system
- `tuxracer-data-0.61/` — Game data (Tcl scripts, textures, courses, sounds, fonts)

## Build System (Native)

Uses autoconf/automake. Standard Unix build flow:

```bash
cd tuxracer-0.61
./configure
make
```

Key configure options:
```bash
./configure --enable-debug     # Debug build with -g
./configure --enable-pedantic  # Strict -ansi -pedantic
```

Dependencies: OpenGL, GLU, SDL, SDL_mixer, Tcl.

## Architecture

### Game Mode State Machine (`src/loop.c`)
The engine runs a state machine with 7 modes: `SPLASH → INTRO → RACING → GAME_OVER`, plus `PAUSED` and `RESET`. Each mode registers `init_func / loop_func / term_func` via `register_loop_funcs()`. The main loop calls these each frame.

### Core Subsystems
| Module | Files | Role |
|---|---|---|
| Physics | `phys_sim.c` | Tux dynamics, friction, collision with terrain |
| Course | `course_load.c`, `course_render.c`, `course_quad.cpp` | Terrain loading (RGB heightmap), LOD quadtree rendering |
| Tux model | `tux.c`, `hier.c`, `keyframe.c` | Hierarchical skeleton, keyframe animation |
| Scripting | `tcl_util.c` | Tcl interpreter used to load courses, define Tux geometry, configure game |
| Rendering | `gl_util.c`, `render_util.c`, `textures.c`, `fonts.c` | OpenGL helpers, texture-mapped fonts |
| Audio | `audio.c`, `audio_data.c` | SDL_mixer wrapper |
| UI | `ui_mgr.c`, `button.c`, `listbox.c` | Simple widget system for menus |
| Windowing | `winsys.c` | SDL abstraction for window/input |

### Data / Scripting Layer
Game data in `tuxracer-data-0.61/`:
- `tuxracer_init.tcl` — Entry point script; loaded at startup
- `tux.tcl` — Tux skeleton/material definitions using custom Tcl commands (`tux_root_node`, `tux_material`, etc.)
- `courses/` — Each course defined via Tcl scripts + RGB terrain images
- `textures/`, `fonts/`, `sounds/`, `music/` — Assets

### Emscripten / Web Port Notes
For porting to WebAssembly:
- Replace SDL with Emscripten's SDL2 port (largely drop-in)
- Replace `SDL_mixer` with Emscripten audio or Web Audio API
- Tcl is a challenge — consider pre-processing `.tcl` files or bundling a minimal Tcl via Emscripten
- Use `-s USE_SDL=2 -s USE_WEBGL2=1 --preload-file tuxracer-data-0.61` in `emcc` flags
- The main loop must use `emscripten_set_main_loop()` instead of a `while(1)` loop

### Global State
`g_game` (`game_data_t`, declared in `main.c`) is the single global holding current mode, player state, course info, etc. Most subsystems read from it via the `tuxracer.h` global include.
