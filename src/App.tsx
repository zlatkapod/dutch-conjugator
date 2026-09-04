import { useState } from 'react';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import type { Session } from './lib/session';
import { loadSession } from './lib/session';
import './styles/App.css';

type Page = 'home' | 'quiz' | 'results';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  // Seeded straight from localStorage; an effect would render null first and
  // then immediately re-render with the restored session.
  const [session, setSession] = useState<Session | null>(loadSession);

  const handleStartSession = (newSession: Session) => {
    setSession(newSession);
    setCurrentPage('quiz');
  };

  const handleFinishQuiz = (finalSession: Session) => {
    setSession(finalSession);
    setCurrentPage('results');
  };

  const handleRestart = () => {
    setSession(null);
    setCurrentPage('home');
  };

  return (
    <main>
      {currentPage === 'home' && (
        <Home onStart={handleStartSession} />
      )}
      
      {currentPage === 'quiz' && session && (
        <Quiz session={session} onFinish={handleFinishQuiz} />
      )}
      
      {currentPage === 'results' && session && (
        <Results 
          session={session} 
          onRestart={handleRestart} 
          onHome={() => setCurrentPage('home')} 
        />
      )}
    </main>
  );
}

export default App;
