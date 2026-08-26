/*
                          Birthday Paradox Simulator
                          --------------------------
   Ported from BirthdayParadox.pde. In a group of only 23 random people there is
   about a 50% chance that two of them share a birthday — which is the paradox,
   in that 23 feels far too small for a year with 365 days in it.

   The original asked "how many people until a match?", ran four rounds, and
   reported the count each time. This asks the question the other way round:
   fix the group size, run the trial over and over, and count how often a match
   turns up. That reframing is what makes the slider worth having — drag it to
   23 and the observed rate settles near a half, which is the fact the figure
   exists to demonstrate, and no single round can show it.

   Every trial fills the whole group rather than stopping at the first match,
   which is where this differs from the original. The question being asked is
   whether a group of n shares a birthday, and that needs all n people placed.
   A consequence worth knowing: a group often shares more than one day, so more
   than one marked collision is normal rather than a glitch. At a group of 23,
   27% of the groups that match share two days or more; at 40 it is 70%, and at
   60 it is 96%. The SHARED DAYS readout counts them, so the markers on the
   calendar always have something to be read against.

   Alongside the calendar is the exact curve,

       P(n) = 1 - (365/365)(364/365)...((365-n+1)/365)

   with a marker at the current group size. The curve is there from the first
   frame, so the answer is legible immediately; the trials then pile up
   underneath it and confirm it. Watching an observed rate approach a line you
   can already see is a much better experience than watching a number wander
   with nothing to compare it against.
*/

import { labelStyle, clearTracking, dashed, labelSizeFor, isDetailed } from './lib.js';

const DAYS = 365;
const MAX_STEP_MS = 100;
const HOLD_MS = 500;         // pause on a finished group before starting the next
const MAX_GROUP = 60;        // upper end of the probability curve
const MONTH_COLS = 4;
const MONTH_ROWS = 3;
const WEEK = 7;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const MONTH_START = DAYS_IN_MONTH.reduce((acc, d) => {
  acc.push(acc[acc.length - 1] + d);
  return acc;
}, [0]);

/* P(at least one shared birthday) for a group of n. */
function sharedProbability(n) {
  let none = 1;
  for (let k = 0; k < n; k++) none *= (DAYS - k) / DAYS;
  return 1 - none;
}
const CURVE = Array.from({ length: MAX_GROUP + 1 }, (_, n) => sharedProbability(n));

