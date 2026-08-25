import { YOUTUBE_URL } from '../data/site.js';

const LINKS = [
  ['#/', 'Figures'],
  ['#/projects', 'Projects'],
  ['#/writing', 'Writing'],
  ['#/resume', 'Résumé'],
  ['#/about', 'About'],
];

export default function Nav({ view }) {
  const active = {
    index: '#/', figure: '#/', projects: '#/projects',
    writing: '#/writing', resume: '#/resume', about: '#/about',
  }[view];

  return (
    <header className="nav">
      <a className="nav-brand" href="#/">Kyle Kaminky</a>
      <nav className="nav-links">
        {LINKS.map(([href, label]) => (
          <a key={href} href={href} className={href === active ? 'is-active' : undefined}>
            {label}
          </a>
        ))}
      </nav>
      <a className="btn btn-primary" href={YOUTUBE_URL} target="_blank" rel="noreferrer">
        YouTube channel
      </a>
    </header>
  );
}
