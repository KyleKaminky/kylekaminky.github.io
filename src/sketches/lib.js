/*
   Shared helpers for the sketch ports.

   Everything here exists because all eleven animations need it: they all draw
   small tracked-out uppercase labels, they all draw dashed construction lines,
   and they all have to lay themselves out against a canvas whose width is
   whatever the container happens to be.
*/

export const LABEL_TRACKING = '.08em';

/*
   Put the renderer into "label" mode: Barlow, semibold, tracked out.
   p5 2.x builds the canvas font shorthand from textWeight(), so 600 selects
   the real semibold face rather than faking it — index.html asks Google Fonts
   for Barlow 600 so that face is actually present.
*/
export function labelStyle(p, size) {
  p.textFont('Barlow');
  p.textSize(size);
  p.textWeight(600);
  setProperty(p, 'letterSpacing', LABEL_TRACKING);
}

export function clearTracking(p) {
  setProperty(p, 'letterSpacing', 'normal');
}

// textProperty() reaches into the 2D context, which not every browser exposes
// the same way. A missing letterSpacing is cosmetic, so never let it throw.
function setProperty(p, prop, value) {
  try {
    p.textProperty(prop, value);
  } catch {
    /* browser without ctx.letterSpacing — labels just render untracked */
  }
}

/* Run draw() with a dash pattern applied, and always restore it. */
export function dashed(p, pattern, draw) {
  p.push();
  p.drawingContext.setLineDash(pattern);
  draw();
  p.drawingContext.setLineDash([]);
  p.pop();
}

/*
   Label sizes are deliberately absolute, not proportional. The design calls for
   10-13px in-canvas type, and that is true whether the sketch is 196px tall on
   an index card or 540px tall on a sheet — type that scaled with the canvas
   would be unreadable on the card and cartoonish on the sheet.
*/
export function labelSizeFor(height) {
  return height < 300 ? 10 : 12;
}
