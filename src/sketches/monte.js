/*
                          Estimating Pi by Monte Carlo
                          ----------------------------
   Ported from MonteCarloPi.pde. Monte Carlo methods use random sampling to get
   at a numerical result. Here the result is pi.

   Scatter points uniformly over a square running from -1 to 1 on both axes, and
   count how many land inside the unit circle. The circle's area is pi and the
   square's is 4, so the fraction inside tends to pi/4 — and four times that
   fraction is an estimate of pi that improves as the points pile up.

   Two additions over the original:

   - The square and the circle are drawn. The original never did: it plotted
     axes and coloured each point by which side it fell on, so the circle only
     emerged from the colours. That is a lovely effect, but the argument being
     made is about the ratio of two areas, and it is hard to reason about an
     area that is not on the page.
   - The estimate is traced against the number of points, with pi as a fixed
     reference. A single number tells you where the estimate is; the trace shows
     it thrashing early and settling later, which is the actual behaviour of the
     method and the reason it needs so many samples.

   Points are drawn once into an offscreen buffer rather than replayed every
   frame — at twenty thousand samples redrawing the scatter each frame is most
   of the work in the sketch, and the marks never change once placed. The
   original got the same effect by simply never clearing its background.
*/

import { labelStyle, clearTracking, dashed, labelSizeFor, isDetailed } from './lib.js';

const MAX_STEP_MS = 100;
const TRACE_SAMPLES = 220;  // points in the convergence trace
const TRACE_SPAN = 0.55;    // vertical half-range of the trace, either side of pi

