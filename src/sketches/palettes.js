/*
   Sketch palettes.

   Every sketch renders on two grounds: the white index cards and the dark
   field of a figure sheet. So no sketch hard-codes a colour — each one is
   handed a palette and uses these five roles:

     bg      the ground
     ink     readouts and primary type
     accent  the live / primary trace
     faint   secondary labels and trails
     ghost   construction lines — axes, quadrant dividers, reference lines
     grid    measurement grids that carry meaning, not just structure

   ghost and grid are deliberately separate. A quadrant divider is scaffolding
   and should recede; a quantization level is part of what the figure is saying
   and has to be legible as its own thing. Drawing both in ghost made the
   Signal Types sheet read as one undifferentiated set of grey lines.

   grid is accent-tinted because the design system allows exactly one accent,
   which is what distinguishes a line that means something from one that does not.
*/

export const PALETTES = {
  light: {
    bg: '#ffffff',
    ink: '#1d1f20',
    accent: '#5980a6',
    faint: 'rgba(29,31,32,.42)',
    ghost: 'rgba(29,31,32,.12)',
    grid: 'rgba(89,128,166,.34)',
  },
  dark: {
    bg: '#1d2d3d',
    ink: '#cfe0ef',
    accent: '#94bce3',
    faint: 'rgba(169,196,222,.45)',
    ghost: 'rgba(169,196,222,.16)',
    grid: 'rgba(148,188,227,.34)',
  },
};
