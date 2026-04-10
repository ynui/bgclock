# Backgammon Clock

A simple backgammon timer web app with doubling cube support.

## Usage

1. Open `dist/index.html` in a browser
2. Click "Start Game" to begin
3. Click anywhere to switch turns
4. Use the Double button to offer doubles
5. Click "Settings" to configure time limits and delay per move

## Development

```bash
npm install
npm run build    # Build dist/index.html
npm run lint     # Run ESLint
npm run format   # Format with Prettier
```

## Commands

- `Space` - switch turns
- `Enter` - start/pause game
- `Ctrl+R` - reset game

## Tech Stack

Vanilla JS, no build tools required (just concatenates into a single HTML file).
