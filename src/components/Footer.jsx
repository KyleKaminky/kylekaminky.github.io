import { GITHUB_URL } from '../data/site.js';

export default function Footer() {
  return (
    <footer className="site-foot">
      <span>Kyle Kaminky — educational animations, signals, and software</span>
      <span>
        Drawn in Processing · ported to p5.js ·{' '}
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">code on GitHub</a>
      </span>
    </footer>
  );
}
