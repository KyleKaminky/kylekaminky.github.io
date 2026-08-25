/*
   The only place in the app that touches p5.

   Owns one sketch instance for its lifetime and is responsible for the four
   things that keep eleven live canvases from melting a laptop:

     - creating the instance on mount and remove()ing it on unmount, so
       navigation never leaks a canvas or its animation loop
     - pausing with noLoop() whenever the canvas is off screen
     - resizing the canvas when the container width changes
     - honouring prefers-reduced-motion by drawing a single frame

   Parameters are read through a getter the sketch calls each frame, never
   passed in as arguments. That is what lets a slider change the animation
   without tearing the sketch down and restarting it.
*/

import { useEffect, useRef } from 'react';
import { sketchFor } from '../sketches/index.js';
import { PALETTES } from '../sketches/palettes.js';

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export default function FigureCanvas({ figure, height, dark = false, getParam }) {
  const hostRef = useRef(null);

  // The sketch reads parameters through this ref, so a slider change never
  // needs to re-run the mount effect below (which would restart the animation).
  // Kept current in an effect rather than during render: this effect is
  // declared first, so it has already run by the time the mount effect does.
  const getRef = useRef(getParam);
  useEffect(() => {
    getRef.current = getParam;
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let instance = null;
    let cancelled = false;
    let observer = null;
    let resizer = null;

    // Wait for Barlow before the first frame, otherwise p5 measures label
    // widths in the fallback font and the layout shifts when the real one lands.
    const ready = document.fonts?.ready ?? Promise.resolve();

    ready.then(async () => {
      if (cancelled) return;
      const { default: p5 } = await import('p5');
      if (cancelled) return;

      const build = sketchFor(figure.id)({
        get: (key) => getRef.current(key),
        palette: dark ? PALETTES.dark : PALETTES.light,
        height,
        container: host,
        figure,
      });

      instance = new p5(build, host);

      if (prefersReducedMotion()) {
        instance.noLoop();
        instance.redraw();
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) instance.loop();
            else instance.noLoop();
          }
        },
        { rootMargin: '120px' }
      );
      observer.observe(host);

      // The canvas is fluid in width, so react to the container rather than
      // to window resizes — the sheet's rail collapsing changes width too.
      resizer = new ResizeObserver(() => instance?.windowResized?.());
      resizer.observe(host);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      resizer?.disconnect();
      instance?.remove();
    };
    // figure.id and dark and height are what actually define the sketch.
  }, [figure, height, dark]);

  return <div ref={hostRef} style={{ height, lineHeight: 0 }} />;
}
