/*
   Sketch registry: figure id -> sketch factory.

   Adding a port is two lines — an import and an entry. Any figure with no entry
   here falls back to the placeholder, which is what drives the 'Video · porting'
   state on the index and the sheet.
*/

import orbits from './orbits.js';
import signal from './signal.js';
import placeholder from './placeholder.js';

export const SKETCHES = {
  orbits,
  signal,
};

export const isPorted = (id) => Boolean(SKETCHES[id]);

export const sketchFor = (id) => SKETCHES[id] ?? placeholder;
