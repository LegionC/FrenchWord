# Changelog

All notable changes to this project are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- No unreleased changes yet.

## [2026-03-01]

### Added
- Initial project setup with Vue 3 + Vite + Pinia.
- Flashcards module with swipe/keyboard navigation and French TTS button.
- Quiz mode with multiple-choice and spelling questions.
- Stats dashboard and settings panel.
- Onboarding overlay and production shell polish.
- Cloudflare Pages deploy baseline via `wrangler.toml`.

### Changed
- Hardened local date and localStorage sanitization logic in store and quiz setup flow.
- Updated repository docs, including README/PRD structure and AGENTS guidance.
- Replaced emoji-based UI labels with consistent text-first labels across Cards, Quiz, Stats, Settings, and onboarding.
- Added lightweight internal SVG icons for bottom navigation, audio controls, and storage warning toast.

### Fixed
- Persist flashcard progress across refresh by restoring theme/filter/current word.
- Prevent skipping the next word in `Not Mastered` view when marking a word as known.
- Allow repeated import of the same backup file by clearing file input after import.
