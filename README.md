# Chesstats ♞

Advanced Chess Analytics, Move Precision & Tilt Telemetry Platform built with Next.js and TypeScript.

Chesstats provides Grandmaster-grade accuracy metrics, opening repertoire diagnostic trees, spatial dominance heatmaps, tactical puzzle labs, over-the-board tournament clocks, and psychological tilt telemetry for Chess.com and Lichess accounts.

## Features

### 1. Game Review Studio & Neural Engine Analysis
- Move-by-move evaluation graphing along the equality axis.
- Real-time engine evaluation bar with mate detection and advantage percentages.
- Stockfish-grade move classifications: Brilliant, Great, Best, Excellent, Good, Inaccuracy, Mistake, Miss, and Blunder.
- Neural Engine multi-PV analysis panel with customizable search depths (14 to 26 plies) and candidate lines.
- SVG visual threat vector arrows overlaying the chessboard in real-time.
- Tactical Motifs classification tracking tactical vulnerabilities (back rank, pin, fork, blunder trends).
- Export modal supporting PGN downloads, FEN dumps, and Markdown telemetry summaries.
- Interactive playback controller with autoplay, variable playback speed (0.7x, 1x, 2x), and jump to key moments.
- Keyboard navigation (Left/Right arrows for step-through).

### 2. Tactical Puzzle Trainer
- Curated tactical puzzle database spanning forks, pins, skewers, deflections, windmills, and mate combinations.
- Real-time solution validation with move hints, retry mechanisms, and audio feedback.
- Streak counter and rating progress benchmarks.

### 3. Tournament Chess Clock
- Dedicated over-the-board dual digital chess clock.
- Classical, Rapid, Blitz, and Bullet tournament presets with Fischer increment support.
- Turn indicators, move counters, low-time urgency warning pulses, and keyboard controls (Space/Enter).

### 4. FIDE Master Titles Explorer
- Interactive guide to official chess master titles (GM, WGM, IM, WIM, FM, WFM, CM, WCM).
- Peak rating baselines, norm requirements, and career milestone trackers.

### 5. Player Performance & Tilt Telemetry
- Multi-timeclass rating matrix (Bullet, Blitz, Rapid, Classical, Daily).
- 12-month rating progression area sparkline charts.
- Time scramble accuracy chart tracking move precision degradation when clock dips below 30 seconds.
- White vs Black piece win/loss/draw distribution breakdown.
- Opening performance table with ECO classifications and personal accuracy benchmarks.
- Tilt & psychological fatigue radar detecting panic blunder rates, session momentum streaks, and vulnerable playing hours.

### 6. Opening Repertoire & Clash Matrix
- Master database continuations across dozens of ECO classifications.
- Head-to-head Opening Clash Matrix analyzing win rates when specific rival repertoires collide.
- Segmented win rate bars for White victories, draws, and Black counter-wins.
- Real-time opening search and filter by name or ECO code.

### 7. Head-to-Head Rivalry Analyzer
- Cross-platform head-to-head match simulation and victory tallying.
- Direct encounter logs with one-click review studio launcher.

### 8. Tactical Density & Square Heatmap
- 8x8 interactive spatial control overlay.
- Tactical density, outpost value, and king safety vulnerability metrics.

### 9. PGN & FEN Syntax Studio
- Real-time PGN tokenization and header extraction.
- FEN board reconstruction and clipboard utilities.

### 10. Global Leaderboards
- Master rankings sorted by FIDE, Blitz, Bullet, and Rapid ratings.

### 11. Native Audio Synthesizer
- Browser-native Web Audio API synthesizer for moves, captures, checks, and victory chimes without external audio assets.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Vanilla CSS Modules with custom glassmorphism design system
- **Graphics**: Pure Vector SVG chessboard pieces, tactical threat arrows, and custom charting
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
