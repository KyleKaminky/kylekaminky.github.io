/*
   The figure sheet — one animation, large, with knobs.

   Three stacked bands inside a single frame: a spec-plate header, a body split
   into canvas and rail, and a footnote. Prev/next wraps around the registry.
*/

import Blueprint from './Blueprint.jsx';
import FigureCanvas from './FigureCanvas.jsx';
import ParamSlider from './ParamSlider.jsx';
import { FIGS } from '../data/figures.js';
import { isPorted } from '../sketches/index.js';

export const SHEET_CANVAS_HEIGHT = 540;
export const SHEET_CANVAS_HEIGHT_NARROW = 320;

export default function FigureSheet({ figure, getParam, setParam, resetFigure, narrow }) {
  const i = FIGS.indexOf(figure);
  const prev = FIGS[(i - 1 + FIGS.length) % FIGS.length];
  const next = FIGS[(i + 1) % FIGS.length];
  const status = isPorted(figure.id) ? 'Live' : 'Video · porting';

  return (
    <div className="sheet-wrap">
      <a className="back-link" href="#/">← Index of figures</a>

      <Blueprint className="sheet">
        <div className="spec-plate">
          <div className="spec-cell spec-title">Fig. {figure.num} — {figure.title}</div>
          <div className="spec-cell">{figure.domain}</div>
          <div className="spec-cell">{status}</div>
          <div className="spec-cell">Sheet {figure.num} of {String(FIGS.length).padStart(2, '0')}</div>
        </div>

        <div className="sheet-body">
          <div className="sheet-canvas">
            <FigureCanvas
              figure={figure}
              height={narrow ? SHEET_CANVAS_HEIGHT_NARROW : SHEET_CANVAS_HEIGHT}
              dark
              getParam={getParam}
            />
          </div>

          <div className="sheet-rail">
            <div className="rail-label">Notes</div>
            {figure.notes.map((note, k) => (
              <p className="rail-note" key={k}>{note}</p>
            ))}

            <hr className="rail-rule" />

            <div className="rail-label rail-label-params">Parameters — live</div>
            <div className="param-list">
              {figure.params.map((param) => (
                <ParamSlider
                  key={param.key}
                  param={param}
                  value={getParam(param.key)}
                  onChange={(v) => setParam(param.key, v)}
                />
              ))}
            </div>

            <div className="rail-actions">
              <a className="btn btn-secondary" href={figure.video} target="_blank" rel="noreferrer">
                Watch the video
              </a>
              <a className="btn btn-ghost" href={figure.source} target="_blank" rel="noreferrer">
                View source
              </a>
              <button className="btn btn-ghost" type="button" onClick={resetFigure}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="sheet-foot">
          Originally animated in Processing for the channel · ported to p5.js — parameters are yours to break.
        </div>
      </Blueprint>

      <div className="prev-next">
        <a href={`#/figures/${prev.id}`}>← Fig. {prev.num} · {prev.title}</a>
        <a href={`#/figures/${next.id}`}>Fig. {next.num} · {next.title} →</a>
      </div>
    </div>
  );
}
