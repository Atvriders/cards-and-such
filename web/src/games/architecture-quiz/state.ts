import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface ArchitectureQuizSettings { questionCount: "5" | "10" | "15"; }
export interface ArchitectureEntry { question: string; answer: string; choices: string[]; }
export interface ArchitectureQuizState { settings: ArchitectureQuizSettings; entries: ArchitectureEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type ArchitectureQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "The Colosseum is located in which city?", answer: "Rome" },
  { question: "Which architect designed the Guggenheim Museum Bilbao?", answer: "Frank Gehry" },
  { question: "The Sagrada Familia is in which city?", answer: "Barcelona" },
  { question: "What style of architecture features pointed arches and flying buttresses?", answer: "Gothic" },
  { question: "The Burj Khalifa is located in which city?", answer: "Dubai" },
  { question: "Which material was primarily used to build the Great Wall of China?", answer: "Stone and brick" },
  { question: "The Parthenon is a temple dedicated to which goddess?", answer: "Athena" },
  { question: "What is the main building material of traditional Japanese temples?", answer: "Wood" },
  { question: "The Sydney Opera House was designed by which architect?", answer: "Jorn Utzon" },
  { question: "Which style uses columns, symmetry, and classical motifs?", answer: "Neoclassical" },
  { question: "What does 'Bauhaus' mean in German?", answer: "Building house" },
  { question: "The Eiffel Tower was originally built for which event?", answer: "World's Fair 1889" },
  { question: "Which architect designed Fallingwater?", answer: "Frank Lloyd Wright" },
  { question: "The Dome of the Rock is located in which city?", answer: "Jerusalem" },
  { question: "Romanesque architecture is characterized by what type of arches?", answer: "Round" },
  { question: "The Forbidden City is located in which Chinese city?", answer: "Beijing" },
  { question: "What is the term for a triangular decorative feature on a building facade?", answer: "Pediment" },
  { question: "Which architect is famous for designing the Louvre Pyramid?", answer: "I.M. Pei" },
  { question: "Art Deco architecture was prominent in which decade?", answer: "1920s" },
  { question: "The leaning tower of Pisa began construction in which century?", answer: "12th century" },
];
const WRONG = ["Paris", "London", "Madrid", "Athens", "Cairo", "Istanbul", "Tokyo", "Berlin", "Vienna", "Moscow", "Zaha Hadid", "Renzo Piano", "Norman Foster", "Le Corbusier", "Mies van der Rohe", "Zeus", "Hera", "Apollo", "Poseidon", "Artemis", "Concrete", "Steel", "Marble", "Granite", "Adobe", "Baroque", "Renaissance", "Modernist", "Brutalist", "Deconstructivist", "1930s", "1940s", "1910s", "1950s", "11th century", "13th century", "14th century", "15th century"];
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a;
}
export function initialState(seed: number, settings: ArchitectureQuizSettings): ArchitectureQuizState {
  const rng = mulberry32(seed); const count = parseInt(settings.questionCount, 10);
  const entries: ArchitectureEntry[] = shuffle(BANK, rng).slice(0, count).map((item) => {
    const wrong = shuffle(WRONG.filter(w => w !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}
export function reducer(state: ArchitectureQuizState, action: ArchitectureQuizAction): ArchitectureQuizState {
  if (state.done) return state;
  switch (action.type) {
    case "select": { if (state.selected !== null) return state; const correct = state.entries[state.current]!.choices[action.index] === state.entries[state.current]!.answer; return { ...state, selected: action.index, score: correct ? state.score + 10 : state.score }; }
    case "next": { if (state.selected === null) return state; const next = state.current + 1; return next >= state.entries.length ? { ...state, done: true } : { ...state, current: next, selected: null }; }
    default: return state;
  }
}
export function isTerminal(state: ArchitectureQuizState): { score: number } | null { return state.done ? { score: state.score } : null; }
