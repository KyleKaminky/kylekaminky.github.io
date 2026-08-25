/*
   Placeholder for figures whose Processing sketch has not been ported yet.

   Deliberately honest: it draws a survey grid and says what it is, rather than
   faking the animation. Figures using this carry status 'Video · porting', and
   the sheet still links out to the produced video and the .pde source.
*/

import { labelStyle, clearTracking, dashed, labelSizeFor } from './lib.js';

export default function placeholder({ palette, height, container, figure }) {
  return (p) => {
    let size;

    p.setup = function () {
      p.createCanvas(container.clientWidth, height);
      p.pixelDensity(Math.min(window.devicePixelRatio, 2));
      p.frameRate(30);
      size = labelSizeFor(height);
      p.describe(`Figure ${figure.num}, ${figure.title} — not yet ported to p5.js.`);
    };

    p.windowResized = function () {
      p.resizeCanvas(container.clientWidth, height);
    };

    p.draw = function () {
      p.background(palette.bg);

      // Survey grid
      const step = Math.max(24, p.height / 8);
      p.stroke(palette.ghost);
      p.strokeWeight(1);
      dashed(p, [2, 5], () => {
        for (let x = step; x < p.width; x += step) p.line(x, 0, x, p.height);
        for (let y = step; y < p.height; y += step) p.line(0, y, p.width, y);
      });

      // A single sweep, so the card is not completely static
      const t = (p.frameCount % 240) / 240;
      p.stroke(palette.accent);
      p.line(t * p.width, 0, t * p.width, p.height);

      p.noStroke();
      p.fill(palette.faint);
      labelStyle(p, size);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(`FIG. ${figure.num} · PORT IN PROGRESS`, p.width / 2, p.height / 2);
      clearTracking(p);
    };
  };
}
