/*
                                Signal Types
                                ------------
   Ported from SignalTypes.pde. A randomly generated wave — thanks to Daniel
   Shiffman, whose additive wave example was the original starting point —
   is used to show the difference between an analog and a digital signal, and
   between a continuous and a discrete one.

   Rows are analog / digital, columns are continuous / discrete, so the four
   quadrants are the four combinations. The same wave appears on the left as a
   continuous trace and on the right sampled at discrete instants, which is the
   whole point: it is one signal, shown four ways.

   The original drew into a fixed 1100x1100 canvas. Here the canvas is fluid in
   width and fixed in height, so every measurement is a proportion. Where the
   original's hand-tuned constants still matter they are kept as ratios of that
   1100px reference rather than as bare numbers.
*/

import {
  labelStyle, clearTracking, dashed, labelSizeFor, traceWeightFor, markerSizeFor,
} from './lib.js';

const MAX_WAVES = 9;        // how many sinusoids are summed into the message
const REF_BAND_HALF = 175;  // (1100/2 - 200) / 2 — the original's band half-height
const MARGIN_X = 0.15;
const MARGIN_Y = 0.16;
const WAVE_BAND = 0.8;      // fraction of the band the quantiser spans
const THETA_STEP = 0.02;    // 'angular velocity' — how fast the wave slides

