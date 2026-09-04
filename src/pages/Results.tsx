import React, { useEffect, useRef } from 'react';
import type { Session } from '../lib/session';
import { clearSession } from '../lib/session';

interface ResultsProps {
  session: Session;
  onRestart: () => void;
  onHome: () => void;
}

const Results: React.FC<ResultsProps> = ({ session, onRestart, onHome }) => {
  // Only the tenses and persons the user picked were ever asked, so the
  // denominator follows the session's own grid rather than a full 3x4 one.
  // The fallbacks cover sessions stored before those settings existed.
  const cellsPerVerb = (session.selectedTenses?.length ?? 3) * (session.selectedPersons?.length ?? 4);
  const totalFields = session.totalQuestions * cellsPerVerb;
  const accuracy = totalFields > 0 ? (1 - session.mistakes / totalFields) * 100 : 0;

  const tryAgainRef = useRef<HTMLButtonElement>(null);

  // Last stop in the Enter-driven flow: land on the primary action so the
  // keyboard can start the next session without reaching for the mouse.
  useEffect(() => {
    tryAgainRef.current?.focus();
  }, []);

  const handleRestart = () => {
    clearSession();
    onRestart();
  };

  const handleHome = () => {
    onHome();
  };

  return (
    <div className="results-screen card">
      <h1>Results</h1>
      
      <div style={{ margin: '2rem 0' }}>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: accuracy > 80 ? 'var(--success)' : 'var(--text)' }}>
          {accuracy.toFixed(1)}%
        </div>
        <div style={{ color: 'var(--text-light)' }}>Accuracy</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: 'var(--radius)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{session.mistakes}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Total Mistakes</div>
        </div>
        <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: 'var(--radius)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{session.totalQuestions}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Verbs Completed</div>
        </div>
      </div>

      <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
        <h3>Mistakes by verb:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {Object.entries(session.perVerbMistakes)
            .filter(([, count]) => count > 0)
            .map(([verb, count]) => (
              <li key={verb} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <span>{verb}</span>
                <span style={{ color: 'var(--error)', fontWeight: 'bold' }}>{count} mistakes</span>
              </li>
            ))}
          {Object.values(session.perVerbMistakes).every(count => count === 0) && (
            <li style={{ color: 'var(--success)' }}>Perfect! No mistakes.</li>
          )}
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button ref={tryAgainRef} className="btn btn-primary" onClick={handleRestart}>
          Try Again
        </button>
        <button className="btn btn-outline" onClick={handleHome}>
          Home
        </button>
      </div>
    </div>
  );
};

export default Results;
