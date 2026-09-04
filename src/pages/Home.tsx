import React, { useState, useMemo } from 'react';
import type { Session, VerbForms, Verb, VerbType } from '../lib/session';
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

const VERB_TYPES: { key: VerbType; label: string }[] = [
  { key: 'regular', label: 'Regular (weak)' },
  { key: 'irregular', label: 'Irregular (strong)' },
  { key: 'mixed', label: 'Mixed' },
];

const ALL_VERBS = verbsData as Verb[];

const VERB_TYPE_COUNTS = ALL_VERBS.reduce<Record<string, number>>((acc, verb) => {
  if (verb.type) acc[verb.type] = (acc[verb.type] ?? 0) + 1;
  return acc;
}, {});

/**
 * Fisher-Yates. `sort(() => 0.5 - Math.random())` is not a fair shuffle: it
 * leaves items near their starting index, and since verbs.json is sorted
 * alphabetically that drew 'aarzelen' roughly four times as often as 'zwijgen'.
 */
const shuffle = <T,>(items: T[]): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const Home: React.FC<HomeProps> = ({ onStart }) => {
  const [numQuestions, setNumQuestions] = useState(5);
  const [selectedTenses, setSelectedTenses] = useState<('present' | 'past' | 'perfect')[]>(['present', 'past', 'perfect']);
  const [selectedPersons, setSelectedPersons] = useState<(keyof VerbForms)[]>(['ik', 'jij', 'hijzij', 'wij']);
  const [selectedTypes, setSelectedTypes] = useState<VerbType[]>(['regular', 'irregular', 'mixed']);
  // localStorage is synchronous, so seed state directly rather than syncing it
  // in from an effect - that rendered once with null and then again with the session.
  const [existingSession, setExistingSession] = useState<Session | null>(loadSession);

  const verbPool = useMemo(
    () => ALL_VERBS.filter(verb => verb.type !== undefined && selectedTypes.includes(verb.type)),
    [selectedTypes]
  );

  const handleStart = () => {
    if (selectedTenses.length === 0 || selectedPersons.length === 0) {
      alert('Please select at least one tense and one person.');
      return;
    }
    if (verbPool.length === 0) {
      alert('Please select at least one verb type.');
      return;
    }
    // Randomly select verbs from the pool the type filter left us
    const selected = shuffle(verbPool).slice(0, Math.min(numQuestions, verbPool.length));
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

  const handleTypeToggle = (type: VerbType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
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

      <div style={{ margin: '1.5rem 0' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Select Verb Types:</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {VERB_TYPES.map(type => (
            <label key={type.key} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedTypes.includes(type.key)}
                onChange={() => handleTypeToggle(type.key)}
                style={{ marginRight: '0.4rem' }}
              />
              {type.label} ({VERB_TYPE_COUNTS[type.key] ?? 0})
            </label>
          ))}
        </div>
        <p style={{ marginTop: '0.6rem', marginBottom: 0, fontSize: '0.85rem', opacity: 0.7 }}>
          {verbPool.length === 0
            ? 'No verbs selected - pick at least one type.'
            : verbPool.length < numQuestions
              ? `Only ${verbPool.length} verbs match, so the test will be ${verbPool.length} questions long.`
              : `Drawing from ${verbPool.length} verbs.`}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
        <button className="btn btn-primary" onClick={handleStart} disabled={verbPool.length === 0}>
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
