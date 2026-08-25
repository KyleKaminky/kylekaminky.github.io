import Blueprint from '../components/Blueprint.jsx';
import { PROJECTS } from '../data/site.js';

export default function ProjectsView() {
  return (
    <div className="sub-view projects-view">
      <span className="kicker">Other work</span>
      <hr className="rule kicker-rule" />
      <h1>Projects</h1>
      <p className="sub-lede">
        Hardware, software, signal processing and teaching — the work that is not an animation.
      </p>

      <div className="project-grid">
        {PROJECTS.map((p, i) => (
          <Blueprint className="project-card" key={i}>
            <span className="card-kicker">{p.kicker}</span>
            <h2 className="project-title">{p.title}</h2>
            <p className="project-blurb">{p.blurb}</p>
            <span className="tag tag-outline">{p.tag}</span>
          </Blueprint>
        ))}
      </div>
    </div>
  );
}
