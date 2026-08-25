/*
   Résumé.

   The old site drew this as flip cards and scroll-triggered fades. Here it is a
   drawing set like everything else: each role and each credential is a framed
   plate with a spec header, so the page reads as one system with the figures
   rather than as a separate site bolted on.
*/

import Blueprint from '../components/Blueprint.jsx';
import { ROLES, EDUCATION, SKILLS, CONTACT } from '../data/resume.js';

export default function ResumeView() {
  return (
    <div className="sub-view resume-view">
      <span className="kicker">Experience and education</span>
      <hr className="rule kicker-rule" />
      <h1>Résumé</h1>
      <p className="sub-lede">
        Mission systems and software engineering, with a long-standing detour into signals,
        machine learning and making things move on a screen.
      </p>

      <h2 className="section-head">Professional experience</h2>
      <div className="plate-stack">
        {ROLES.map((role) => (
          <Blueprint className="plate-card" key={`${role.org}-${role.title}`}>
            <div className="plate-head">
              <span className="plate-head-title">{role.title}</span>
              <span className="plate-head-cell">{role.org}</span>
              <span className="plate-head-cell">{role.period}</span>
            </div>
            <ul className="plate-body">
              {role.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </Blueprint>
        ))}
      </div>

      <h2 className="section-head">Education</h2>
      <div className="edu-grid">
        {EDUCATION.map((ed) => (
          <Blueprint className="plate-card" key={ed.credential}>
            <div className="plate-head">
              <span className="plate-head-title">{ed.org}</span>
              {ed.detail && <span className="plate-head-cell">{ed.detail}</span>}
            </div>
            <div className="plate-body">
              <h3 className="edu-credential">{ed.credential}</h3>
              <ul>
                {ed.items.map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            </div>
          </Blueprint>
        ))}
      </div>

      <h2 className="section-head">Skills and interests</h2>
      <div className="skill-row">
        {SKILLS.map((s) => <span className="tag tag-outline" key={s}>{s}</span>)}
      </div>

      <h2 className="section-head">Contact</h2>
      <div className="about-actions">
        {CONTACT.map((c, i) => (
          <a
            className={`btn ${i === 0 ? 'btn-primary' : 'btn-ghost'}`}
            href={c.href}
            key={c.label}
            target="_blank"
            rel="noreferrer"
          >
            {c.label}
          </a>
        ))}
      </div>
    </div>
  );
}
