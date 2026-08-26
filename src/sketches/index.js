/*
   Sketch registry: figure id -> sketch factory.

   Adding a port is two lines — an import and an entry. Any figure with no entry
   here falls back to the placeholder, which is what drives the 'Video · porting'
   state on the index and the sheet.
*/

import binary from './binary.js';
import counting from './counting.js';
import ook from './ook.js';
import orbits from './orbits.js';
import signal from './signal.js';
import placeholder from './placeholder.js';

export const SKETCHES = {
  binary,
  counting,
  ook,
  orbits,
  signal,
};

export const isPorted = (id) => Boolean(SKETCHES[id]);

export const sketchFor = (id) => SKETCHES[id] ?? placeholder;
