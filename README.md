# 3D Tic Tac Toe | Premium Edition

A modern, polished, and visually immersive 3D Tic Tac Toe game built with **Three.js**, **GSAP**, and **TypeScript**.

## Features
- **3D Rendering**: High-quality materials, neon glow, and soft shadows.
- **Cinematic Camera**: Smooth transitions between menu and gameplay states.
- **Advanced AI**: Three difficulty levels (Easy, Medium, and an unbeatable Hard mode using Minimax).
- **Glassmorphism UI**: Modern, sleek interface with blur effects and neon accents.
- **Audio System**: Immersive sound effects and ambient tracks via Howler.js.
- **Responsive Design**: Works on both desktop and mobile viewports.
- **Themes**: Multiple aesthetic presets (Neon Cyber, Minimal, Space).

## Tech Stack
- **Vite**: Project setup and bundling.
- **Three.js**: 3D world and rendering.
- **GSAP**: Cinematic animations and easing.
- **Howler.js**: Audio management.
- **TypeScript**: Robust, type-safe implementation.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

### Controls
- **Mouse Click**: Place your piece (X/O) on the 3D board.
- **Hover**: Preview the cell you are about to select.
- **UI Buttons**: Toggle settings, undo moves, or reset the match.

## Project Structure
- `src/components/`: 3D objects (Board, Pieces, VFX).
- `src/systems/`: Core engine components (Renderer, Camera, Audio).
- `src/logic/`: Game state and AI algorithms.
- `src/styles/`: Global styles and glassmorphism themes.
- `src/main.ts`: Main entry point and orchestrator.

## Credits
Built with ❤️ for a premium gaming experience.