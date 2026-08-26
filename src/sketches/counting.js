/*
                                  Counting
                                  --------
   Ported from Counting.pde, with the structure of the Motion Canvas version of
   the same idea (src/scenes/radix-counting.tsx in the MotionCanvasPlayground
   repo), which teaches it better than either of the originals did.

   The most common way to count uses ten symbols. Computers use two, or eight,
   or sixteen. What actually differs between the systems is only the number of
   symbols available before a column runs out and has to carry — the concept of
   counting itself never changes.

   Three things carried over from the Motion Canvas scene:

   1. Place values, printed under each digit of the current number. The original
      sketch asserted the idea in a caption — "(2 Symbols: 0, 1)" — and left the
      reader to take it on trust. Showing 8 4 2 1 beneath the digits is the
      concept itself rather than a claim about it.
   2. A falling stream of previous values, newest and largest at the top. One
      incrementing number shows the value; a column of them shows the pattern,
      which is the thing worth seeing.
   3. A note at each rollover. Where the Motion Canvas scene hard-coded these
      per base, here it falls out of the arithmetic: any base rolls over exactly
      when the value divides evenly by it.
*/

import {
  labelStyle, clearTracking, labelSizeFor, isDetailed,
} from './lib.js';

const MAX_STEP_MS = 100;
const HISTORY = 7;          // how many past values stay on screen

/*
   Pacing is expressed as seconds per count, and one second is the floor.

   The asymmetry is deliberate. Running faster than a count per second teaches
   nothing — it just outruns reading, and speed is not a property of a number
   system the way quantization levels or carrier cycles are properties of their
   figures. Running slower does help: it gives you time to read a rollover
   propagate across the columns. So the fast end is pinned at one per second,
   which also reads as a clock, and the slider only opens downward from there.

   Seconds per count rather than counts per second keeps the slider on whole
   numbers; a rate slider would have to step in fractions.
*/
const MIN_PERIOD = 1;       // seconds per count, at the fast end
const MARGIN_X = 0.03;

const BASES = [
  { title: 'BINARY', base: 2 },
  { title: 'OCTAL', base: 8 },
  { title: 'DECIMAL', base: 10 },
  { title: 'HEX', base: 16 },
];

const format = (value, base, digits) =>
  value.toString(base).toUpperCase().padStart(digits, '0');

const digitsFor = (top, base) => top.toString(base).length;

/*
   Whether a value is an exact power of its base — the moment the base runs out
   of room and needs a whole new column.

   Every rollover is arithmetically "value % base === 0", but in binary that is
   every second number, and a note firing every other count is noise rather
   than instruction. Powers of the base are the rollovers worth naming: 1 -> 10,
   111 -> 1000. They also space themselves out logarithmically, so a fast base
   like binary gets roughly as many notes as a slow one like hex.
*/
function opensNewColumn(value, base) {
  if (value < base) return false;
  let n = value;
  while (n % base === 0) n /= base;
  return n === 1;
}

