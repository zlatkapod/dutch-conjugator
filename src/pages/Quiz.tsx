import React, { useEffect, useRef, useState } from 'react';
import type { Session, VerbForms, Verb } from '../lib/session';
import { saveSession } from '../lib/session';
import { validateAnswer } from '../lib/validate';
import verbsData from '../data/verbs.json';
import VerbGrid from '../components/VerbGrid';
import type { VerbGridHandle } from '../components/VerbGrid';

interface QuizProps {
  session: Session;
  onFinish: (session: Session) => void;
}

const Quiz: React.FC<QuizProps> = ({ session, onFinish }) => {
  const [localSession, setLocalSession] = useState<Session>(session);
  
  const currentIndex = localSession.currentIndex;
  const currentInfinitive = localSession.verbInfinitives[currentIndex];
  const currentVerb = (verbsData as Verb[]).find(v => v.infinitive === currentInfinitive)!;
  const isChecked = localSession.checked[currentInfinitive];

  const gridRef = useRef<VerbGridHandle>(null);
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  // Keep the whole quiz playable from the keyboard: a fresh verb starts in its
  // first cell, and a checked one parks focus on the action button so Enter
  // moves straight on to the next verb.
  useEffect(() => {
    if (isChecked) {
      actionButtonRef.current?.focus();
    } else {
      gridRef.current?.focusFirstInput();
    }
  }, [currentInfinitive, isChecked]);

  const handleAnswerChange = (tense: 'present' | 'past' | 'perfect', person: keyof VerbForms, value: string) => {
    if (isChecked) return;

    const newSession = { ...localSession };
    newSession.answers[currentInfinitive][tense][person] = value;
    setLocalSession(newSession);
    saveSession(newSession);
  };

  const handleCheck = () => {
    if (isChecked) return;

    const newSession = { ...localSession };
    let verbMistakes = 0;
    
    const tenses = localSession.selectedTenses;
    const persons = localSession.selectedPersons;

    tenses.forEach(tense => {
      persons.forEach(person => {
        const userAnswer = newSession.answers[currentInfinitive][tense][person];
        const correctForms = currentVerb.forms[tense][person];
        if (!validateAnswer(userAnswer, correctForms)) {
          verbMistakes++;
        }
      });
    });

    newSession.checked[currentInfinitive] = true;
    newSession.mistakes += verbMistakes;
    newSession.perVerbMistakes[currentInfinitive] = verbMistakes;
    
    setLocalSession(newSession);
    saveSession(newSession);
  };

  const handleNext = () => {
    if (!isChecked) return;

    if (currentIndex < localSession.totalQuestions - 1) {
      const newSession = { ...localSession, currentIndex: currentIndex + 1 };
      setLocalSession(newSession);
      saveSession(newSession);
    } else {
      onFinish(localSession);
    }
  };

  const progress = ((currentIndex + 1) / localSession.totalQuestions) * 100;

  return (
    <div className="card">
      <div className="quiz-header">
        <div>Question {currentIndex + 1} / {localSession.totalQuestions}</div>
        <div className="mistake-info">Mistakes: {localSession.mistakes}</div>
      </div>
      
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="verb-display">{currentInfinitive}</div>

      <VerbGrid
        ref={gridRef}
        verb={currentVerb}
        answers={localSession.answers[currentInfinitive]}
        onAnswerChange={handleAnswerChange}
        isChecked={isChecked}
        onLastInputEnter={() => actionButtonRef.current?.focus()}
        selectedTenses={localSession.selectedTenses}
        selectedPersons={localSession.selectedPersons}
      />

      <div className="actions">
        {!isChecked ? (
          <button ref={actionButtonRef} className="btn btn-primary" onClick={handleCheck} style={{ width: '100%' }}>
            Check
          </button>
        ) : (
          <button ref={actionButtonRef} className="btn btn-primary" onClick={handleNext} style={{ width: '100%' }}>
            {currentIndex < localSession.totalQuestions - 1 ? 'Next Verb' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
