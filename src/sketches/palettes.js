/*
   Sketch palettes.

   Every sketch renders on two grounds: the white index cards and the dark
   field of a figure sheet. So no sketch hard-codes a colour — each one is
   handed a palette and uses these five roles:

     bg      the ground
     ink     readouts and primary type
     accent  the live / primary trace
     faint   secondary labels and trails
     ghost   construction lines and grids (often dashed)
*/

export const PALETTES = {
  light: {
    bg: '#ffffff',
    ink: '#1d1f20',
    accent: '#5980a6',
    faint: 'rgba(29,31,32,.42)',
    ghost: 'rgba(29,31,32,.12)',
  },
  dark: {
    bg: '#1d2d3d',
    ink: '#cfe0ef',
    accent: '#94bce3',
    faint: 'rgba(169,196,222,.45)',
    ghost: 'rgba(169,196,222,.16)',
  },
};
