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

import { labelStyle, clearTracking, dashed, labelSizeFor } from './lib.js';

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
    let size, dotR, circR, sideLabels;

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

      dotR = Math.max(1.5, p.height * 0.006);
      circR = Math.max(3, p.height * 0.012);
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
        'each in continuous and discrete form.'
      );
    };

    p.windowResized = function () {
      p.resizeCanvas(container.clientWidth, height);
      layout();
      seed();
    };

    p.draw = function () {
      p.background(palette.bg);
      drawAxes();
      calcWave();
      renderWave();
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
       The quantiser step depends only on the slider, so it is resolved once per
       frame and passed down. Reading get() inside the point loop — as the first
       draft did — meant a few hundred redundant lookups every frame.
    */
    function quantiser() {
      const levels = Math.max(2, Math.round(get('levels')));
      const a = bandHalf * WAVE_BAND;
      const step = (2 * a) / levels;
      return (y) => p.constrain(Math.round(y / step) * step, -a, a);
    }

    function renderWave() {
      const q = quantiser();

      // --- Left column: continuous ---
      // Drawn as points rather than filled circles: same look, one path instead
      // of several hundred, which matters with eleven canvases on the index.
      p.stroke(palette.accent);
      p.strokeWeight(dotR * 2);
      p.beginShape(p.POINTS);
      for (let i = 0; i < n; i++) p.vertex(xL0 + i * stepL, topMid + ys[i]);
      p.endShape();

      // Digital, continuous — a stepped trace through the quantised values
      p.stroke(palette.ink);
      p.strokeWeight(1.5);
      p.noFill();
      p.beginShape();
      for (let i = 0; i < n; i++) p.vertex(xL0 + i * stepL, botMid + q(ys[i]));
      p.endShape();

      // --- Right column: the same wave, sampled ---
      const rate = Math.max(2, Math.round(get('rate')));
      p.strokeWeight(1);
      for (let k = 0; k < rate; k++) {
        const t = (k + 0.5) / rate;
        const idx = Math.min(n - 1, Math.round(t * (n - 1)));
        const x = xR0 + t * spanR;

        // Analog, discrete — a stem to the sampled value
        const ay = topMid + ys[idx];
        p.stroke(palette.accent);
        p.line(x, topMid, x, ay);
        p.circle(x, ay, circR * 2);

        // Digital, discrete — the same instant, quantised
        const dy = botMid + q(ys[idx]);
        p.stroke(palette.ink);
        p.line(x, botMid, x, dy);
        p.circle(x, dy, circR * 2);
      }
    }

    function drawAxes() {
      p.stroke(palette.ghost);
      p.strokeWeight(1);
      p.line(mx, cy, p.width - mx, cy);
      p.line(cx, my, cx, p.height - my);

      // Zero line for each of the four quadrants
      dashed(p, [3, 4], () => {
        p.line(xL0, topMid, xL0 + spanL, topMid);
        p.line(xL0, botMid, xL0 + spanL, botMid);
        p.line(xR0, topMid, xR0 + spanR, topMid);
        p.line(xR0, botMid, xR0 + spanR, botMid);
      });

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
