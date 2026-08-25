/* The landing moment: every figure running live, nothing a thumbnail. */

import FigureCard from '../components/FigureCard.jsx';
import { FIGS } from '../data/figures.js';
import { isPorted } from '../sketches/index.js';

export default function IndexView({ getParam }) {
  const live = FIGS.filter((f) => isPorted(f.id)).length;

  return (
    <div className="index-view">
      <div className="hero">
        <div>
          <h1>Animations that<br />figure things out</h1>
          <p className="hero-lede">
            Educational animations and visualizations by Kyle Kaminky. Every figure in this set
            runs live in your browser — open one and change its parameters. The produced videos
            are on the channel.
          </p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat-live">{live} of {FIGS.length} figures running live</div>
          <div className="hero-stat-dim">Processing → p5.js</div>
        </div>
      </div>

      <hr className="rule" />

      <div className="fig-grid">
        {FIGS.map((figure) => (
          <FigureCard
            key={figure.id}
            figure={figure}
            getParam={(key) => getParam(figure.id, key)}
          />
        ))}
      </div>
    </div>
  );
}
