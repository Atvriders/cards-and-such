import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AncientGreeceQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface AncientGreeceQuizState { settings: AncientGreeceQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type AncientGreeceQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK = [
  { question: "Who wrote the Iliad and the Odyssey?", answer: "Homer", wrong: ["Hesiod","Virgil","Sophocles"] },
  { question: "What city-state was known for its warrior culture?", answer: "Sparta", wrong: ["Athens","Corinth","Thebes"] },
  { question: "Who was the king of the Greek gods?", answer: "Zeus", wrong: ["Poseidon","Ares","Apollo"] },
  { question: "What was the main assembly place in Athens called?", answer: "Agora", wrong: ["Acropolis","Parthenon","Stoa"] },
  { question: "Who was the goddess of wisdom?", answer: "Athena", wrong: ["Hera","Artemis","Aphrodite"] },
  { question: "What famous battle saw 300 Spartans hold a pass?", answer: "Thermopylae", wrong: ["Marathon","Salamis","Plataea"] },
  { question: "Who was the philosopher known for the Socratic method?", answer: "Socrates", wrong: ["Plato","Aristotle","Pythagoras"] },
  { question: "In which city was the Parthenon built?", answer: "Athens", wrong: ["Sparta","Olympia","Delphi"] },
  { question: "Who tutored Alexander the Great?", answer: "Aristotle", wrong: ["Plato","Socrates","Epicurus"] },
  { question: "What does 'democracy' literally mean in Greek?", answer: "Rule by the people", wrong: ["Rule by law","Rule by gods","Rule by nobles"] },
  { question: "Which war was fought between Athens and Sparta?", answer: "Peloponnesian War", wrong: ["Persian War","Macedonian War","Trojan War"] },
  { question: "What ancient Oracle gave prophecies in Greece?", answer: "Oracle of Delphi", wrong: ["Oracle of Olympia","Oracle of Athens","Oracle of Corinth"] },
  { question: "Who was the god of the sea?", answer: "Poseidon", wrong: ["Zeus","Hades","Apollo"] },
  { question: "What mathematical theorem is named after a Greek philosopher?", answer: "Pythagorean theorem", wrong: ["Euclidean theorem","Socratic theorem","Platonic theorem"] },
  { question: "Which Greek hero killed Medusa?", answer: "Perseus", wrong: ["Heracles","Theseus","Jason"] },
  { question: "What were the Greek city-states called?", answer: "Polis", wrong: ["Deme","Agora","Stoa"] },
  { question: "Who was Alexander the Great's father?", answer: "Philip II of Macedon", wrong: ["Darius III","Leonidas","Pericles"] },
  { question: "In which city were the original Olympic games held?", answer: "Olympia", wrong: ["Athens","Sparta","Corinth"] },
  { question: "What substance did the philosopher's stone supposedly create?", answer: "Gold from base metals", wrong: ["Eternal life","Perfect democracy","Wisdom"] },
  { question: "Who wrote the Republic, describing an ideal state?", answer: "Plato", wrong: ["Aristotle","Socrates","Thucydides"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: AncientGreeceQuizSettings): AncientGreeceQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => ({ question: item.question, answer: item.answer, choices: shuffle([item.answer, ...item.wrong.slice(0,3)], rng) }));
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: AncientGreeceQuizState, action: AncientGreeceQuizAction): AncientGreeceQuizState {
  if (state.done) return state;
  if (action.type === "select") {
    if (state.selected !== null) return state;
    const entry = state.entries[state.current]!;
    return { ...state, selected: action.index, score: entry.choices[action.index] === entry.answer ? state.score + 10 : state.score };
  }
  if (action.type === "next") {
    if (state.selected === null) return state;
    const next = state.current + 1;
    return next >= state.entries.length ? { ...state, done: true } : { ...state, current: next, selected: null };
  }
  return state;
}

export function isTerminal(state: AncientGreeceQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
