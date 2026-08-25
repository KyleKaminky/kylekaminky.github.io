import { YOUTUBE_URL } from '../data/site.js';
import { NAV } from '../data/sections.js';

export default function Nav({ view }) {
  const activeSection = view === 'figure' ? 'index' : view;

  return (
    <header className="nav">
      <a className="nav-brand" href="#/">Kyle Kaminky</a>

      {/* A single enabled section needs no navigation. */}
      {NAV.length > 1 && (
        <nav className="nav-links">
          {NAV.map((s) => (
            <a
              key={s.view}
              href={s.path}
              className={s.view === activeSection ? 'is-active' : undefined}
            >
              {s.label}
            </a>
          ))}
        </nav>
      )}

      <a className="btn btn-primary" href={YOUTUBE_URL} target="_blank" rel="noreferrer">
        YouTube channel
      </a>
    </header>
  );
}
