# Chesstats ♞

Advanced Chess Analytics, Move Precision & Tilt Telemetry Platform built with Next.js and TypeScript.

Chesstats provides Grandmaster-grade accuracy metrics, opening repertoire diagnostic trees, spatial dominance heatmaps, and psychological tilt telemetry for Chess.com and Lichess accounts.

## Features

### 1. Game Review Studio
- Move-by-move evaluation graphing along the equality axis.
- Real-time engine evaluation bar with mate detection and advantage percentages.
- Stockfish-grade move classifications: Brilliant, Great, Best, Excellent, Good, Inaccuracy, Mistake, Miss, and Blunder.
- Interactive playback controller with autoplay, variable playback speed (0.7x, 1x, 2x), and jump to key moments.
- Keyboard navigation (Left/Right arrows for step-through).

### 2. Player Performance & Tilt Telemetry
- Multi-timeclass rating matrix (Bullet, Blitz, Rapid, Classical, Daily).
- 12-month rating progression area sparkline charts.
- White vs Black piece win/loss/draw distribution breakdown.
- Opening performance table with ECO classifications and personal accuracy benchmarks.
- Tilt & psychological fatigue radar detecting panic blunder rates, session momentum streaks, and vulnerable playing hours.

### 3. Opening Repertoire Explorer
- Master database continuations across dozens of ECO classifications.
- Segmented win rate bars for White victories, draws, and Black counter-wins.
- Real-time opening search and filter by name or ECO code.

### 4. Head-to-Head Rivalry Analyzer
- Cross-platform head-to-head match simulation and victory tallying.
- Direct encounter logs with one-click review studio launcher.

### 5. Tactical Density & Square Heatmap
- 8x8 interactive spatial control overlay.
- Tactical density, outpost value, and king safety vulnerability metrics.

### 6. PGN & FEN Syntax Studio
- Real-time PGN tokenization and header extraction.
- FEN board reconstruction and clipboard utilities.

### 7. Global Leaderboards
- Master rankings sorted by FIDE, Blitz, Bullet, and Rapid ratings.

### 8. Native Audio Synthesizer
- Browser-native Web Audio API synthesizer for moves, captures, checks, and victory chimes without external audio assets.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Vanilla CSS Modules with custom glassmorphism design system
- **Graphics**: Pure Vector SVG chessboard pieces and custom charting
- **Audio**: Web Audio API frequency-synthesis engine
- **Integrations**: Chess.com Public API & Lichess Open API

## Getting Started

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## API Endpoints

- `GET /api/player/[username]?platform=chesscom|lichess` - Retrieve normalized player profile, rating stats, and game archive.
- `POST /api/analysis` - Submit `{ pgn: string }` payload for server-side accuracy scoring, move categorization, and ACPL modeling.
