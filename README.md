# Figuring Things Out

The site for [Figuring Things Out](https://figuring-things-out.github.io) — educational
STEM animations by Kyle Kaminky.

The animations were originally written in **Processing** and published as YouTube videos.
This site ports them to **p5.js** so every one of them runs live in the browser, with real
parameter sliders the visitor can drag. Nothing on the site is a thumbnail.

## Running it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # -> dist/
npm run preview    # serve the built output
npm run lint
```

## Deploying

`npm run deploy` builds and pushes `dist/` to the `main` branch of
[`figuring-things-out.github.io`](https://github.com/figuring-things-out/figuring-things-out.github.io),
which is the GitHub Pages organisation site. The live URL does not change, and the
pre-p5 site stays in that repo's history.

## How it is put together

The site is an **engineering drawing set**: each animation is a numbered `FIG.` in a
technical drawing package. That metaphor is what makes the whole thing scale — a new
animation is just a new sheet in the set, not a new page design.

```
src/
  data/figures.js       the figure registry — drives everything
  data/site.js          site-wide links, About copy, page placeholders
  sketches/
    index.js            figure id -> sketch factory
    signal.js           Signal Types, ported from SignalTypes.pde
    placeholder.js      shown for figures not yet ported
    palettes.js         light (index cards) and dark (figure sheets)
    lib.js              shared label / dash / sizing helpers
  components/
    FigureCanvas.jsx    the only place p5 is touched
    FigureCard.jsx      one figure on the index grid
    FigureSheet.jsx     one figure, large, with sliders
    ParamSlider.jsx     Blueprint.jsx  Nav.jsx  Footer.jsx
  views/                index, projects, writing, about
  ds/styles.css         the Industry design system — do not edit, it is the source of truth
  site.css              layout only; every colour and font reads from a token
```

### The registry is the point

`src/data/figures.js` drives the index grid, the sheets, the prev/next order and every
slider. **Adding an animation is two edits:**

1. Add an entry to `FIGS` in `src/data/figures.js`.
2. Add `src/sketches/<id>.js` and register it in `src/sketches/index.js`.

No layout code changes. A figure with no sketch registered automatically renders the
placeholder and shows as `Video · porting` — which is how the ten un-ported figures
behave right now.

### Porting a sketch

Each sketch module exports a factory:

```js
export default function mySketch({ get, palette, height, container, figure }) {
  return (p) => { /* a normal p5 instance-mode sketch */ };
}
```

- **`get(key)`** reads a parameter, and must be called **every frame**, never captured
  at setup. That is what lets a slider change the animation without restarting it.
- **`palette`** is handed in because every sketch renders on two grounds: white index
  cards and the dark field of a sheet. Never hard-code a colour. Roles are `bg`, `ink`
  (readouts), `accent` (the live trace), `faint` (secondary labels), `ghost`
  (construction lines).
- **`height`** is fixed per context (196 card / 540 sheet / 260 about); **width is
  whatever the container is.** Lay out proportionally. `signal.js` shows the pattern:
  keep the original's hand-tuned constants as ratios of the 1100px canvas it was tuned
  on, rather than as bare pixel numbers.

`FigureCanvas` owns the p5 instance and handles the rest — creating it, `remove()`ing it
on unmount, pausing with `noLoop()` when it scrolls off screen, resizing on container
change, and rendering a single frame under `prefers-reduced-motion`. Eleven live canvases
would otherwise melt a laptop.

## Status

| #  | Figure                        | State           |
|----|-------------------------------|-----------------|
| 07 | Signal types                  | Ported          |
| 01 | Introduction                  | Video · porting |
| 02 | Binary clock                  | Video · porting |
| 03 | Estimating π by Monte Carlo   | Video · porting |
| 04 | On-off keying                 | Video · porting |
| 05 | Generative art                | Video · porting |
| 06 | Birthday paradox simulator    | Video · porting |
| 08 | Counting                      | Video · porting |
| 09 | Satellite orbits              | Video · porting |
| 10 | Keypad circuit                | Video · porting |
| 11 | AM / FM                       | Video · porting |

The Processing originals live in their own repos under
[github.com/KyleKaminky](https://github.com/KyleKaminky) and locally in `~/Projects/FTO`.

`sandbox/` holds earlier loose p5.js experiments — see `sandbox/README.md`.

## Design

Built from a design handoff: an "Industry" blueprint design system (square corners,
hairline frames, registration marks, Barlow Condensed) plus a full spec for all five
views. `src/ds/styles.css` is that system, copied in verbatim and treated as read-only.
