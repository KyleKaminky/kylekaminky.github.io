/*
   Hash routing.

   GitHub Pages serves static files only, so a client-side route like
   /figures/orbits would 404 on a hard refresh. A hash router sidesteps that
   without needing a 404.html redirect trick, and still gives every figure a
   real, shareable, deep-linkable URL:

     #/                    index of figures
     #/figures/signal      one figure sheet
     #/projects  #/writing  #/resume  #/about   (as enabled in data/sections.js)
*/

import { useEffect, useState } from 'react';
import { figById } from './data/figures.js';
import { isEnabled } from './data/sections.js';

function parse(hash) {
  const path = hash.replace(/^#\/?/, '').replace(/\/$/, '');
  if (path === '') return { view: 'index' };
  if (isEnabled(path)) return { view: path };

  const match = path.match(/^figures\/(.+)$/);
  if (match && figById(match[1])) return { view: 'figure', figId: match[1] };

  return { view: 'index' };
}

export default function useRoute() {
  const [route, setRoute] = useState(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