export default function signal({ get, palette, height, container }) {
  return (p) => {
    // --- wave state ---
    const amps = new Float32Array(MAX_WAVES);
    const dxs = new Float32Array(MAX_WAVES);
    let ys = new Float32Array(0);
    let theta = 0;

    // --- layout, all recomputed on resize ---
    let cx, cy, mx, my, bandHalf, topMid, botMid;
    let xL0, spanL, stepL, xR0, spanR, n;
    let size, traceWeight, markerSize, sideLabels;

    function layout() {
      cx = p.width / 2;
      cy = p.height / 2;
      my = p.height * MARGIN_Y;
      bandHalf = (cy - my) / 2;
      topMid = cy - bandHalf;
      botMid = cy + bandHalf;

      size = labelSizeFor(p.height);
      labelStyle(p, size);

      // Keep the CONTINUOUS / DISCRETE side labels only if there is honestly
      // room. On a 310px-wide index card there is not, so they are dropped and
      // the margins tighten to give the traces the space instead.
      mx = p.width * MARGIN_X;
      sideLabels = mx >= p.textWidth('CONTINUOUS') + 16;
      if (!sideLabels) mx = p.width * 0.07;

      const pad = p.width * 0.02;
      xL0 = mx;
      spanL = cx - mx - pad;
      xR0 = cx + pad;
      spanR = p.width - mx - xR0;

      n = Math.max(160, Math.round(spanL * 2));
      stepL = spanL / (n - 1);
      ys = new Float32Array(n);

      traceWeight = traceWeightFor(p.height);
      markerSize = markerSizeFor(p.height);
    }

    function seed() {
      // Amplitudes and periods are expressed against the 1100px reference the
      // original was tuned on, then scaled, so the wave keeps its proportions
      // at any canvas size.
      const scale = bandHalf / REF_BAND_HALF;
      for (let i = 0; i < MAX_WAVES; i++) {
        amps[i] = p.random(-10, 40) * scale;
        dxs[i] = (p.TWO_PI / (p.random(0.3, 1.8) * spanL)) * stepL;
      }
    }

    p.setup = function () {
      p.createCanvas(container.clientWidth, height);
      p.pixelDensity(Math.min(window.devicePixelRatio, 2));
      p.frameRate(50);
      p.ellipseMode(p.CENTER);
      p.strokeCap(p.ROUND);
      layout();
      seed();
      p.describe(
        'Four quadrants showing the same wave as analog and digital signals, ' +
        'each in continuous and discrete form. The digital row is drawn over a ' +
        'grid of the quantization levels its values are restricted to.'
      );
    };

    p.windowResized = function () {
      p.resizeCanvas(container.clientWidth, height);
      layout();
      seed();
    };

    p.draw = function () {
      // Resolved once per frame and shared: both the level grid and the two
      // digital quadrants have to agree on exactly where the levels are.
      const q = quantiser();
      p.background(palette.bg);
      drawAxes(q);
      calcWave();
      renderWave(q);
    };

    function calcWave() {
      theta += THETA_STEP;
      ys.fill(0);

      for (let j = 0; j < MAX_WAVES; j++) {
        const amp = amps[j];
        const dx = dxs[j];
        const even = j % 2 === 0;
        let x = theta;
        for (let i = 0; i < n; i++) {
          // Every other wave is cosine instead of sine
          ys[i] += (even ? Math.sin(2 * x) : Math.cos(2 * x)) * amp;
          x += dx;
        }
      }
    }

    /*
       The quantiser depends only on the slider, so it is resolved once per frame
       rather than per point. It hands back its geometry as well as the snap
       function, because the level grid has to be drawn on exactly the values
       snap() produces — multiples of step — or the samples would float just off
       the lines they are supposed to be sitting on.
    */
    function quantiser() {
      const levels = Math.max(2, Math.round(get('levels')));
      const a = bandHalf * WAVE_BAND;
      const step = (2 * a) / levels;
      return {
        step,
        top: Math.floor(a / step), // highest level index, so the grid matches snap()
        snap: (y) => p.constrain(Math.round(y / step) * step, -a, a),
      };
    }

    function renderWave(q) {
      // --- Left column: continuous ---
      // Both traces carry the same weight: one signal, drawn two ways. The only
      // difference the eye should pick up is smooth versus stepped.
      p.noFill();
      p.strokeWeight(traceWeight);

      // Analog, continuous
      p.stroke(palette.accent);
      p.beginShape();
      for (let i = 0; i < n; i++) p.vertex(xL0 + i * stepL, topMid + ys[i]);
      p.endShape();

      // Digital, continuous — the same wave held at the nearest level
      p.stroke(palette.ink);
      p.beginShape();
      for (let i = 0; i < n; i++) p.vertex(xL0 + i * stepL, botMid + q.snap(ys[i]));
      p.endShape();

      // --- Right column: the same wave, sampled at instants ---
      const rate = Math.max(2, Math.round(get('rate')));
      p.strokeWeight(1);
      for (let k = 0; k < rate; k++) {
        const t = (k + 0.5) / rate;
        const idx = Math.min(n - 1, Math.round(t * (n - 1)));
        const x = xR0 + t * spanR;

        // Analog, discrete — the sample lands wherever the wave was
        const ay = topMid + ys[idx];
        p.stroke(palette.accent);
        p.line(x, topMid, x, ay);
        p.circle(x, ay, markerSize);

        // Digital, discrete — the same instant, pulled onto a level line
        const dy = botMid + q.snap(ys[idx]);
        p.stroke(palette.ink);
        p.line(x, botMid, x, dy);
        p.circle(x, dy, markerSize);
      }
    }

    /*
       The quantization levels, drawn across the digital row only.

       This is the whole lesson made visible: a digital signal can only sit at
       certain values of Y. Without the grid the bottom-right quadrant is nearly
       indistinguishable from the top-right one — the samples move by at most
       half a step, which at six levels is about one marker across. With it, the
       digital samples visibly rest on lines while the analog ones float free,
       and the Quantization levels slider has something to visibly act on.

       Drawn in the palette's grid role so they read as measurement rather than
       as more of the construction scaffolding the quadrant dividers are made of.
    */
    function drawLevels(q) {
      // grid, not ghost: these lines are the point of the digital row, and must
      // not read as the same kind of mark as the quadrant dividers.
      p.stroke(palette.grid);
      p.strokeWeight(1);
      for (let k = -q.top; k <= q.top; k++) {
        const y = botMid + k * q.step;
        p.line(xL0, y, xL0 + spanL, y);
        p.line(xR0, y, xR0 + spanR, y);
      }
    }

    function drawAxes(q) {
      p.stroke(palette.ghost);
      p.strokeWeight(1);
      p.line(mx, cy, p.width - mx, cy);
      p.line(cx, my, cx, p.height - my);

      // Analog row: just a zero line, because an analog signal has no levels
      dashed(p, [3, 4], () => {
        p.line(xL0, topMid, xL0 + spanL, topMid);
        p.line(xR0, topMid, xR0 + spanR, topMid);
      });

      // Digital row: the levels themselves
      drawLevels(q);

      p.noStroke();
      p.fill(palette.faint);
      labelStyle(p, size);

      p.textAlign(p.CENTER, p.CENTER);
      p.text('ANALOG', cx, my * 0.5);
      p.text('DIGITAL', cx, p.height - my * 0.5);

      if (sideLabels) {
        p.textAlign(p.RIGHT, p.CENTER);
        p.text('CONTINUOUS', mx - 10, cy);
        p.textAlign(p.LEFT, p.CENTER);
        p.text('DISCRETE', p.width - mx + 10, cy);
      }

      clearTracking(p);
    }
  };
}
