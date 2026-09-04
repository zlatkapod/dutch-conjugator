import React, { useImperativeHandle, useRef } from 'react';
import type { Verb, VerbForms } from '../lib/session';
import { validateAnswer } from '../lib/validate';

export interface VerbGridHandle {
  focusFirstInput: () => void;
}

interface VerbGridProps {
  verb: Verb;
  answers: {
    present: VerbForms;
    past: VerbForms;
    perfect: VerbForms;
  };
  onAnswerChange: (tense: 'present' | 'past' | 'perfect', person: keyof VerbForms, value: string) => void;
  isChecked: boolean;
  /** Enter in the last cell hands focus back to the page, which parks it on the action button. */
  onLastInputEnter?: () => void;
  selectedTenses?: ('present' | 'past' | 'perfect')[];
  selectedPersons?: (keyof VerbForms)[];
  ref?: React.Ref<VerbGridHandle>;
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
  onLastInputEnter,
  selectedTenses = ['present', 'past', 'perfect'],
  selectedPersons = ['ik', 'jij', 'hijzij', 'wij'],
  ref
}) => {
  const activeTenses = tenses.filter(t => selectedTenses.includes(t.key));
  const activePersons = persons.filter(p => selectedPersons.includes(p.key));

  // Cells in reading order: one entry per row/column pair, so Enter walks the
  // grid the same way the eye does.
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cellCount = activePersons.length * activeTenses.length;

  const focusCell = (index: number) => {
    const input = inputRefs.current[index];
    input?.focus();
    input?.select();
  };

  useImperativeHandle(ref, () => ({
    focusFirstInput: () => focusCell(0),
  }), []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // isComposing: an IME candidate is still open, so this Enter belongs to the word.
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
    e.preventDefault();

    if (index + 1 < cellCount) {
      focusCell(index + 1);
    } else {
      onLastInputEnter?.();
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
            const cellIndex = pIdx * activeTenses.length + tIdx;
            
            return (
              <div key={tense.key} className="cell-container">
                <input
                  type="text"
                  className={`cell-input ${isChecked ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                  value={value}
                  onChange={(e) => onAnswerChange(tense.key, person.key, e.target.value)}
                  disabled={isChecked}
                  onKeyDown={(e) => handleKeyDown(e, cellIndex)}
                  ref={(el) => { inputRefs.current[cellIndex] = el; }}
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
