/*
   Which sections of the site are switched on.

   Résumé, Projects and About are all built, and their content is real — the
   experience and education carried over from the old site, the four real
   projects. Writing is still the design prototype's placeholder. All four are
   off while the animations are the focus.

   To bring one back, flip its `enabled` to true. Nav, routing and the view
   mounting all read from this list, so there is nothing else to change.
*/

export const SECTIONS = [
  { view: 'index', path: '#/', label: 'Figures', enabled: true },
  { view: 'projects', path: '#/projects', label: 'Projects', enabled: false },
  { view: 'writing', path: '#/writing', label: 'Writing', enabled: false },
  { view: 'resume', path: '#/resume', label: 'Résumé', enabled: false },
  { view: 'about', path: '#/about', label: 'About', enabled: false },
];

export const NAV = SECTIONS.filter((s) => s.enabled);

export const isEnabled = (view) =>
  SECTIONS.some((s) => s.view === view && s.enabled);
