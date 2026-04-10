# AGENTS.md

A backgammon clock web app.

## Commands

```bash
npm run build    # Inline CSS/JS into dist/index.html
npm run lint     # Run ESLint on src/
npm run format   # Format with Prettier
```

The `dist/` directory is gitignored. The project auto-deploys to GitHub Pages on push to `main`.

## Development

Open `dist/index.html` in a browser after running build. There are no dev servers or tests.

## Architecture

- `src/clock.js` - Clock, Player, DoublingCube classes + CONFIG + STATE constants
- `src/game.js` - GameEngine class
- `src/ui.js` - GameUI class (DOM manipulation)
- `src/main.js` - Entry point, imports the 3 modules

## Key Files

- `build/inline.js` - Build script that concatenates JS files and inlines into HTML
- `.github/workflows/deploy.yml` - GitHub Actions for CI/CD
- `README.md` - User documentation
