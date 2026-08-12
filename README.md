# Grocery Rush

A compact arcade game set during the closing shift at Marty’s Market. Race along six shelf lanes, collect a customer’s order, chain fast pickups into score combos, and reach checkout before the doors close.

## Play

- **Move:** Arrow keys or WASD
- **Boost:** Space or the on-screen Boost button during play
- **Continue:** Space presses Start, Resume, Try Again, Next Order, and New Shift
- **Touch:** Swipe in the direction you want to move
- **Pause:** Pause button, `P`, or `Escape`
- **Sound:** Use the Sound button in the header

Every successful delivery advances the six-order closing shift. Collect the full list, then return to the marked checkout before time expires. Later orders request more items, allow less time, and introduce avoidable shelf spills. Order progress, cumulative score, records, best complete-shift score, and the sound preference are stored in the browser.

## Game systems

- Six shelf lanes with animated lane-to-lane movement
- Playful falls from the upper shelf ends
- Twenty separately rendered grocery sprites
- Fair orders containing distinct product types
- Timed rounds, route-combo scoring, a visible combo window, and checkout ratings
- A rechargeable shelf boost and optional coupon detours
- Avoidable late-shift spills and telegraphed stock-cart traffic
- Six customer stories and a complete shift ending
- Keyboard, pointer, and swipe controls
- Responsive desktop and portrait-phone layouts
- Pause/resume, persistent sound setting, and reduced-motion support
- Synthesized music and sound effects; no audio files required

## Development

Requires Node.js `20.19` or newer, or Node.js `22.12` or newer.

```bash
npm ci
npm run dev
```

The development server uses port `9515` on the local machine. To test the production build locally:

```bash
npm run build
npm start
```

## Verification

```bash
npm run typecheck
npm run build
npm test
npm audit
```

The Playwright suite covers game loading, responsive layout, controls, movement and bounds, shelf snapping, collection, fair orders, combos, boost, coupons, spills, stock-cart traffic, scoring, progression, pause, sound settings, and win-state presentation.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the game whenever `master` changes. Generated build output remains uncommitted; the workflow publishes only `dist/`. Relative asset URLs allow the site to run from either a domain root or a repository subpath.

After creating the GitHub repository, enable the workflow as the Pages source once:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push `master`, or run **Deploy to GitHub Pages** from the repository’s **Actions** tab.

The deployment job reports the resulting site URL in GitHub’s `github-pages` environment. No custom domain or repository-name configuration is required.

For another static host, `npm run build` creates the deployable site in `dist/`.

## Project layout

- `src/game/Game.ts` — game state, movement, orders, collection, progression, audio, and UI behavior
- `src/css/game.css` — responsive presentation and animation
- `public/` — game artwork copied into the production build
- `tests/e2e.spec.ts` — browser-level gameplay verification

## License

The code and included artwork are available under the [MIT License](LICENSE). See [ASSETS.md](ASSETS.md) for the asset statement.
