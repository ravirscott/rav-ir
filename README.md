
# RAVIR - Typing Defense Game

RAVIR is a browser typing game inspired by ZType.

## Features
- 50,000 generated random words in the game dictionary.
- Level 1 starts with easy words (short words).
- As levels increase, words become longer and harder.
- Falling words must be typed before they touch the ground.
- If too many words hit the ground, the game is over.

## How to Run
1. Open `index.html` in your browser.
2. Click **Start Game**.
3. Type matching letters to lock onto and destroy words.
4. Press **Backspace** to remove one typed letter.

## Game Rules
- Each destroyed word gives score.
- Higher score increases level.
- Higher levels increase spawn speed and difficulty.
- Words touching the ground reduce lives.
- Lose all lives = **Game Over**.
=======
# Ravir Math Studio

A production-ready, Desmos-inspired web application for interactive mathematics, graphing, geometry, and math art.

## Features

- ⚡ **Real-time equation graphing** with multi-expression support and automatic color assignment.
- 🎚️ **Dynamic variable sliders** auto-generated from equation variables.
- 📊 **Table plotting mode** with editable data points and optional connection lines.
- 🎨 **Math art support** with cartesian, polar (`r = f(θ)`), and parametric equations.
- 🧮 **Advanced parser support** powered by `mathjs` (`sin`, `cos`, `tan`, `log`, `ln`, `sqrt`, powers, abs, etc.).
- 🧊 **3D graphing workspace** using Three.js with orbit controls, lighting, and rendered surfaces.
- 📐 **Geometry workspace** for points, lines, circles, and transformations.
- 💾 **Save, load, share, and export PNG** project workflow.
- 📱 **Responsive UI** optimized for desktop, tablet, and mobile.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Zustand
- mathjs
- Plotly.js (2D)
- Three.js / React Three Fiber (3D)

## Run Locally

```bash
npm install
npm run dev
```

Then open: `http://localhost:5173`

## Build

```bash
npm run build
```
> main
