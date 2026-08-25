# Sandbox

Loose p5.js experiments that predate the site, moved here so everything lives
in one repo. Nothing in this folder is part of the build — Vite only looks at
`src/` and `index.html`.

| Folder        | What it is                                                                 |
|---------------|----------------------------------------------------------------------------|
| `SignalTypes` | The first standalone port of `SignalTypes.pde` — a single global-mode page. Superseded by `src/sketches/signal.js`, kept as the minimal reference for what a port looks like without the site around it. |
| `CountingArt` | An abandoned start on porting CountingArt; `Particle.js` and `ParticleSystem.js` are empty. |
| `p5js-test`   | A scratch page from 2022.                                                  |

`MicFFT` (live microphone FFT, p5 + npm) is still at `~/Projects/FTO/MicFFT`.
It has its own `package.json`, so it was left where it is rather than folded in.
