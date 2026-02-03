# Gastroscopy Simulator (胃カメラシミュレータ)

A realistic 3D Gastroscopy simulator running in the browser using Three.js.

## Features
- **Procedural GI Tract**: Esophagus, Stomach, and Duodenum generated procedurally.
- **Realistic Visualization**: Mucosa textures, specular highlights, and endoscope lighting.
- **Medical UI**: Mimics real endoscopic processor interfaces (OSD, circular view).
- **Controls**:
    - **W / S**: Insert / Withdraw (Move forward/backward)
    - **A / D**: Torque (Rotate scope)
    - **Arrow Keys**: Angulation (Bend tip Up/Down/Left/Right)
    - **Space**: Air/Water (Flush lens)

## Technical Details
- **Engine**: Three.js (via CDN)
- **Geometry**: `TubeGeometry` along a `CatmullRomCurve3`
- **Texture**: Procedural CanvasTexture generation (No external image assets required)

## How to Run
Simply open `index.html` in a modern web browser.
