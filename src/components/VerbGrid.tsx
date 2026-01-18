import React from 'react';
import type { Verb, VerbForms } from '../lib/session';
import { validateAnswer } from '../lib/validate';

interface VerbGridProps {
  verb: Verb;
  answers: {
    present: VerbForms;
    past: VerbForms;
    perfect: VerbForms;
  };
  onAnswerChange: (tense: 'present' | 'past' | 'perfect', person: keyof VerbForms, value: string) => void;
  isChecked: boolean;
  onEnterPressed?: () => void;
  selectedTenses?: ('present' | 'past' | 'perfect')[];
  selectedPersons?: (keyof VerbForms)[];
}

const persons: { key: keyof VerbForms; label: string }[] = [
  { key: 'ik', label: 'ik' },
  { key: 'jij', label: 'je/jij' },
  { key: 'hijzij', label: 'hij/zij' },
  { key: 'wij', label: 'we/wij' },
];

const tenses: { key: 'present' | 'past' | 'perfect'; label: string; hint: string }[] = [
  { key: 'present', label: 'Present', hint: 'TT' },
  { key: 'past', label: 'Past', hint: 'OVT' },
  { key: 'perfect', label: 'Perfect', hint: 'VTT' },
];

const VerbGrid: React.FC<VerbGridProps> = ({ 
  verb, 
  answers, 
  onAnswerChange, 
  isChecked, 
  onEnterPressed,
  selectedTenses = ['present', 'past', 'perfect'],
  selectedPersons = ['ik', 'jij', 'hijzij', 'wij']
}) => {
  const activeTenses = tenses.filter(t => selectedTenses.includes(t.key));
  const activePersons = persons.filter(p => selectedPersons.includes(p.key));

  const handleKeyDown = (e: React.KeyboardEvent, tenseIndex: number, personIndex: number) => {
    if (e.key === 'Enter') {
      if (tenseIndex === activeTenses.length - 1 && personIndex === activePersons.length - 1) {
        onEnterPressed?.();
      }
    }
  };

  return (
    <div className="grid-container" style={{ gridTemplateColumns: `auto repeat(${activeTenses.length}, 1fr)` }}>
      <div className="grid-header"></div>
      {activeTenses.map((tense) => (
        <div key={tense.key} className="grid-header">
          {tense.label}
          <span className="tense-hint">({tense.hint})</span>
        </div>
      ))}

      {activePersons.map((person, pIdx) => (
        <React.Fragment key={person.key}>
          <div className="grid-label">{person.label}</div>
          {activeTenses.map((tense, tIdx) => {
            const value = answers[tense.key][person.key];
            const correctForms = verb.forms[tense.key][person.key];
            const isCorrect = isChecked ? validateAnswer(value, correctForms) : null;
            
            return (
              <div key={tense.key} className="cell-container">
                <input
                  type="text"
                  className={`cell-input ${isChecked ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                  value={value}
                  onChange={(e) => onAnswerChange(tense.key, person.key, e.target.value)}
                  disabled={isChecked}
                  onKeyDown={(e) => handleKeyDown(e, tIdx, pIdx)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                {isChecked && !isCorrect && (
                  <div className="correct-answer">
                    {correctForms.split('|')[0]}
                  </div>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default VerbGrid;
