# 03-01-system-overview.md

## System Architecture: nano-games

The collection is a set of **static, client-side web games**. Each game is self-contained (its own HTML, CSS, and JavaScript) and shares a common shell for consistent navigation, scoring, and game-over screens. No backend is required for the initial release — the games are served as static files and can be hosted on any static host (GitHub Pages, Netlify, etc.). Optional integrations (leaderboards, analytics, content updates) can be layered on later without changing the game architecture.