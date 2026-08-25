/*
                               On-Off Keying
                               -------------
   Ported from OOK.pde. In a wireless system the information — a series of ones
   and zeros — is imprinted on a carrier by varying some property of it. On-off
   keying is the simplest form: the carrier is switched fully on for a one and
   fully off for a zero.

   Three changes from the original, all of them so the figure teaches better:

   1. The three signals share one time axis. The original put the message and
      carrier in a left column and the output on the right, so you could not
      trace a bit down into the thing it produced. Stacking them, over a shared
      grid of bit boundaries, is the whole point of the figure. The mixer block
      diagram survives in the left gutter, which is where it belongs — it says
      how the signals relate, not when.

   2. The carrier is locked to the bit rate. The original used a fixed 25-pixel
      period, which works out to 1.8 cycles per bit — the carrier drifted
      against the bit edges. Here "cycles per bit" is exact, so every bit
      contains a whole number of cycles and the switching lands on zero
      crossings, which is what makes the on-off transitions look clean.

   3. The message is drawn again as a dashed envelope over the output. That
      envelope is the message, still visible in the modulated signal, which is
      the entire reason the scheme works and the thing a receiver recovers.
*/

import { labelStyle, clearTracking, dashed, labelSizeFor, traceWeightFor, isDetailed } from './lib.js';

const SEQUENCE_LENGTH = 64;
const MAX_STEP_MS = 100;
const MARGIN_Y = 0.1;
const GUTTER = 0.2;         // share of width given to the mixer diagram
const AMP = 0.32;           // trace amplitude as a share of its row
const ROWS = ['MESSAGE', 'CARRIER', 'MODULATED'];

