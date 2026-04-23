import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TriviaTowerSettings {
  rounds: "10" | "20";
}

export interface TowerQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface TriviaTowerState {
  settings: TriviaTowerSettings;
  questions: TowerQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  blocks: number;
  highBlock: number;
  wobble: boolean;
  phase: "playing" | "result" | "done";
}

export type TriviaTowerAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

const TOWER_QUESTIONS: TowerQuestion[] = [
  { question: "What color is the sky on a clear day?", choices: ["Green", "Blue", "Red", "Yellow"], correct: 1 },
  { question: "How many sides does a triangle have?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "Which planet is known as the Red Planet?", choices: ["Venus", "Jupiter", "Mars", "Saturn"], correct: 2 },
  { question: "What is 7 × 8?", choices: ["54", "56", "58", "60"], correct: 1 },
  { question: "What is the capital of France?", choices: ["London", "Berlin", "Rome", "Paris"], correct: 3 },
  { question: "How many days are in a week?", choices: ["5", "6", "7", "8"], correct: 2 },
  { question: "Which ocean is the largest?", choices: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
  { question: "What is the chemical formula for water?", choices: ["H2O", "CO2", "O2", "NaCl"], correct: 0 },
  { question: "Who wrote 'Hamlet'?", choices: ["Dickens", "Tolkien", "Shakespeare", "Austen"], correct: 2 },
  { question: "What is the largest continent?", choices: ["Africa", "Asia", "Europe", "America"], correct: 1 },
  { question: "What gas do plants absorb from the air?", choices: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"], correct: 2 },
  { question: "How many legs does a spider have?", choices: ["6", "7", "8", "10"], correct: 2 },
  { question: "What is the smallest prime number?", choices: ["0", "1", "2", "3"], correct: 2 },
  { question: "What language is most spoken in Brazil?", choices: ["Spanish", "Portuguese", "English", "French"], correct: 1 },
  { question: "What is the freezing point of water in Celsius?", choices: ["-10", "-1", "0", "1"], correct: 2 },
  { question: "Which metal is liquid at room temperature?", choices: ["Iron", "Gold", "Mercury", "Lead"], correct: 2 },
  { question: "How many players on a basketball team (on court)?", choices: ["4", "5", "6", "7"], correct: 1 },
  { question: "What year did the first moon landing occur?", choices: ["1965", "1967", "1969", "1971"], correct: 2 },
  { question: "What is the largest organ of the human body?", choices: ["Heart", "Liver", "Brain", "Skin"], correct: 3 },
  { question: "How many vowels are in the English alphabet?", choices: ["4", "5", "6", "7"], correct: 1 },
  { question: "Which country invented pizza?", choices: ["Greece", "Spain", "Italy", "France"], correct: 2 },
  { question: "What is the hardest natural substance?", choices: ["Gold", "Iron", "Diamond", "Quartz"], correct: 2 },
  { question: "How many continents are there?", choices: ["5", "6", "7", "8"], correct: 2 },
  { question: "What is the longest river in the world?", choices: ["Amazon", "Mississippi", "Yangtze", "Nile"], correct: 3 },
  { question: "Which is the fastest land animal?", choices: ["Lion", "Cheetah", "Horse", "Greyhound"], correct: 1 },
  { question: "What is 12 squared?", choices: ["121", "132", "144", "156"], correct: 2 },
  { question: "What element has the symbol Fe?", choices: ["Fluorine", "Gold", "Iron", "Francium"], correct: 2 },
  { question: "Which animal is known as man's best friend?", choices: ["Cat", "Horse", "Dog", "Rabbit"], correct: 2 },
  { question: "In what continent is Egypt located?", choices: ["Asia", "Europe", "Africa", "South America"], correct: 2 },
  { question: "What is the square root of 64?", choices: ["6", "7", "8", "9"], correct: 2 },
  { question: "Which gas makes up most of the Earth's atmosphere?", choices: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correct: 2 },
  { question: "How many hours in a day?", choices: ["12", "18", "24", "36"], correct: 2 },
  { question: "What is the capital of Japan?", choices: ["Osaka", "Kyoto", "Hiroshima", "Tokyo"], correct: 3 },
  { question: "What is the main ingredient in guacamole?", choices: ["Tomato", "Avocado", "Pepper", "Lime"], correct: 1 },
  { question: "What shape has four equal sides and four right angles?", choices: ["Rectangle", "Square", "Rhombus", "Trapezoid"], correct: 1 },
  { question: "What is the currency of the United Kingdom?", choices: ["Euro", "Dollar", "Pound", "Franc"], correct: 2 },
  { question: "Which planet has rings?", choices: ["Mars", "Venus", "Earth", "Saturn"], correct: 3 },
  { question: "How many strings does a standard guitar have?", choices: ["4", "5", "6", "7"], correct: 2 },
  { question: "What is 15% of 200?", choices: ["20", "25", "30", "35"], correct: 2 },
  { question: "Who painted the Mona Lisa?", choices: ["Raphael", "Michelangelo", "Leonardo da Vinci", "Caravaggio"], correct: 2 },
  { question: "What organ pumps blood in humans?", choices: ["Lung", "Brain", "Liver", "Heart"], correct: 3 },
  { question: "What is the chemical symbol for gold?", choices: ["Go", "Gd", "Au", "Gl"], correct: 2 },
  { question: "What is the powerhouse of the cell?", choices: ["Nucleus", "Ribosome", "Mitochondria", "Lysosome"], correct: 2 },
  { question: "How many teeth does an adult human have (including wisdom teeth)?", choices: ["28", "30", "32", "34"], correct: 2 },
  { question: "What is the name of the fairy in Peter Pan?", choices: ["Pixie", "Tinkerbell", "Fairy Dust", "Goldie"], correct: 1 },
  { question: "In which sport is the term 'love' used?", choices: ["Golf", "Cricket", "Tennis", "Baseball"], correct: 2 },
  { question: "What does DNA stand for?", choices: ["Deoxyribose Nucleic Acid", "Deoxyribonucleic Acid", "Dynamic Nucleic Assembly", "Dual Nucleotide Arrangement"], correct: 1 },
  { question: "Who invented the telephone?", choices: ["Edison", "Tesla", "Bell", "Marconi"], correct: 2 },
  { question: "What is the tallest mountain in the world?", choices: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], correct: 2 },
  { question: "What is photosynthesis?", choices: ["Breaking down food", "Making food from sunlight", "Absorbing oxygen", "Reproducing cells"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: TriviaTowerSettings): TriviaTowerState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.rounds, 10);
  const questions = shuffle(TOWER_QUESTIONS, rng).slice(0, count);

  // Shuffle choices within each question
  const shuffledQuestions: TowerQuestion[] = questions.map(q => {
    const indexed = q.choices.map((c, i) => ({ c, i }));
    const shuffled = shuffle(indexed, rng);
    const newCorrect = shuffled.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: shuffled.map(x => x.c) as [string, string, string, string], correct: newCorrect };
  });

  return {
    settings,
    questions: shuffledQuestions,
    currentIndex: 0,
    selected: null,
    submitted: false,
    blocks: 0,
    highBlock: 0,
    wobble: false,
    phase: "playing",
  };
}

export function reducer(state: TriviaTowerState, action: TriviaTowerAction): TriviaTowerState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "select": {
      if (state.submitted) return state;
      return { ...state, selected: action.choice };
    }

    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const isCorrect = state.selected === q.correct;
      const newBlocks = isCorrect ? state.blocks + 1 : Math.max(0, state.blocks - 1);
      const newHigh = Math.max(state.highBlock, newBlocks);
      return {
        ...state,
        submitted: true,
        blocks: newBlocks,
        highBlock: newHigh,
        wobble: !isCorrect,
        phase: "result",
      };
    }

    case "next": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, phase: "done" };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        selected: null,
        submitted: false,
        wobble: false,
        phase: "playing",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TriviaTowerState): { score: number } | null {
  if (state.phase === "done") return { score: state.blocks * 10 + state.highBlock };
  return null;
}
