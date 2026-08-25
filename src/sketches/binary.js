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
const EASE = 0.18;                 // how quickly a bit settles after it flips

const bitValue = (row) => 8 >> row; // row 0 is the most significant

export default function binary({ get, palette, height, container }) {
  return (p) => {
    // Eased on-ness per bit, [column][row], so flips ripple rather than snap
    const level = Array.from({ length: COLUMNS }, () => new Float32Array(ROWS));

    let cx, cy, colGap, groupGap, rowStep, bitD, size, detailed;

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

    function updateLevels(digits) {
      for (let col = 0; col < COLUMNS; col++) {
        for (let row = rowsFor(col); row < ROWS; row++) {
          const on = (digits[col] & bitValue(row)) !== 0 ? 1 : 0;
          level[col][row] += (on - level[col][row]) * EASE;
        }
      }
    }

    function drawBits() {
      p.noStroke();
      for (let col = 0; col < COLUMNS; col++) {
        const x = columnX(col);
        for (let row = rowsFor(col); row < ROWS; row++) {
          const v = level[col][row];
          const y = rowY(row);

          // An off bit is a hollow socket; an on bit fills it.
          p.fill(palette.ghost);
          p.circle(x, y, bitD);

          if (v > 0.01) {
            p.fill(p.lerpColor(p.color(palette.ghost), p.color(palette.accent), v));
            p.circle(x, y, bitD * (0.55 + 0.45 * v));
          }
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