export default function counting({ get, palette, height, container }) {
  return (p) => {
    let count = 0; // continuous, so the stream slides rather than jumps

    let colW, colX, streamTop, rowStep, size, detailed;

    function layout() {
      size = labelSizeFor(p.height);
      detailed = isDetailed(p.height);

      const margin = p.width * MARGIN_X;
      colW = (p.width - margin * 2) / BASES.length;
      colX = BASES.map((_, i) => margin + colW * (i + 0.5));

      // Headings occupy the top on a sheet; a card is all stream.
      streamTop = detailed ? p.height * 0.30 : p.height * 0.16;
      rowStep = (p.height - streamTop) / (HISTORY + 1);
    }

    p.setup = function () {
      p.createCanvas(container.clientWidth, height);
      p.pixelDensity(Math.min(window.devicePixelRatio, 2));
      p.frameRate(60);
      p.textFont('Barlow');
      layout();
      p.describe(
        'The same count shown at once in binary, octal, decimal and hexadecimal, ' +
        'with the place value of each digit and a falling record of previous values.'
      );
    };

    p.windowResized = function () {
      p.resizeCanvas(container.clientWidth, height);
      layout();
    };

    /* Largest size at which `sample` still fits `maxWidth`. */
    function fitSize(sample, maxWidth, maxSize) {
      p.textSize(maxSize);
      const w = p.textWidth(sample);
      return w <= maxWidth ? maxSize : Math.max(6, (maxSize * maxWidth) / w);
    }

    p.draw = function () {
      layout();
      p.background(palette.bg);

      const top = Math.max(2, Math.round(get('top')));
      const period = Math.max(MIN_PERIOD, Math.round(get('period')));
      count += Math.min(p.deltaTime, MAX_STEP_MS) / 1000 / period;

      const span = top + 1;
      const n = Math.floor(count) % span;
      const f = count - Math.floor(count); // progress toward the next value

      BASES.forEach((system, i) => drawColumn(system, colX[i], top, span, n, f));
    };

    function drawColumn(system, x, top, span, n, f) {
      const digits = digitsFor(top, system.base);
      const sample = '0'.repeat(digits);
      const valueSize = fitSize(sample, colW * 0.82, Math.min(rowStep * 0.72, 46));

      if (detailed) drawHeading(system, x, n, f);
      drawStream(system, x, digits, valueSize, span, n, f);
    }

    function drawHeading(system, x, n, f) {
      p.noStroke();
      labelStyle(p, size);
      p.textAlign(p.CENTER, p.CENTER);

      p.fill(palette.ink);
      p.text(system.title, x, p.height * 0.07);
      p.fill(palette.faint);
      p.text(`BASE ${system.base}`, x, p.height * 0.07 + size * 1.7);

      // How many symbols this base has before it must carry — the whole point
      p.fill(palette.grid);
      p.text(`${system.base} SYMBOLS`, x, p.height * 0.07 + size * 3.1);

      drawRollover(system, x, n, f);
      clearTracking(p);
    }

    /*
       Where the Motion Canvas scene listed these per base by hand, here the
       condition is arithmetic, so it holds for any base and any count.
    */
    function drawRollover(system, x, n, f) {
      if (!opensNewColumn(n, system.base)) return;

      // Unpadded, so the note stays short enough for a narrow column
      const from = (n - 1).toString(system.base).toUpperCase();
      const to = n.toString(system.base).toUpperCase();

      p.fill(palette.accent);
      labelStyle(p, size);
      p.textAlign(p.CENTER, p.CENTER);
      // Brightest as it lands, gone before the next value arrives
      p.drawingContext.globalAlpha = Math.max(0, 1 - f * 1.6);
      p.text(`${from} \u2192 ${to}`, x, p.height * 0.07 + size * 4.5);
      p.drawingContext.globalAlpha = 1;
    }

    function drawStream(system, x, digits, valueSize, span, n, f) {
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);

      // k = -1 is the value sliding in from above, so nothing ever pops
      for (let k = HISTORY; k >= -1; k--) {
        const age = k + f;
        const value = ((n - k) % span + span) % span;
        const opacity = age < 0 ? age + 1 : 1 - age / HISTORY;
        if (opacity <= 0.01) continue;

        const y = streamTop + age * rowStep;
        const shrink = 1 - 0.28 * p.constrain(age / HISTORY, 0, 1);

        p.drawingContext.globalAlpha = p.constrain(opacity, 0, 1);
        p.fill(k <= 0 ? palette.accent : palette.ink);
        p.textSize(valueSize * shrink);
        p.textWeight(600);
        const text = format(value, system.base, digits);
        p.text(text, x, y);

        // Place values, under the newest value only, aligned to its digits
        if (detailed && k <= 0) drawPlaceValues(system, x, y, text, valueSize);
      }
      p.drawingContext.globalAlpha = 1;
    }

    function drawPlaceValues(system, x, y, text, valueSize) {
      p.textSize(valueSize);
      const width = p.textWidth(text);
      const digitW = width / text.length;

      // Only worth drawing if the place value fits under its digit
      const placeSize = Math.min(size, digitW * 0.62);
      if (placeSize < 6) return;

      p.textSize(placeSize);
      p.fill(palette.grid);
      for (let i = 0; i < text.length; i++) {
        const place = Math.pow(system.base, text.length - 1 - i);
        const cx = x - width / 2 + (i + 0.5) * digitW;
        p.text(place, cx, y + valueSize * 0.72);
      }
    }
  };
}
