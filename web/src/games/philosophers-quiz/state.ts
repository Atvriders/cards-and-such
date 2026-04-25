import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PhilosophersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PhilosophersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface PhilosophersQuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Socrates was sentenced to death for which charge?", choices: ["Treason", "Corrupting the youth and impiety", "Murder", "Tax evasion"], correct: 1 },
  { question: "Which philosopher wrote the Republic?", choices: ["Aristotle", "Socrates", "Plato", "Thucydides"], correct: 2 },
  { question: "'I think therefore I am' was stated by?", choices: ["Kant", "Descartes", "Spinoza", "Locke"], correct: 1 },
  { question: "Which philosopher is considered the father of empiricism?", choices: ["Descartes", "Leibniz", "John Locke", "David Hume"], correct: 2 },
  { question: "Nietzsche famously declared?", choices: ["God is love", "God is dead", "God is logic", "God is nature"], correct: 1 },
  { question: "The categorical imperative is a concept of?", choices: ["Hegel", "Schopenhauer", "Kant", "Fichte"], correct: 2 },
  { question: "Which philosopher wrote the Critique of Pure Reason?", choices: ["Hegel", "Kant", "Leibniz", "Descartes"], correct: 1 },
  { question: "Existentialism is most associated with which philosopher?", choices: ["Camus", "Sartre", "Heidegger", "Kierkegaard"], correct: 1 },
  { question: "Which ancient philosopher taught Alexander the Great?", choices: ["Socrates", "Plato", "Aristotle", "Pythagoras"], correct: 2 },
  { question: "The Tao Te Ching was written by?", choices: ["Confucius", "Zhuangzi", "Laozi", "Mencius"], correct: 2 },
  { question: "Utilitarianism was developed by?", choices: ["Kant", "Bentham", "Rousseau", "Locke"], correct: 1 },
  { question: "Which philosopher wrote the Social Contract?", choices: ["Voltaire", "Montesquieu", "Rousseau", "Diderot"], correct: 2 },
  { question: "Plato's theory of knowledge is based on?", choices: ["Sense experience only", "The world of Forms/Ideas", "Scientific method", "Divine revelation"], correct: 1 },
  { question: "Which philosopher is associated with 'the will to power'?", choices: ["Schopenhauer", "Nietzsche", "Wagner", "Heidegger"], correct: 1 },
  { question: "The Leviathan was written by?", choices: ["John Locke", "Thomas Hobbes", "Rousseau", "Machiavelli"], correct: 1 },
  { question: "Which philosopher said 'Man is born free and everywhere he is in chains'?", choices: ["Voltaire", "Rousseau", "Montesquieu", "Hume"], correct: 1 },
  { question: "The philosophy of Stoicism was founded by?", choices: ["Epicurus", "Zeno of Citium", "Pyrrho", "Diogenes"], correct: 1 },
  { question: "Which philosopher wrote Beyond Good and Evil?", choices: ["Schopenhauer", "Nietzsche", "Stirner", "Feuerbach"], correct: 1 },
  { question: "Confucius taught which core virtue?", choices: ["Ren (benevolence)", "Li (ritual)", "Yi (righteousness)", "All three equally"], correct: 3 },
  { question: "Which philosopher proposed the allegory of the cave?", choices: ["Aristotle", "Socrates", "Plato", "Epicurus"], correct: 2 },
  { question: "John Stuart Mill refined utilitarianism by introducing the concept of?", choices: ["Rule vs act utility", "Higher and lower pleasures", "Social contracts", "Common good"], correct: 1 },
  { question: "Phenomenology was developed by?", choices: ["Heidegger", "Husserl", "Sartre", "Merleau-Ponty"], correct: 1 },
  { question: "Which philosopher wrote the Ethics, written in geometric style?", choices: ["Leibniz", "Spinoza", "Descartes", "Malebranche"], correct: 1 },
  { question: "The Socratic method involves?", choices: ["Lecturing with authority", "Guided questioning to stimulate thought", "Writing treatises", "Silent meditation"], correct: 1 },
  { question: "Albert Camus is associated with which philosophy?", choices: ["Existentialism", "Absurdism", "Nihilism", "Stoicism"], correct: 1 },
  { question: "Which philosopher wrote An Essay Concerning Human Understanding?", choices: ["Hume", "Locke", "Berkeley", "Reid"], correct: 1 },
  { question: "Simone de Beauvoir wrote which feminist philosophical work?", choices: ["The Female Eunuch", "The Second Sex", "A Room of One's Own", "The Feminine Mystique"], correct: 1 },
  { question: "Which Greek philosopher is known for the dictum 'know thyself'?", choices: ["Plato", "Aristotle", "Socrates", "Heraclitus"], correct: 2 },
  { question: "Which philosopher associated mind and body as two distinct substances (dualism)?", choices: ["Spinoza", "Descartes", "Leibniz", "Hobbes"], correct: 1 },
  { question: "The Analects are associated with which philosopher?", choices: ["Laozi", "Zhuangzi", "Confucius", "Mencius"], correct: 2 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: PhilosophersQuizSettings): PhilosophersQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  let pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => {
    const indexed = q.choices.map((c, i) => ({ c, i }));
    const shuffled = shuffle(indexed, rng);
    const newCorrect = shuffled.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: shuffled.map(x => x.c) as [string, string, string, string], correct: newCorrect };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: PhilosophersQuizState, action: PhilosophersQuizAction): PhilosophersQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const isCorrect = state.selected === q.correct;
      const points = isCorrect ? 100 + Math.floor(state.timeLeft * 10) : 0;
      return { ...state, submitted: true, score: state.score + points, correctCount: state.correctCount + (isCorrect ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const newTime = state.timeLeft - 1;
      return newTime <= 0 ? { ...state, timeLeft: 0, submitted: true, phase: "result" } : { ...state, timeLeft: newTime };
    }
    case "next": {
      const nextIndex = state.currentIndex + 1;
      return nextIndex >= state.questions.length ? { ...state, phase: "done" } : { ...state, currentIndex: nextIndex, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: PhilosophersQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
