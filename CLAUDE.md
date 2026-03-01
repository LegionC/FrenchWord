# Le Vocabulaire

A French vocabulary learning web app built with Vue 3 + Vite + Pinia.

## Project Context

- **Purpose**: Personal tool for learning French vocabulary (A1 level)
- **Architecture**: Pure frontend SPA, no backend, deployed on Cloudflare Pages
- **Data**: 414 words in static JSON, learning progress stored in browser localStorage
- **Documentation**: See `docs/PRD.md` for full product requirements

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vue 3 (Composition API) |
| Build | Vite |
| State | Pinia (persisted to localStorage) |
| Styling | Native CSS + CSS Variables |
| Routing | None (component switching via `v-if`) |
| Speech | Web Speech API (`fr-FR`) |
| Deploy | Cloudflare Pages |

## Project Structure

```
src/
├── data/words.json          # 414-word vocabulary (read-only)
├── stores/wordStore.js      # Pinia store (state + localStorage)
├── utils/speech.js          # Web Speech API TTS wrapper
├── components/
│   ├── FlashCard.vue        # Card flip learning mode
│   ├── AudioBtn.vue         # French TTS button
│   ├── QuizMode.vue         # Quiz container
│   ├── QuizChoice.vue       # Multiple choice questions
│   ├── QuizSpelling.vue     # Spelling with accent keyboard
│   ├── QuizResult.vue       # Quiz score report
│   ├── StatsPanel.vue       # Learning statistics
│   └── SettingsPanel.vue    # User preferences
├── assets/main.css          # Design system (CSS variables)
├── App.vue                  # Root: 4-tab navigation
└── main.js                  # Entry point
```

## Key Design Decisions

1. **No Vue Router** — Only 4 tabs, switched via `<component :is>` / `v-if`
2. **No backend** — All data in localStorage with `try-catch` degradation
3. **English-only definitions** — No Chinese; doubles as English practice
4. **Mastery model** — `new` → `learning` → `mastered` (3 consecutive "Got it")
5. **Word status streak** — Cross-session cumulative, persisted in localStorage

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # Production build → dist/
```

## Coding Conventions

- Vue 3 Composition API with `<script setup>`
- CSS variables defined in `src/assets/main.css`
- All localStorage access wrapped in try-catch (see `wordStore.js`)
- French TTS via `src/utils/speech.js` — always use this wrapper, not raw API
