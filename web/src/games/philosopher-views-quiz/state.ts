import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PhilosopherViewsQuizSettings { questionCount: "5" | "10" | "15"; }

export interface QuizEntry { question: string; answer: string; choices: string[]; }

export interface PhilosopherViewsQuizState {
  settings: PhilosopherViewsQuizSettings;
  entries: QuizEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type PhilosopherViewsQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string }[] = [
  { question: "Which philosopher said 'I think, therefore I am'?", answer: "René Descartes" },
  { question: "Who argued that reality consists of a world of ideal Forms?", answer: "Plato" },
  { question: "Which thinker proposed the Categorical Imperative as a moral law?", answer: "Immanuel Kant" },
  { question: "Who wrote the Social Contract and argued for popular sovereignty?", answer: "Jean-Jacques Rousseau" },
  { question: "Which philosopher believed all knowledge comes from sensory experience?", answer: "John Locke" },
  { question: "Who proposed the Superman (Übermensch) concept?", answer: "Friedrich Nietzsche" },
  { question: "Which ancient philosopher founded the Stoic school of thought?", answer: "Zeno of Citium" },
  { question: "Who wrote the Critique of Pure Reason?", answer: "Immanuel Kant" },
  { question: "Which philosopher argued that 'existence precedes essence'?", answer: "Jean-Paul Sartre" },
  { question: "Who is associated with the Allegory of the Cave?", answer: "Plato" },
  { question: "Which philosopher developed Utilitarianism with the principle of greatest happiness?", answer: "Jeremy Bentham" },
  { question: "Who famously doubted everything except his own act of doubting?", answer: "René Descartes" },
  { question: "Which thinker argued that the state of nature is 'war of all against all'?", answer: "Thomas Hobbes" },
  { question: "Who developed dialectical materialism as a foundation for communism?", answer: "Karl Marx" },
  { question: "Which philosopher coined the term 'the absurd' to describe life's meaninglessness?", answer: "Albert Camus" },
  { question: "Who wrote Nicomachean Ethics focusing on virtue and eudaimonia?", answer: "Aristotle" },
  { question: "Which philosopher argued that God is dead?", answer: "Friedrich Nietzsche" },
  { question: "Who developed the theory of Pragmatism in American philosophy?", answer: "William James" },
  { question: "Which ancient philosopher walked around Athens asking questions (Socratic method)?", answer: "Socrates" },
  { question: "Who wrote Being and Time, a foundational text of existentialism?", answer: "Martin Heidegger" },
];

const DISTRACTORS = ["Voltaire","David Hume","Baruch Spinoza","John Stuart Mill","Simone de Beauvoir","Bertrand Russell","Ludwig Wittgenstein","Francis Bacon","Auguste Comte","Epictetus","Marcus Aurelius","Confucius","Lao Tzu","Pythagoras","Thales"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: PhilosopherViewsQuizSettings): PhilosopherViewsQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(DISTRACTORS.filter(d => d !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: PhilosopherViewsQuizState, action: PhilosopherViewsQuizAction): PhilosopherViewsQuizState {
  if (state.done) return state;
  if (action.type === "select") {
    if (state.selected !== null) return state;
    const correct = state.entries[state.current]!.choices[action.index] === state.entries[state.current]!.answer;
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

export function isTerminal(state: PhilosopherViewsQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
