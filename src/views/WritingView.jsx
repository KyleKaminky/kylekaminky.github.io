import { POSTS } from '../data/site.js';

export default function WritingView() {
  return (
    <div className="sub-view writing-view">
      <span className="kicker">Notes and long-form</span>
      <hr className="rule kicker-rule" />
      <h1>Writing</h1>

      <div className="post-list">
        {POSTS.map((post, i) => (
          <a className="post-row" href="#/writing" key={i}>
            <span className="post-date">{post.date}</span>
            <span>
              <span className="post-title">{post.title}</span>
              <span className="post-blurb">{post.blurb}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
