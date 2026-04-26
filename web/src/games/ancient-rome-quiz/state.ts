import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AncientRomeQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface AncientRomeQuizState { settings: AncientRomeQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type AncientRomeQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "Who was the first Roman Emperor?", answer: "Augustus", wrong: ["Julius Caesar","Nero","Caligula"] },
  { question: "What language did ancient Romans speak?", answer: "Latin", wrong: ["Greek","Etruscan","Oscan"] },
  { question: "In what year was Rome traditionally founded?", answer: "753 BC", wrong: ["509 BC","44 BC","27 BC"] },
  { question: "What famous road connected Rome to Brindisi?", answer: "Via Appia", wrong: ["Via Flaminia","Via Aurelia","Via Latina"] },
  { question: "Which structure was used for gladiatorial combat?", answer: "Colosseum", wrong: ["Pantheon","Forum","Circus Maximus"] },
  { question: "Who was Julius Caesar's adopted heir?", answer: "Octavian", wrong: ["Brutus","Antony","Lepidus"] },
  { question: "What was the Roman Senate's meeting place called?", answer: "Curia", wrong: ["Forum","Basilica","Atrium"] },
  { question: "Which river runs through Rome?", answer: "Tiber", wrong: ["Po","Arno","Rubicon"] },
  { question: "What did Romans call their citizen army?", answer: "Legion", wrong: ["Cohort","Maniple","Auxilia"] },
  { question: "Who was the Roman god of war?", answer: "Mars", wrong: ["Jupiter","Saturn","Ares"] },
  { question: "What structure brought water into Roman cities?", answer: "Aqueduct", wrong: ["Forum","Viaduct","Cloaca"] },
  { question: "In which year did Julius Caesar cross the Rubicon?", answer: "49 BC", wrong: ["44 BC","55 BC","27 BC"] },
  { question: "What was the Roman republic's highest office?", answer: "Consul", wrong: ["Praetor","Tribune","Quaestor"] },
  { question: "Which famous Carthaginian general invaded Italy?", answer: "Hannibal", wrong: ["Hamilcar","Hasdrubal","Scipio"] },
  { question: "What was the term for a Roman household's fire goddess?", answer: "Vesta", wrong: ["Juno","Diana","Minerva"] },
  { question: "Which emperor built a famous wall in Britain?", answer: "Hadrian", wrong: ["Trajan","Domitian","Marcus Aurelius"] },
  { question: "What does 'SPQR' stand for?", answer: "Senate and People of Rome", wrong: ["Sacred Power of the Republic","Supreme Protector Queen of Rome","Senate's Perpetual Quest for Rome"] },
  { question: "What battle ended the Roman Republic?", answer: "Actium", wrong: ["Pharsalus","Philippi","Zama"] },
  { question: "Who wrote the Aeneid?", answer: "Virgil", wrong: ["Ovid","Horace","Cicero"] },
  { question: "What was the currency used in ancient Rome?", answer: "Denarius", wrong: ["Aureus","Sestertius","Solidus"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: AncientRomeQuizSettings): AncientRomeQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const choices = shuffle([item.answer, ...item.wrong.slice(0, 3)], rng);
    return { question: item.question, answer: item.answer, choices };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: AncientRomeQuizState, action: AncientRomeQuizAction): AncientRomeQuizState {
  if (state.done) return state;
  if (action.type === "select") {
    if (state.selected !== null) return state;
    const entry = state.entries[state.current]!;
    const correct = entry.choices[action.index] === entry.answer;
    return { ...state, selected: action.index, score: correct ? state.score + 10 : state.score };
  }
  if (action.type === "next") {
    if (state.selected === null) return state;
    const next = state.current + 1;
    if (next >= state.entries.length) return { ...state, done: true };
    return { ...state, current: next, selected: null };
  }
  return state;
}

export function isTerminal(state: AncientRomeQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