export default function monte({ get, palette, height, container }) {
  return (p) => {
    let scatter = null;      // offscreen buffer holding every point drawn so far
    let inside = 0;
    let total = 0;
    let carry = 0;           // fractional points owed from the last frame
    let trace = [];

    let plotX, plotY, plotSize, panelX, panelW, size, detailed, dotR;

    function layout() {
      size = labelSizeFor(p.height);
      detailed = isDetailed(p.height);

      const margin = p.height * 0.07;
      plotSize = Math.min(p.height - margin * 2, detailed ? p.width * 0.52 : p.width - margin * 2);
      plotX = margin;
      plotY = (p.height - plotSize) / 2;

      panelX = plotX + plotSize + p.width * 0.05;
      panelW = p.width - margin - panelX;

      dotR = Math.max(1.6, plotSize * 0.006);
    }

    function reset() {
      if (scatter) scatter.remove();
      scatter = p.createGraphics(plotSize, plotSize);
      scatter.pixelDensity(Math.min(window.devicePixelRatio, 2));
      scatter.noStroke();
      inside = 0;
      total = 0;
      carry = 0;
      trace = [];
    }

    p.setup = function () {
      p.createCanvas(container.clientWidth, height);
      p.pixelDensity(Math.min(window.devicePixelRatio, 2));
      p.frameRate(60);
      p.ellipseMode(p.CENTER);
      layout();
      reset();
      p.describe(
        'Random points scattered over a square with an inscribed circle. The ' +
        'fraction landing inside the circle estimates pi, traced as it converges.'
      );
    };

    p.windowResized = function () {
      p.resizeCanvas(container.clientWidth, height);
      layout();
      reset(); // the buffer is sized to the plot, and the marks cannot be rescaled
    };

    const estimate = () => (total === 0 ? 0 : (4 * inside) / total);

    p.draw = function () {
      const cap = Math.max(100, Math.round(get('cap')));
      const rate = Math.max(1, Math.round(get('rate')));

      // Rate is quoted per frame at 60fps, but accumulated from elapsed time so
      // a slow frame or a throttled tab does not change the sampling.
      carry += (Math.min(p.deltaTime, MAX_STEP_MS) / 1000) * rate * 60;
      const batch = Math.floor(carry);
      carry -= batch;

      if (total >= cap) reset();
      else if (batch > 0) addPoints(Math.min(batch, cap - total));

      p.background(palette.bg);
      p.image(scatter, plotX, plotY);
      drawFrame();
      if (detailed) drawPanel(cap);
    };

    function addPoints(n) {
      const half = plotSize / 2;
      for (let i = 0; i < n; i++) {
        const x = p.random(-1, 1);
        const y = p.random(-1, 1);
        const hit = x * x + y * y < 1;
        if (hit) inside++;
        total++;

        scatter.fill(hit ? palette.accent : palette.faint);
        scatter.circle(half + x * half, half - y * half, dotR * 2);
      }

      // One trace sample per slot, so the trace has a fixed cost regardless of
      // how fast the points are arriving.
      const slot = Math.floor((total / Math.max(1, Math.round(get('cap')))) * TRACE_SAMPLES);
      if (trace.length <= slot) trace.push({ n: total, est: estimate() });
    }

    /* The square and the circle whose areas are being compared. */
    function drawFrame() {
      p.noFill();
      p.stroke(palette.ghost);
      p.strokeWeight(1);
      p.rect(plotX, plotY, plotSize, plotSize);
      p.circle(plotX + plotSize / 2, plotY + plotSize / 2, plotSize);

      dashed(p, [3, 4], () => {
        p.line(plotX, plotY + plotSize / 2, plotX + plotSize, plotY + plotSize / 2);
        p.line(plotX + plotSize / 2, plotY, plotX + plotSize / 2, plotY + plotSize);
      });

      if (!detailed) return;
      p.noStroke();
      p.fill(palette.faint);
      labelStyle(p, size);
      p.textAlign(p.CENTER, p.TOP);
      p.text('−1', plotX, plotY + plotSize + 6);
      p.text('1', plotX + plotSize, plotY + plotSize + 6);
      clearTracking(p);
    }

    function drawPanel(cap) {
      const est = estimate();
      const rows = [
        ['π', Math.PI.toFixed(5)],
        ['ESTIMATE', total ? est.toFixed(5) : '—'],
        ['ERROR', total ? Math.abs(est - Math.PI).toFixed(5) : '—'],
        ['INSIDE', inside.toLocaleString('en-US')],
        ['POINTS', total.toLocaleString('en-US')],
      ];

      p.noStroke();
      labelStyle(p, size);
      const lineH = size * 1.85;
      let y = plotY;

      rows.forEach(([label, value], i) => {
        p.fill(i === 1 ? palette.accent : palette.faint);
        p.textAlign(p.LEFT, p.TOP);
        p.text(label, panelX, y);
        p.fill(i === 1 ? palette.accent : palette.ink);
        p.textAlign(p.RIGHT, p.TOP);
        p.text(value, panelX + panelW, y);
        y += lineH;
      });

      // The whole method in one line
      y += lineH * 0.4;
      p.fill(palette.grid);
      p.textAlign(p.LEFT, p.TOP);
      p.text('π  ≈  4 × INSIDE / POINTS', panelX, y);
      clearTracking(p);

      drawTrace(plotY + plotSize * 0.52, plotY + plotSize, cap);
    }

    /*
       The estimate against the number of points, with pi as a fixed reference.
       Early samples swing wildly and later ones barely move — that shape is the
       point of the figure, and a single readout cannot show it.
    */
    function drawTrace(top, bottom, cap) {
      const h = bottom - top;
      if (h < size * 4) return;

      const yFor = (v) =>
        bottom - h / 2 - ((v - Math.PI) / TRACE_SPAN) * (h / 2);

      p.stroke(palette.grid);
      p.strokeWeight(1);
      p.line(panelX, yFor(Math.PI), panelX + panelW, yFor(Math.PI));

      p.noStroke();
      p.fill(palette.grid);
      labelStyle(p, size);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text('π', panelX, yFor(Math.PI) - 3);
      clearTracking(p);

      if (trace.length < 2) return;
      p.noFill();
      p.stroke(palette.accent);
      p.strokeWeight(1.5);
      p.beginShape();
      for (const s of trace) {
        const x = panelX + (s.n / cap) * panelW;
        p.vertex(x, p.constrain(yFor(s.est), top, bottom));
      }
      p.endShape();
    }
  };
}
