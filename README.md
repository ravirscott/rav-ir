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
