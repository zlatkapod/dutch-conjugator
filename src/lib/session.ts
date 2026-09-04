export interface VerbForms {
  ik: string;
  jij: string;
  hijzij: string;
  wij: string;
}

/** 'mixed' = weak past with a strong participle, or the reverse (vragen -> vroeg/gevraagd). */
export type VerbType = 'regular' | 'irregular' | 'mixed';

export interface Verb {
  infinitive: string;
  /** English gloss, for hints and results. */
  english?: string;
  type?: VerbType;
  /** Perfect auxiliary; 'hebben|zijn' when both are current. */
  aux?: string;
  /** Set only where a verb needs a caveat, e.g. zullen has no past participle. */
  note?: string;
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
  selectedTenses: ('present' | 'past' | 'perfect')[];
  selectedPersons: (keyof VerbForms)[];
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

export const createSession = (
  infinitives: string[], 
  totalQuestions: number,
  selectedTenses: ('present' | 'past' | 'perfect')[] = ['present', 'past', 'perfect'],
  selectedPersons: (keyof VerbForms)[] = ['ik', 'jij', 'hijzij', 'wij']
): Session => {
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
    selectedTenses,
    selectedPersons,
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
