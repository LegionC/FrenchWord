# agents.md

Project-level operating guide for coding agents working on **Le Vocabulaire**.

## 1) Project Snapshot
- Stack: `Vue 3` + `Vite` + `Pinia`.
- App type: front-end only SPA, no backend.
- Data sources:
  - Static vocabulary: `src/data/words.json`
  - User progress/settings: browser `localStorage`
- Deploy target: Cloudflare Pages (`wrangler.toml` present).

## 2) Goals and Constraints
- Keep UX mobile-first and lightweight.
- Preserve offline-first behavior (must still work without network after initial load).
- Do not introduce server dependencies unless explicitly requested.
- Keep bundle size reasonable; prefer existing utilities over new heavy libraries.

## 3) Core Commands
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

Before submitting non-trivial changes, run at least:
1. `npm run build`
2. Manual smoke check: Cards / Quiz / Stats / Settings tabs

## 4) Architecture Map
- Entry: `src/main.js`
- Root shell and tab navigation: `src/App.vue`
- State and persistence: `src/stores/wordStore.js`
- Quiz engine helpers: `src/utils/quiz.js`
- Speech helper: `src/utils/speech.js`
- Main feature components:
  - `src/components/FlashCard.vue`
  - `src/components/QuizMode.vue`
  - `src/components/StatsPanel.vue`
  - `src/components/SettingsPanel.vue`

## 5) Data Contracts (Do Not Break)
- `lv_word_status`: map of word id to `{ status, streak, lastReviewed }`
- `lv_quiz_history`: recent quiz records (max 20)
- `lv_streak`: `{ count, lastDate }`
- `lv_settings`: `{ dailyGoal, ttsSpeed, quizChoiceRatio }`

Rules:
- If schema changes are needed, provide migration/fallback logic.
- Never assume imported JSON is valid; validate and clamp values.

## 6) Coding Rules for Agents
- Prefer incremental edits over wide refactors.
- Keep component logic in `<script setup>` style used by current codebase.
- Reuse existing CSS variables in `src/assets/main.css`.
- Keep user-facing copy concise and consistent with existing English UI.
- Avoid adding global state outside Pinia unless justified.

## 7) UX and Product Expectations
- Quiz flow: `config -> active -> result` must remain stable.
- Cards and quiz interactions should be touch-friendly.
- TTS must degrade gracefully when unsupported.
- Any blocking state (invalid config, import errors) should show visible feedback.

## 8) Quality Checklist for Every Change
1. Build passes.
2. No obvious localStorage regressions.
3. Date/streak logic uses local day semantics (not UTC-only assumptions).
4. Quiz works with edge settings (0%/100% choice ratio, low word counts).
5. Settings import/export still round-trips correctly.

## 9) Safe Change Scope
Allowed without extra approval:
- UI polish
- Bug fixes in components/store/utils
- Small performance and readability improvements
- Docs updates (`README.md`, `docs/*`, this file)

Ask before:
- Adding dependencies
- Restructuring large folders
- Changing persisted data format
- Altering deploy pipeline

## 10) Commit Guidance
Use concise Conventional Commit style when possible:
- `fix:` for bug fixes
- `feat:` for user-visible features
- `docs:` for documentation-only changes
- `refactor:` for non-behavioral structure changes

Example:
- `fix: use local calendar day for streak calculations`

