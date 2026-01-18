import React, { useState, useEffect } from 'react';
import type { Session, VerbForms } from '../lib/session';
import { loadSession, clearSession, createSession } from '../lib/session';
import verbsData from '../data/verbs.json';

interface HomeProps {
  onStart: (session: Session) => void;
}

const TENSES: { key: 'present' | 'past' | 'perfect'; label: string }[] = [
  { key: 'present', label: 'Present (TT)' },
  { key: 'past', label: 'Past (OVT)' },
  { key: 'perfect', label: 'Perfect (VTT)' },
];

const PERSONS: { key: keyof VerbForms; label: string }[] = [
  { key: 'ik', label: 'ik' },
  { key: 'jij', label: 'je' },
  { key: 'hijzij', label: 'zij' },
  { key: 'wij', label: 'we' },
];

const Home: React.FC<HomeProps> = ({ onStart }) => {
  const [numQuestions, setNumQuestions] = useState(5);
  const [selectedTenses, setSelectedTenses] = useState<('present' | 'past' | 'perfect')[]>(['present', 'past', 'perfect']);
  const [selectedPersons, setSelectedPersons] = useState<(keyof VerbForms)[]>(['ik', 'jij', 'hijzij', 'wij']);
  const [existingSession, setExistingSession] = useState<Session | null>(null);

  useEffect(() => {
    setExistingSession(loadSession());
  }, []);

  const handleStart = () => {
    if (selectedTenses.length === 0 || selectedPersons.length === 0) {
      alert('Please select at least one tense and one person.');
      return;
    }
    // Randomly select verbs
    const shuffled = [...verbsData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));
    const infinitives = selected.map(v => v.infinitive);
    
    const newSession = createSession(infinitives, selected.length, selectedTenses, selectedPersons);
    onStart(newSession);
  };

  const handleTenseToggle = (tense: 'present' | 'past' | 'perfect') => {
    setSelectedTenses(prev => 
      prev.includes(tense) ? prev.filter(t => t !== tense) : [...prev, tense]
    );
  };

  const handlePersonToggle = (person: keyof VerbForms) => {
    setSelectedPersons(prev => 
      prev.includes(person) ? prev.filter(p => p !== person) : [...prev, person]
    );
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
      <span className="culture-icon">🇳🇱 🎡 🧀</span>
      <h1>Dutch Verb Trainer <span className="dutch-flag"></span></h1>
      <p>Master Dutch verb conjugations across Present (TT), Past (OVT), and Perfect (VTT) tenses.</p>
      
      <div style={{ margin: '1.5rem 0' }}>
        <label htmlFor="numQuestions" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Number of questions (1-50):
        </label>
        <input
          id="numQuestions"
          type="number"
          min="1"
          max="50"
          value={numQuestions}
          onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
          style={{ width: '80px', textAlign: 'center', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ margin: '1.5rem 0' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Select Tenses:</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {TENSES.map(tense => (
            <label key={tense.key} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedTenses.includes(tense.key)}
                onChange={() => handleTenseToggle(tense.key)}
                style={{ marginRight: '0.4rem' }}
              />
              {tense.label}
            </label>
          ))}
        </div>
      </div>

      <div style={{ margin: '1.5rem 0' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Select Persons:</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {PERSONS.map(person => (
            <label key={person.key} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedPersons.includes(person.key)}
                onChange={() => handlePersonToggle(person.key)}
                style={{ marginRight: '0.4rem' }}
              />
              {person.label}
            </label>
          ))}
        </div>
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
