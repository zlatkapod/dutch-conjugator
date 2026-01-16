export interface VerbForms {
  ik: string;
  jij: string;
  hijzij: string;
  wij: string;
}

export interface Verb {
  infinitive: string;
  forms: {
    present: VerbForms;
    past: VerbForms;
    perfect: VerbForms;
  };
}

export interface Session {
  id: string;
  createdAt: string;
  totalQuestions: number;
  verbInfinitives: string[];
  currentIndex: number;
  answers: {
    [infinitive: string]: {
      present: VerbForms;
      past: VerbForms;
      perfect: VerbForms;
    };
  };
  checked: {
    [infinitive: string]: boolean;
  };
  mistakes: number;
  perVerbMistakes: { [infinitive: string]: number };
}

const SESSION_KEY = 'conjugator_session';

export const saveSession = (session: Session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const loadSession = (): Session | null => {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as Session;
  } catch (e) {
    console.error('Failed to parse session', e);
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const createSession = (infinitives: string[], totalQuestions: number): Session => {
  const session: Session = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    totalQuestions,
    verbInfinitives: infinitives,
    currentIndex: 0,
    answers: {},
    checked: {},
    mistakes: 0,
    perVerbMistakes: {},
  };
  
  infinitives.forEach(inf => {
    session.answers[inf] = {
      present: { ik: '', jij: '', hijzij: '', wij: '' },
      past: { ik: '', jij: '', hijzij: '', wij: '' },
      perfect: { ik: '', jij: '', hijzij: '', wij: '' },
    };
    session.checked[inf] = false;
    session.perVerbMistakes[inf] = 0;
  });

  saveSession(session);
  return session;
};
