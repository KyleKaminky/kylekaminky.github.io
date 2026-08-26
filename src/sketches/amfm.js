/*
                     Amplitude and Frequency Modulation
                     ----------------------------------
   Ported from AMFM.pde. The AM in AM radio stands for amplitude modulation and
   the FM in FM radio for frequency modulation. Both take a message and imprint
   it on a carrier; they differ only in which property of the carrier is varied.

   Laid out like the On-Off Keying sheet — message, carrier, and the two outputs
   stacked on one time axis — so the same instant of message can be traced down
   into both results. Seeing them under each other is what makes the comparison:
   the AM trace changes height while its cycles stay evenly spaced, and the FM
   trace holds its height while its cycles bunch and spread.

   The message is a single tone rather than the original's sum of five random
   sinusoids. With a "message frequency" slider a single tone is the honest
   thing to vary, and it makes both outputs readable — against a noisy message
   you can see that something is happening but not what.

   That choice also makes the FM exact. For m(t) = sin(2πf t), the phase
   integral has a closed form:

       phase(t) = 2π·fc·t − (Δf/fm)·cos(2π·fm·t)

   whose derivative is 2π(fc + Δf·m(t)), so the instantaneous frequency really
   is the carrier plus the message. The original integrated numerically with a
   running sum and a pair of hand-tuned offsets — sum += message/2 − 15, then
   −K_f·(sum + 15) — which worked but was a fudge with constants in it.
*/

import { labelStyle, clearTracking, dashed, labelSizeFor, traceWeightFor, isDetailed } from './lib.js';

const MAX_STEP_MS = 100;
const SCROLL = 0.1;      // panel widths per second
const MARGIN_Y = 0.09;
const GUTTER = 0.18;
const NOMINAL = 0.22;    // unmodulated carrier amplitude, as a share of its row
const DEVIATION = 0.5;   // peak frequency swing at full depth, as a share of fc
const ROWS = ['MESSAGE', 'CARRIER', 'AM', 'FM'];

