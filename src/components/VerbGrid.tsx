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

const VerbGrid: React.FC<VerbGridProps> = ({ verb, answers, onAnswerChange, isChecked, onEnterPressed }) => {
  const handleKeyDown = (e: React.KeyboardEvent, tenseIndex: number, personIndex: number) => {
    if (e.key === 'Enter') {
      if (tenseIndex === tenses.length - 1 && personIndex === persons.length - 1) {
        onEnterPressed?.();
      }
    }
  };

  return (
    <div className="grid-container">
      <div className="grid-header"></div>
      {tenses.map((tense) => (
        <div key={tense.key} className="grid-header">
          {tense.label}
          <span className="tense-hint">({tense.hint})</span>
        </div>
      ))}

      {persons.map((person, pIdx) => (
        <React.Fragment key={person.key}>
          <div className="grid-label">{person.label}</div>
          {tenses.map((tense, tIdx) => {
            const value = answers[tense.key][person.key];
            const correctForms = verb.forms[tense.key][person.key];
            const isCorrect = isChecked ? validateAnswer(value, correctForms) : null;
            
            return (
              <div key={tense.key}>
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
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default VerbGrid;
