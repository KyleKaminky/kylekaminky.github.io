/*
                                Binary Clock
                                ------------
   Ported from BinaryClock.pde. Not the most practical way to read the time, but
   a good way to get familiar with binary.

   Each of the three groups is one decimal pair of a normal clock — hours,
   minutes, seconds — and each column within a group is a single decimal digit
   held in binary, most significant bit at the top and least significant at the
   bottom. The tens digit never exceeds 5, so it needs only three bits and its
   column is short by one.

   Two things changed in the port. The original toggled its helper numbers on a
   mouse click, which is now the "Decimal labels" parameter. And the bits ease
   between states instead of snapping, so a carry ripples up the column and you
   can watch the arithmetic happen rather than just catching the result.
*/

import { labelStyle, clearTracking, labelSizeFor, isDetailed } from './lib.js';

const ROWS = 4;                    // bits in a ones-place column: 8 4 2 1
const TENS_ROWS = 3;               // a tens digit never exceeds 5
const GROUPS = ['HOURS', 'MINUTES', 'SECONDS'];
const COLUMNS = GROUPS.length * 2; // a tens and a ones column per group
const TRANSITION_MS = 200;         // how long a bit takes to flip, start to finish
const MAX_STEP_MS = 100;           // clamp after the sketch has been paused offscreen

// Smoothstep, so a flip starts and ends gently instead of at a constant rate.
const smooth = (t) => t * t * (3 - 2 * t);

const bitValue = (row) => 8 >> row; // row 0 is the most significant

export default function binary({ get, palette, height, container }) {
  return (p) => {
    // Transition progress per bit, [column][row], so flips ripple rather than
    // snap. Linear from 0 to 1 over TRANSITION_MS, eased only when drawn.
    const level = Array.from({ length: COLUMNS }, () => new Float32Array(ROWS));

    let cx, cy, colGap, groupGap, rowStep, bitD, size, detailed;
    let offColor, onColor; // resolved once — lerpColor on strings every frame is wasteful

    function layout() {
      cx = p.width / 2;
      size = labelSizeFor(p.height);
      detailed = isDetailed(p.height);

      // Column spacing, as a percentage. At 100% all six columns are evenly
      // spaced; above that the three groups pull apart from each other, which
      // is what makes them read as hours, minutes and seconds.
      const spread = p.constrain(get('gap'), 100, 200) / 100;
      const spanUnits = 4 * spread + 1;
      colGap = (p.width * 0.84) / spanUnits;
      groupGap = colGap * 2 * spread;

      rowStep = p.height * 0.15;
      // Bounded by both axes, so the bits never collide on a narrow canvas
      bitD = Math.min(rowStep * 0.52, colGap * 0.78);

      // Leave room under the grid for the per-digit readout
      cy = p.height / 2 - (detailed ? rowStep * 0.35 : 0);
    }

    const columnX = (col) => {
      const group = Math.floor(col / 2);
      const isOnes = col % 2 === 1;
      return cx + (group - 1) * groupGap + (isOnes ? colGap / 2 : -colGap / 2);
    };

    const rowY = (row) => cy + (row - (ROWS - 1) / 2) * rowStep;

    // A tens column has no 8s bit, so its three bits sit in the lower rows.
    const rowsFor = (col) => (col % 2 === 0 ? ROWS - TENS_ROWS : 0);

    p.setup = function () {
      p.createCanvas(container.clientWidth, height);
      p.pixelDensity(Math.min(window.devicePixelRatio, 2));
      p.frameRate(30);
      p.ellipseMode(p.CENTER);
      offColor = p.color(palette.ghost);
      onColor = p.color(palette.accent);
      layout();
      p.describe(
        'A clock showing hours, minutes and seconds as columns of binary bits, ' +
        'one column per decimal digit, most significant bit at the top.'
      );
    };

    p.windowResized = function () {
      p.resizeCanvas(container.clientWidth, height);
      layout();
    };

    p.draw = function () {
      layout(); // cheap, and the spacing slider changes it every frame
      p.background(palette.bg);

      const digits = [p.hour(), p.minute(), p.second()].flatMap((t) => [
        Math.floor(t / 10) % 10,
        t % 10,
      ]);

      updateLevels(digits);
      const showLabels = detailed && get('labels') >= 0.5;
      if (showLabels) drawLabels(digits);
      drawBits();
    };

    /*
       Move each bit toward its target at a fixed rate, so a flip takes the same
       200ms every time and lands exactly on 0 or 1.

       This was originally an exponential ease, which was wrong twice over: it
       approaches its target asymptotically, so a bit turning off faded quickly
       and then lingered as a barely-tinted dot for a long tail before crossing
       a cutoff and vanishing outright.
    */
    function updateLevels(digits) {
      const step = Math.min(p.deltaTime, MAX_STEP_MS) / TRANSITION_MS;
      for (let col = 0; col < COLUMNS; col++) {
        for (let row = rowsFor(col); row < ROWS; row++) {
          const target = (digits[col] & bitValue(row)) !== 0 ? 1 : 0;
          const v = level[col][row];
          const delta = target - v;
          level[col][row] = Math.abs(delta) <= step ? target : v + Math.sign(delta) * step;
        }
      }
    }

    /*
       One circle per bit, at a constant size, changing only colour — the same
       thing the original did with ON_COLOR and OFF_COLOR. Size is deliberately
       not animated: a bit that shrinks on its way out reads as a third state
       rather than as off.
    */
    function drawBits() {
      p.noStroke();
      for (let col = 0; col < COLUMNS; col++) {
        const x = columnX(col);
        for (let row = rowsFor(col); row < ROWS; row++) {
          p.fill(p.lerpColor(offColor, onColor, smooth(level[col][row])));
          p.circle(x, rowY(row), bitD);
        }
      }
    }

    function drawLabels(digits) {
      p.noStroke();
      labelStyle(p, size);

      // Bit values down the left, so a column can be read off directly
      p.fill(palette.faint);
      p.textAlign(p.RIGHT, p.CENTER);
      const labelX = columnX(0) - bitD;
      for (let row = 0; row < ROWS; row++) {
        p.text(bitValue(row), labelX, rowY(row));
      }

      // Group headings and the decimal digit under each column
      p.textAlign(p.CENTER, p.CENTER);
      const headY = rowY(0) - rowStep * 0.85;
      const digitY = rowY(ROWS - 1) + rowStep * 0.8;

      for (let group = 0; group < GROUPS.length; group++) {
        p.fill(palette.grid);
        p.text(GROUPS[group], cx + (group - 1) * groupGap, headY);

        for (const col of [group * 2, group * 2 + 1]) {
          p.fill(palette.ink);
          p.text(digits[col], columnX(col), digitY);
        }
      }

      clearTracking(p);
    }
  };
}