export default function ook({ get, palette, height, container }) {
  return (p) => {
    const sequence = new Uint8Array(SEQUENCE_LENGTH);
    let t = 0; // seconds of signal that have scrolled past

    let panelX, panelW, rowCy, rowH, amp, size, weight, detailed, samples;

    function layout() {
      size = labelSizeFor(p.height);
      weight = traceWeightFor(p.height);
      detailed = isDetailed(p.height);

      const marginX = p.width * 0.04;
      const gutter = detailed ? p.width * GUTTER : 0;
      panelX = marginX + gutter;
      panelW = p.width - marginX - panelX;

      const marginY = p.height * MARGIN_Y;
      rowH = (p.height - marginY * 2) / ROWS.length;
      rowCy = ROWS.map((_, i) => marginY + rowH * (i + 0.5));
      amp = rowH * AMP;

      // Enough samples that the densest carrier the sliders allow still draws
      // as a wave rather than as aliasing noise.
      samples = Math.min(2400, Math.max(400, Math.round(panelW * 3)));
    }

    p.setup = function () {
      p.createCanvas(container.clientWidth, height);
      p.pixelDensity(Math.min(window.devicePixelRatio, 2));
      p.frameRate(60);
      for (let i = 0; i < SEQUENCE_LENGTH; i++) sequence[i] = p.random() < 0.5 ? 0 : 1;
      layout();
      p.describe(
        'A digital message, a carrier wave and the on-off keyed result, stacked ' +
        'on a shared time axis so each bit lines up with the burst of carrier it produces.'
      );
    };

    p.windowResized = function () {
      p.resizeCanvas(container.clientWidth, height);
      layout();
    };

    const bitAt = (index) =>
      sequence[((index % SEQUENCE_LENGTH) + SEQUENCE_LENGTH) % SEQUENCE_LENGTH];

    p.draw = function () {
      layout();
      p.background(palette.bg);

      const bits = Math.max(2, Math.round(get('bits')));
      const cycles = Math.max(1, Math.round(get('carrier')));
      t += (Math.min(p.deltaTime, MAX_STEP_MS) / 1000) * Math.max(0.1, get('speed'));

      drawGrid(bits);
      if (detailed) drawMixer();
      drawSignals(bits, cycles);
      if (detailed) drawLabels(bits);
    };

    /*
       Bit boundaries, drawn through all three rows. This is what makes the
       figure legible: a vertical line ties a bit to the burst it produced.
    */
    function drawGrid(bits) {
      const top = rowCy[0] - rowH / 2;
      const bottom = rowCy[ROWS.length - 1] + rowH / 2;

      p.stroke(palette.grid);
      p.strokeWeight(1);
      const first = Math.ceil(t);
      for (let b = first; b < t + bits; b++) {
        const x = panelX + ((b - t) / bits) * panelW;
        p.line(x, top, x, bottom);
      }

      // Zero line for each row
      p.stroke(palette.ghost);
      dashed(p, [3, 4], () => {
        for (const cy of rowCy) p.line(panelX, cy, panelX + panelW, cy);
      });
    }

    function drawSignals(bits, cycles) {
      const step = panelW / (samples - 1);
      p.noFill();
      p.strokeWeight(weight);

      // --- Message: a square wave straight off the bit sequence ---
      p.stroke(palette.ink);
      p.beginShape();
      for (let i = 0; i < samples; i++) {
        const bitPos = t + (i / (samples - 1)) * bits;
        const level = bitAt(Math.floor(bitPos));
        p.vertex(panelX + i * step, rowCy[0] + amp - level * 2 * amp);
      }
      p.endShape();

      // --- Carrier: free-running, unaffected by the message ---
      p.stroke(palette.faint);
      p.beginShape();
      for (let i = 0; i < samples; i++) {
        const bitPos = t + (i / (samples - 1)) * bits;
        p.vertex(panelX + i * step, rowCy[1] - amp * Math.sin(p.TWO_PI * cycles * bitPos));
      }
      p.endShape();

      // --- Modulated: the product of the two above ---
      p.stroke(palette.accent);
      p.beginShape();
      for (let i = 0; i < samples; i++) {
        const bitPos = t + (i / (samples - 1)) * bits;
        const level = bitAt(Math.floor(bitPos));
        p.vertex(panelX + i * step, rowCy[2] - amp * level * Math.sin(p.TWO_PI * cycles * bitPos));
      }
      p.endShape();

      // --- Envelope: the message, still there in the output ---
      p.stroke(palette.ink);
      p.strokeWeight(1);
      dashed(p, [4, 4], () => {
        for (const sign of [-1, 1]) {
          p.beginShape();
          for (let i = 0; i < samples; i++) {
            const bitPos = t + (i / (samples - 1)) * bits;
            const level = bitAt(Math.floor(bitPos));
            p.vertex(panelX + i * step, rowCy[2] + sign * amp * level);
          }
          p.endShape();
        }
      });
    }

    /*
       The original's block diagram, kept but moved into the gutter: the message
       and the carrier meet at a mixer, and the mixer feeds the output.
    */
    function drawMixer() {
      const mx = panelX - p.width * GUTTER * 0.42;
      const my = (rowCy[0] + rowCy[1]) / 2;
      const r = Math.min(p.width * GUTTER * 0.2, rowH * 0.26);
      const stub = 10;

      p.stroke(palette.faint);
      p.strokeWeight(1);
      p.line(mx, rowCy[0], mx, rowCy[2]);
      p.line(mx, rowCy[0], panelX - stub, rowCy[0]);
      p.line(mx, rowCy[1], panelX - stub, rowCy[1]);
      p.line(mx, rowCy[2], panelX - stub, rowCy[2]);

      // Arrow into the output row
      const a = Math.min(8, r * 0.7);
      p.fill(palette.faint);
      p.noStroke();
      p.triangle(panelX - stub, rowCy[2], panelX - stub - a, rowCy[2] - a / 2, panelX - stub - a, rowCy[2] + a / 2);

      // The mixer itself, masking the line it sits on
      p.fill(palette.bg);
      p.stroke(palette.faint);
      p.circle(mx, my, r * 2);
      const d = r * Math.cos(p.PI / 4);
      p.line(mx - d, my - d, mx + d, my + d);
      p.line(mx - d, my + d, mx + d, my - d);
    }

    function drawLabels(bits) {
      p.noStroke();
      labelStyle(p, size);

      // Row names, above each panel
      p.textAlign(p.LEFT, p.BOTTOM);
      const colors = [palette.ink, palette.faint, palette.accent];
      ROWS.forEach((name, i) => {
        p.fill(colors[i]);
        p.text(name, panelX, rowCy[i] - rowH * 0.36);
      });

      // The bits themselves, so the message is readable as data and not just
      // as a waveform. Dropped once they are too narrow to sit in their cell.
      const cell = panelW / bits;
      if (cell < p.textWidth('0') * 2.4) {
        clearTracking(p);
        return;
      }
      p.textAlign(p.CENTER, p.CENTER);
      const y = rowCy[0] - rowH * 0.36 - size * 1.5;
      for (let b = Math.floor(t); b < t + bits; b++) {
        const centre = panelX + ((b + 0.5 - t) / bits) * panelW;
        if (centre < panelX || centre > panelX + panelW) continue;
        p.fill(bitAt(b) ? palette.ink : palette.faint);
        p.text(bitAt(b), centre, y);
      }
      clearTracking(p);
    }
  };
}
