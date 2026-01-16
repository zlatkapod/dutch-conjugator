import React from 'react';
import type { Session } from '../lib/session';
import { clearSession } from '../lib/session';

interface ResultsProps {
  session: Session;
  onRestart: () => void;
  onHome: () => void;
}

const Results: React.FC<ResultsProps> = ({ session, onRestart, onHome }) => {
  const totalFields = session.totalQuestions * 12;
  const accuracy = (1 - session.mistakes / totalFields) * 100;

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
            .filter(([_, count]) => count > 0)
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
        <button className="btn btn-primary" onClick={handleRestart}>
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
