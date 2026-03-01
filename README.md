# 🇫🇷 Le Vocabulaire

A French vocabulary learning web app — flashcards, quizzes, and progress tracking for A1-level learners.

![Vue 3](https://img.shields.io/badge/Vue-3-42b883) ![Vite](https://img.shields.io/badge/Vite-7-646cff) ![Pinia](https://img.shields.io/badge/Pinia-state-f7d336)

## Features

- **📚 Flashcards** — 414 words across 14 themes, 3D flip animation, swipe gestures, French TTS
- **✏️ Quiz Mode** — Multiple choice + spelling with French accent keyboard
- **📊 Stats** — Daily progress, mastery rate, streak tracking, per-theme breakdown
- **⚙️ Settings** — Daily goal, TTS speed, data export/import/reset
- **💾 Offline** — All data stored in browser localStorage, no backend needed

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vue 3 (Composition API) |
| Build | Vite |
| State | Pinia → localStorage |
| Styling | CSS Variables |
| Speech | Web Speech API |
| Deploy | Cloudflare Pages |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Documentation

- [PRD v1.3](docs/PRD.md) — Product requirements document
- [CLAUDE.md](CLAUDE.md) — Project context for AI assistants