export default function amfm({ get, palette, height, container }) {
  return (p) => {
    let t = 0;

    let panelX, panelW, rowCy, rowH, unit, size, weight, detailed, samples;

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
      unit = rowH * NOMINAL;
      samples = Math.min(2400, Math.max(400, Math.round(panelW * 3)));
    }

    p.setup = function () {
      p.createCanvas(container.clientWidth, height);
      p.pixelDensity(Math.min(window.devicePixelRatio, 2));
      p.frameRate(60);
      layout();
      p.describe(
        'A message tone, a carrier, and the same message carried by amplitude ' +
        'modulation and by frequency modulation, stacked on a shared time axis.'
      );
    };

    p.windowResized = function () {
      p.resizeCanvas(container.clientWidth, height);
      layout();
    };

    p.draw = function () {
      layout();
      t += (Math.min(p.deltaTime, MAX_STEP_MS) / 1000) * SCROLL;

      const fc = Math.max(1, Math.round(get('carrier')));
      const fm = Math.max(1, Math.round(get('msg')));
      const depth = p.constrain(get('depth'), 0, 100) / 100;

      p.background(palette.bg);
      drawGrid(fm);
      if (detailed) drawBlocks();
      drawSignals(fc, fm, depth);
      if (detailed) drawLabels();
    };

    const message = (time, fm) => Math.sin(p.TWO_PI * fm * time);

    /* Message period boundaries, tying the four rows to the same instants. */
    function drawGrid(fm) {
      const top = rowCy[0] - rowH / 2;
      const bottom = rowCy[ROWS.length - 1] + rowH / 2;
      const cycles = fm; // message cycles visible across the panel

      p.stroke(palette.grid);
      p.strokeWeight(1);
      const first = Math.ceil(t * cycles);
      for (let c = first; c < t * cycles + cycles; c++) {
        const x = panelX + ((c / cycles - t) / 1) * panelW;
        p.line(x, top, x, bottom);
      }

      p.stroke(palette.ghost);
      dashed(p, [3, 4], () => {
        for (const cy of rowCy) p.line(panelX, cy, panelX + panelW, cy);
      });
    }

    function drawSignals(fc, fm, depth) {
      const step = panelW / (samples - 1);
      const at = (i) => t + i / (samples - 1);

      p.noFill();
      p.strokeWeight(weight);

      // --- Message ---
      p.stroke(palette.ink);
      trace((i) => rowCy[0] - unit * message(at(i), fm), step);

      // --- Carrier: constant amplitude, constant frequency ---
      p.stroke(palette.faint);
      trace((i) => rowCy[1] - unit * Math.cos(p.TWO_PI * fc * at(i)), step);

      // --- AM: height carries the message, spacing does not ---
      p.stroke(palette.accent);
      trace((i) => {
        const time = at(i);
        const env = 1 + depth * message(time, fm);
        return rowCy[2] - unit * env * Math.cos(p.TWO_PI * fc * time);
      }, step);

      // --- FM: spacing carries the message, height does not ---
      const deviation = depth * fc * DEVIATION;
      p.stroke(palette.accent);
      trace((i) => {
        const time = at(i);
        const phase = p.TWO_PI * fc * time - (deviation / fm) * Math.cos(p.TWO_PI * fm * time);
        return rowCy[3] - unit * Math.cos(phase);
      }, step);

      // The message reappearing as the AM envelope — the thing a receiver
      // recovers — against a flat one on FM, where the amplitude never moves.
      p.strokeWeight(1);
      p.stroke(palette.ink);
      dashed(p, [4, 4], () => {
        for (const sign of [-1, 1]) {
          trace((i) => rowCy[2] + sign * unit * (1 + depth * message(at(i), fm)), step);
        }
      });
      p.stroke(palette.ghost);
      dashed(p, [4, 4], () => {
        for (const sign of [-1, 1]) {
          p.line(panelX, rowCy[3] + sign * unit, panelX + panelW, rowCy[3] + sign * unit);
        }
      });
    }

    function trace(yAt, step) {
      p.beginShape();
      for (let i = 0; i < samples; i++) p.vertex(panelX + i * step, yAt(i));
      p.endShape();
    }

    /*
       Two modulators fed from the same pair of signals. Drawn as labelled
       blocks rather than the multiplier circle used on the On-Off Keying
       sheet: AM really is a multiplication, but FM is not, and a cross inside
       a circle would be claiming something untrue about the lower path.
    */
    function drawBlocks() {
      const busX = panelX - p.width * GUTTER * 0.72;
      const stub = 8;
      const boxW = Math.min(p.width * GUTTER * 0.44, 54);
      const boxH = Math.min(rowH * 0.34, 28);
      const boxX = panelX - p.width * GUTTER * 0.34;

      p.stroke(palette.faint);
      p.strokeWeight(1);
      p.line(busX, rowCy[0], busX, rowCy[3]);
      p.line(busX, rowCy[0], panelX - stub, rowCy[0]);
      p.line(busX, rowCy[1], panelX - stub, rowCy[1]);

      p.rectMode(p.CENTER);
      [2, 3].forEach((row) => {
        const cy = rowCy[row];
        p.stroke(palette.faint);
        p.line(busX, cy, boxX - boxW / 2, cy);
        p.line(boxX + boxW / 2, cy, panelX - stub, cy);

        p.fill(palette.bg);
        p.rect(boxX, cy, boxW, boxH);

        p.noStroke();
        p.fill(palette.faint);
        const a = Math.min(7, boxH * 0.4);
        p.triangle(panelX - stub, cy, panelX - stub - a, cy - a / 2, panelX - stub - a, cy + a / 2);

        labelStyle(p, Math.min(size, boxH * 0.55));
        p.textAlign(p.CENTER, p.CENTER);
        p.text(ROWS[row], boxX, cy);
        clearTracking(p);
      });
      p.rectMode(p.CORNER);
    }

    function drawLabels() {
      p.noStroke();
      labelStyle(p, size);
      p.textAlign(p.LEFT, p.BOTTOM);
      const colors = [palette.ink, palette.faint, palette.accent, palette.accent];
      const notes = ['', '', 'HEIGHT VARIES', 'SPACING VARIES'];

      ROWS.forEach((name, i) => {
        p.fill(colors[i]);
        p.text(name, panelX, rowCy[i] - rowH * 0.34);
        if (notes[i]) {
          p.fill(palette.grid);
          p.textAlign(p.RIGHT, p.BOTTOM);
          p.text(notes[i], panelX + panelW, rowCy[i] - rowH * 0.34);
          p.textAlign(p.LEFT, p.BOTTOM);
        }
      });
      clearTracking(p);
    }
  };
}
