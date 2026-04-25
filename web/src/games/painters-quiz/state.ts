import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PaintersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PaintersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface PaintersQuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who painted the Mona Lisa?", choices: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Titian"], correct: 2 },
  { question: "The Starry Night was painted by?", choices: ["Paul Gauguin", "Claude Monet", "Vincent van Gogh", "Edvard Munch"], correct: 2 },
  { question: "Which artist cut off his own ear?", choices: ["Paul Cézanne", "Vincent van Gogh", "Pablo Picasso", "Salvador Dalí"], correct: 1 },
  { question: "Guernica was painted by?", choices: ["Salvador Dalí", "Pablo Picasso", "Georges Braque", "Henri Matisse"], correct: 1 },
  { question: "Which artist is associated with Cubism?", choices: ["Monet", "Picasso", "Renoir", "Cézanne"], correct: 1 },
  { question: "The Persistence of Memory (melting clocks) was painted by?", choices: ["René Magritte", "Salvador Dalí", "Max Ernst", "Giorgio de Chirico"], correct: 1 },
  { question: "Which female Mexican artist is known for her self-portraits?", choices: ["Georgia O'Keeffe", "Mary Cassatt", "Frida Kahlo", "Camille Claudel"], correct: 2 },
  { question: "The Sistine Chapel ceiling was painted by?", choices: ["Leonardo da Vinci", "Raphael", "Michelangelo", "Botticelli"], correct: 2 },
  { question: "Impressionism originated in which country?", choices: ["Italy", "Germany", "England", "France"], correct: 3 },
  { question: "Water Lilies is a famous series by which artist?", choices: ["Pierre-Auguste Renoir", "Claude Monet", "Edgar Degas", "Camille Pissarro"], correct: 1 },
  { question: "The Girl with a Pearl Earring was painted by?", choices: ["Rembrandt", "Frans Hals", "Johannes Vermeer", "Jan Steen"], correct: 2 },
  { question: "American Gothic was painted by?", choices: ["Grant Wood", "Andrew Wyeth", "Edward Hopper", "Winslow Homer"], correct: 0 },
  { question: "Which artist is known for painting large colorful flower close-ups?", choices: ["Mary Cassatt", "Helen Frankenthaler", "Georgia O'Keeffe", "Lee Krasner"], correct: 2 },
  { question: "Andy Warhol is associated with which art movement?", choices: ["Abstract Expressionism", "Pop Art", "Surrealism", "Minimalism"], correct: 1 },
  { question: "The Scream was painted by?", choices: ["Gustav Klimt", "Edvard Munch", "Ernst Ludwig Kirchner", "Egon Schiele"], correct: 1 },
  { question: "The Birth of Venus was painted by?", choices: ["Raphael", "Leonardo da Vinci", "Sandro Botticelli", "Titian"], correct: 2 },
  { question: "Jackson Pollock is known for which technique?", choices: ["Pointillism", "Drip painting", "Fresco", "Chiaroscuro"], correct: 1 },
  { question: "Nighthawks, showing people in a diner at night, was painted by?", choices: ["Edward Hopper", "Grant Wood", "Thomas Hart Benton", "Norman Rockwell"], correct: 0 },
  { question: "Which Dutch artist painted The Night Watch?", choices: ["Johannes Vermeer", "Jan van Eyck", "Rembrandt van Rijn", "Hieronymus Bosch"], correct: 2 },
  { question: "Las Meninas was painted by?", choices: ["El Greco", "Francisco Goya", "Diego Velázquez", "Bartolomé Murillo"], correct: 2 },
  { question: "The pointillist technique was pioneered by?", choices: ["Paul Signac", "Georges Seurat", "Camille Pissarro", "Paul Cézanne"], correct: 1 },
  { question: "Which artist created the famous Campbell's Soup Cans series?", choices: ["Roy Lichtenstein", "Andy Warhol", "Jasper Johns", "Robert Rauschenberg"], correct: 1 },
  { question: "The Kiss by Gustav Klimt uses which material in its gold effect?", choices: ["Yellow paint", "Gold leaf", "Metallic ink", "Glitter varnish"], correct: 1 },
  { question: "Banksy is known for which type of art?", choices: ["Oil painting", "Watercolor", "Street art and graffiti", "Sculpture"], correct: 2 },
  { question: "Which artist is credited with starting the Impressionist movement?", choices: ["Claude Monet", "Édouard Manet", "Edgar Degas", "Camille Pissarro"], correct: 1 },
  { question: "The most expensive painting ever sold at auction is?", choices: ["Mona Lisa", "Salvator Mundi", "Interchange by de Kooning", "Shot Sage Blue Marilyn"], correct: 1 },
  { question: "Starry Night Over the Rhone was painted by which artist?", choices: ["Paul Gauguin", "Vincent van Gogh", "Georges Seurat", "Henri Rousseau"], correct: 1 },
  { question: "Which Russian painter is known for abstract geometric compositions?", choices: ["Marc Chagall", "Wassily Kandinsky", "Kazimir Malevich", "El Lissitzky"], correct: 1 },
  { question: "The Hay Wain depicts the English countryside and was painted by?", choices: ["J.M.W. Turner", "John Constable", "William Hogarth", "Thomas Gainsborough"], correct: 1 },
  { question: "Which Flemish painter is known for detailed religious allegories and fantastical creatures?", choices: ["Jan van Eyck", "Pieter Bruegel the Elder", "Hieronymus Bosch", "Rogier van der Weyden"], correct: 2 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: PaintersQuizSettings): PaintersQuizState {
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

export function reducer(state: PaintersQuizState, action: PaintersQuizAction): PaintersQuizState {
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

export function isTerminal(state: PaintersQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
