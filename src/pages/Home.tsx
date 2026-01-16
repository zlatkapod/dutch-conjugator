import React, { useState, useEffect } from 'react';
import type { Session } from '../lib/session';
import { loadSession, clearSession, createSession } from '../lib/session';
import verbsData from '../data/verbs.json';

interface HomeProps {
  onStart: (session: Session) => void;
}

const Home: React.FC<HomeProps> = ({ onStart }) => {
  const [numQuestions, setNumQuestions] = useState(10);
  const [existingSession, setExistingSession] = useState<Session | null>(null);

  useEffect(() => {
    setExistingSession(loadSession());
  }, []);

  const handleStart = () => {
    // Randomly select verbs
    const shuffled = [...verbsData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));
    const infinitives = selected.map(v => v.infinitive);
    
    const newSession = createSession(infinitives, selected.length);
    onStart(newSession);
  };

  const handleContinue = () => {
    if (existingSession) {
      onStart(existingSession);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your progress?')) {
      clearSession();
      setExistingSession(null);
    }
  };

  return (
    <div className="home-screen card">
      <h1>Dutch Verb Trainer</h1>
      <p>Master Dutch verb conjugations across Present (TT), Past (OVT), and Perfect (VTT) tenses.</p>
      
      <div style={{ margin: '2rem 0' }}>
        <label htmlFor="numQuestions" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Number of questions (1-50):
        </label>
        <input
          id="numQuestions"
          type="number"
          min="1"
          max="50"
          value={numQuestions}
          onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)}
          style={{ width: '80px', textAlign: 'center' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
        <button className="btn btn-primary" onClick={handleStart}>
          Start New Test
        </button>
        
        {existingSession && (
          <button className="btn btn-outline" onClick={handleContinue}>
            Continue Session
          </button>
        )}
        
        {existingSession && (
          <button className="btn btn-danger" onClick={handleReset} style={{ marginTop: '1rem' }}>
            Reset Session
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
