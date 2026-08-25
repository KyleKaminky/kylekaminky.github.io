import Blueprint from '../components/Blueprint.jsx';
import FigureCanvas from '../components/FigureCanvas.jsx';
import { ABOUT, YOUTUBE_URL, GITHUB_URL } from '../data/site.js';
import { figById } from '../data/figures.js';

const ABOUT_CANVAS_HEIGHT = 260;

export default function AboutView({ getParam }) {
  const figure = figById('generative');

  return (
    <div className="sub-view about-view">
      <span className="kicker">Who made this</span>
      <hr className="rule kicker-rule" />

      <div className="about-grid">
        <div>
          <h1>Kyle Kaminky</h1>
          {ABOUT.map((para, i) => <p className="about-para" key={i}>{para}</p>)}
          <div className="about-actions">
            <a className="btn btn-primary" href={YOUTUBE_URL} target="_blank" rel="noreferrer">
              YouTube channel
            </a>
            <a className="btn btn-ghost" href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub — KyleKaminky
            </a>
          </div>
        </div>

        <Blueprint className="about-card">
          <FigureCanvas
            figure={figure}
            height={ABOUT_CANVAS_HEIGHT}
            getParam={(key) => getParam(figure.id, key)}
          />
          <div className="about-card-caption">Fig. {figure.num} · {figure.title}</div>
        </Blueprint>
      </div>
    </div>
  );
}