export default function birthday({ get, palette, height, container }) {
  return (p) => {
    const taken = new Uint8Array(DAYS);
    let drawn = [];          // days chosen so far this trial
    let matched = new Set(); // days landed on more than once
    let filled = 0;          // fractional people, so arrivals are paced
    let holding = 0;
    let trials = 0;
    let matches = 0;
    let countedFor = null; // the group size the tally above belongs to

    let gridX, gridY, gridW, gridH, panelX, panelW, size, detailed, dot;

    function layout() {
      size = labelSizeFor(p.height);
      detailed = isDetailed(p.height);

      const margin = p.height * 0.06;
      gridX = margin;
      gridY = margin;
      gridH = p.height - margin * 2;
      gridW = (detailed ? p.width * 0.56 : p.width - margin * 2) - margin;

      panelX = gridX + gridW + p.width * 0.04;
      panelW = p.width - margin - panelX;

      const cellW = gridW / MONTH_COLS;
      const cellH = gridH / MONTH_ROWS;
      dot = Math.min(cellW * 0.86 / WEEK, (cellH - size * 1.6) * 0.86 / 5);
    }

    function startTrial() {
      taken.fill(0);
      drawn = [];
      matched = new Set();
      filled = 0;
      holding = 0;
    }

    p.setup = function () {
      p.createCanvas(container.clientWidth, height);
      p.pixelDensity(Math.min(window.devicePixelRatio, 2));
      p.frameRate(60);
      p.ellipseMode(p.CENTER);
      layout();
      startTrial();
      p.describe(
        'A calendar of twelve months filling with randomly generated birthdays, ' +
        'beside the probability that a group of a given size shares one.'
      );
    };

    p.windowResized = function () {
      p.resizeCanvas(container.clientWidth, height);
      layout();
    };

    p.draw = function () {
      const group = p.constrain(Math.round(get('group')), 1, MAX_GROUP);
      const rate = Math.max(1, Math.round(get('speed')));
      const dt = Math.min(p.deltaTime, MAX_STEP_MS);

      /*
         The tally only means anything for one group size. Moving the slider
         has to discard it — otherwise trials run at 23 and trials run at 50
         would be averaged into a single percentage and compared against a
         curve neither of them belongs to.
      */
      if (group !== countedFor) {
        countedFor = group;
        trials = 0;
        matches = 0;
        startTrial();
      }

      if (drawn.length >= group) {
        // Trial complete: score it once, hold, then start the next
        if (holding === 0) {
          trials++;
          if (matched.size > 0) matches++;
        }
        holding += dt;
        if (holding >= HOLD_MS) startTrial();
      } else {
        filled += (dt / 1000) * rate;
        while (drawn.length < group && filled >= 1) {
          filled -= 1;
          addPerson();
        }
      }

      p.background(palette.bg);
      drawCalendar();
      if (detailed) drawPanel(group);
    };

    function addPerson() {
      const day = Math.floor(p.random(DAYS));
      if (taken[day]) matched.add(day);
      taken[day] = 1;
      drawn.push(day);
    }

    function drawCalendar() {
      const cellW = gridW / MONTH_COLS;
      const cellH = gridH / MONTH_ROWS;

      for (let m = 0; m < MONTHS.length; m++) {
        const col = m % MONTH_COLS;
        const row = Math.floor(m / MONTH_COLS);
        const x0 = gridX + col * cellW;
        const y0 = gridY + row * cellH;

        if (detailed) {
          p.noStroke();
          p.fill(palette.faint);
          labelStyle(p, Math.min(size, dot * 1.3));
          p.textAlign(p.LEFT, p.TOP);
          p.text(MONTHS[m], x0, y0);
          clearTracking(p);
        }

        const top = y0 + (detailed ? size * 1.5 : 0);
        for (let d = 0; d < DAYS_IN_MONTH[m]; d++) {
          const day = MONTH_START[m] + d;
          const cx = x0 + (d % WEEK + 0.5) * dot;
          const cy = top + (Math.floor(d / WEEK) + 0.5) * dot;

          if (matched.has(day)) {
            // A collision: the whole point, so it gets the brightest mark
            p.noStroke();
            p.fill(palette.ink);
            p.circle(cx, cy, dot * 0.62);
            p.noFill();
            p.stroke(palette.ink);
            p.strokeWeight(1);
            p.circle(cx, cy, dot * 1.05);
          } else if (taken[day]) {
            p.noStroke();
            p.fill(palette.accent);
            p.circle(cx, cy, dot * 0.58);
          } else {
            p.noStroke();
            p.fill(palette.ghost);
            p.circle(cx, cy, dot * 0.34);
          }
        }
      }
    }

    function drawPanel(group) {
      const theory = CURVE[group];
      const observed = trials ? matches / trials : 0;

      const rows = [
        ['GROUP SIZE', String(group)],
        ['PEOPLE PLACED', String(drawn.length)],
        ['SHARED DAYS', String(matched.size)],
        ['THEORY', `${(theory * 100).toFixed(1)}%`],
        ['TRIALS', String(trials)],
        ['WITH A MATCH', String(matches)],
        ['OBSERVED', trials ? `${(observed * 100).toFixed(1)}%` : '—'],
      ];

      p.noStroke();
      labelStyle(p, size);
      const lineH = size * 1.8;
      let y = gridY;
      rows.forEach(([label, value], i) => {
        const lit = i === 3 || i === 6;
        p.fill(lit ? palette.accent : palette.faint);
        p.textAlign(p.LEFT, p.TOP);
        p.text(label, panelX, y);
        p.fill(lit ? palette.accent : palette.ink);
        p.textAlign(p.RIGHT, p.TOP);
        p.text(value, panelX + panelW, y);
        y += lineH;
      });
      clearTracking(p);

      drawCurve(y + lineH * 0.5, gridY + gridH, group, observed);
    }

    /*
       P(n) across the whole slider range, with the current group marked. Drawn
       from the first frame so the answer is available before any trial has run;
       the observed rate is then plotted on top of it as a single point.
    */
    function drawCurve(top, bottom, group, observed) {
      const h = bottom - top;
      if (h < size * 5) return;

      const xFor = (n) => panelX + (n / MAX_GROUP) * panelW;
      const yFor = (prob) => bottom - prob * h;

      // Half-way line — the level the paradox is famous for reaching at 23
      p.stroke(palette.ghost);
      p.strokeWeight(1);
      dashed(p, [3, 4], () => p.line(panelX, yFor(0.5), panelX + panelW, yFor(0.5)));

      p.noFill();
      p.stroke(palette.grid);
      p.strokeWeight(1.5);
      p.beginShape();
      for (let n = 0; n <= MAX_GROUP; n++) p.vertex(xFor(n), yFor(CURVE[n]));
      p.endShape();

      // Where the slider currently sits
      const gx = xFor(group);
      p.stroke(palette.accent);
      p.strokeWeight(1);
      p.line(gx, top, gx, bottom);
      p.noStroke();
      p.fill(palette.accent);
      p.circle(gx, yFor(CURVE[group]), 6);

      // The observed rate, once there is one
      if (trials > 0) {
        p.noFill();
        p.stroke(palette.ink);
        p.strokeWeight(1.5);
        p.circle(gx, yFor(observed), 9);
      }

      p.noStroke();
      p.fill(palette.faint);
      labelStyle(p, size);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text('50%', panelX + 2, yFor(0.5) - 2);
      p.textAlign(p.LEFT, p.TOP);
      p.text('1', panelX, bottom + 2);
      p.textAlign(p.RIGHT, p.TOP);
      p.text(String(MAX_GROUP), panelX + panelW, bottom + 2);
      clearTracking(p);
    }
  };
}
