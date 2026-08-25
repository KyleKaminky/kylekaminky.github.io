/* One figure on the index grid: a live canvas over a caption plate. */

import Blueprint from './Blueprint.jsx';
import FigureCanvas from './FigureCanvas.jsx';
import { isPorted } from '../sketches/index.js';

export const CARD_CANVAS_HEIGHT = 196;

export default function FigureCard({ figure, getParam }) {
  const status = isPorted(figure.id) ? 'Live' : 'Video · porting';

  return (
    <Blueprint as="a" className="fig-card" href={`#/figures/${figure.id}`}>
      <FigureCanvas figure={figure} height={CARD_CANVAS_HEIGHT} getParam={getParam} />
      <div className="fig-card-caption">
        <div className="fig-card-meta">
          <span className="accent">Fig. {figure.num} · {figure.domain}</span>
          <span className="dim">{status}</span>
        </div>
        <h3 className="fig-card-title">{figure.title}</h3>
        <p className="fig-card-blurb">{figure.blurb}</p>
      </div>
    </Blueprint>
  );
}
