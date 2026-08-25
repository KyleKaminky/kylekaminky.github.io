import { useEffect, useState } from 'react';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import FigureSheet from './components/FigureSheet.jsx';
import IndexView from './views/IndexView.jsx';
import ProjectsView from './views/ProjectsView.jsx';
import WritingView from './views/WritingView.jsx';
import AboutView from './views/AboutView.jsx';
import useRoute from './useRoute.js';
import useParams from './useParams.js';
import { figById } from './data/figures.js';

// Below this the sheet stacks to one column and its canvas gets shorter.
const NARROW = 900;

function useNarrow() {
  const [narrow, setNarrow] = useState(() => window.innerWidth < NARROW);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${NARROW - 1}px)`);
    const onChange = (e) => setNarrow(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

export default function App() {
  const route = useRoute();
  const narrow = useNarrow();
  const { getParam, setParam, resetFigure } = useParams();

  const figure = route.view === 'figure' ? figById(route.figId) : null;

  useEffect(() => {
    document.title = figure
      ? `Fig. ${figure.num} — ${figure.title} | Figuring Things Out`
      : 'Figuring Things Out';
  }, [figure]);

  return (
    <>
      <Nav view={route.view} />
      <main className="page">
        {route.view === 'index' && <IndexView getParam={getParam} />}
        {route.view === 'figure' && figure && (
          <FigureSheet
            figure={figure}
            narrow={narrow}
            getParam={(key) => getParam(figure.id, key)}
            setParam={(key, value) => setParam(figure.id, key, value)}
            resetFigure={() => resetFigure(figure.id)}
          />
        )}
        {route.view === 'projects' && <ProjectsView />}
        {route.view === 'writing' && <WritingView />}
        {route.view === 'about' && <AboutView getParam={getParam} />}
      </main>
      <Footer />
    </>
  );
}
