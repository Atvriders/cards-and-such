import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CategoryQuizSettings {
  questionCount: "10" | "15" | "20";
}

export interface Question {
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface CategoryQuizState {
  settings: CategoryQuizSettings;
  questions: Question[];
  currentIndex: number;
  selectedOption: number | null;
  confirmed: boolean;
  score: number;
  done: boolean;
}

export type CategoryQuizAction =
  | { type: "select"; optionIndex: number }
  | { type: "confirm" }
  | { type: "next" };

const ALL_QUESTIONS: Omit<Question, "options">[] = [];

const RAW_BANK: Array<{ category: string; question: string; answer: string; distractors: string[] }> = [
  // Science
  { category: "Science", question: "What is the chemical symbol for water?", answer: "H₂O", distractors: ["CO₂", "O₂", "H₂S"] },
  { category: "Science", question: "How many planets are in our solar system?", answer: "8", distractors: ["7", "9", "10"] },
  { category: "Science", question: "What gas do plants absorb from the air?", answer: "Carbon dioxide", distractors: ["Oxygen", "Nitrogen", "Hydrogen"] },
  { category: "Science", question: "What is the powerhouse of the cell?", answer: "Mitochondria", distractors: ["Nucleus", "Ribosome", "Golgi body"] },
  { category: "Science", question: "What force keeps us on the ground?", answer: "Gravity", distractors: ["Magnetism", "Friction", "Tension"] },
  { category: "Science", question: "What is the speed of light (approx)?", answer: "300,000 km/s", distractors: ["150,000 km/s", "500,000 km/s", "100,000 km/s"] },
  // History
  { category: "History", question: "In what year did World War II end?", answer: "1945", distractors: ["1944", "1946", "1943"] },
  { category: "History", question: "Who was the first US President?", answer: "George Washington", distractors: ["John Adams", "Thomas Jefferson", "Abraham Lincoln"] },
  { category: "History", question: "The Great Wall of China was primarily built to defend against whom?", answer: "Northern nomads", distractors: ["Japanese invaders", "Mongol navy", "Persian army"] },
  { category: "History", question: "The French Revolution began in what year?", answer: "1789", distractors: ["1776", "1804", "1815"] },
  { category: "History", question: "Who wrote the Declaration of Independence?", answer: "Thomas Jefferson", distractors: ["Benjamin Franklin", "John Adams", "James Madison"] },
  { category: "History", question: "The Roman Empire fell in what year (Western Rome)?", answer: "476 AD", distractors: ["1453 AD", "380 AD", "600 AD"] },
  // Geography
  { category: "Geography", question: "What is the longest river in the world?", answer: "Nile", distractors: ["Amazon", "Yangtze", "Mississippi"] },
  { category: "Geography", question: "What country has the most natural lakes?", answer: "Canada", distractors: ["Russia", "USA", "Finland"] },
  { category: "Geography", question: "What is the smallest country in the world?", answer: "Vatican City", distractors: ["Monaco", "San Marino", "Liechtenstein"] },
  { category: "Geography", question: "What is the capital of Australia?", answer: "Canberra", distractors: ["Sydney", "Melbourne", "Brisbane"] },
  { category: "Geography", question: "Which continent has the most countries?", answer: "Africa", distractors: ["Asia", "Europe", "South America"] },
  { category: "Geography", question: "What is the highest mountain in the world?", answer: "Mount Everest", distractors: ["K2", "Kangchenjunga", "Makalu"] },
  // Language
  { category: "Language", question: "How many letters are in the English alphabet?", answer: "26", distractors: ["24", "28", "25"] },
  { category: "Language", question: "What is a synonym for 'happy'?", answer: "Joyful", distractors: ["Sad", "Angry", "Tired"] },
  { category: "Language", question: "What part of speech is 'quickly'?", answer: "Adverb", distractors: ["Adjective", "Noun", "Verb"] },
  { category: "Language", question: "What is an antonym for 'ancient'?", answer: "Modern", distractors: ["Old", "Classic", "Historic"] },
  { category: "Language", question: "How many syllables are in 'communication'?", answer: "5", distractors: ["4", "6", "3"] },
  { category: "Language", question: "Which language has the most native speakers?", answer: "Mandarin Chinese", distractors: ["English", "Spanish", "Hindi"] },
  // Math
  { category: "Math", question: "What is the square root of 144?", answer: "12", distractors: ["11", "13", "14"] },
  { category: "Math", question: "What is 15% of 200?", answer: "30", distractors: ["25", "35", "20"] },
  { category: "Math", question: "How many sides does a hexagon have?", answer: "6", distractors: ["5", "7", "8"] },
  { category: "Math", question: "What is the value of Pi (to 2 decimal places)?", answer: "3.14", distractors: ["3.12", "3.16", "3.18"] },
  { category: "Math", question: "What is 7 × 8?", answer: "56", distractors: ["54", "58", "48"] },
  { category: "Math", question: "What is the next prime after 11?", answer: "13", distractors: ["12", "14", "15"] },
  // Pop Culture
  { category: "Pop Culture", question: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci", distractors: ["Michelangelo", "Raphael", "Caravaggio"] },
  { category: "Pop Culture", question: "What sport is played at Wimbledon?", answer: "Tennis", distractors: ["Cricket", "Polo", "Golf"] },
  { category: "Pop Culture", question: "How many strings does a standard guitar have?", answer: "6", distractors: ["4", "5", "8"] },
  { category: "Pop Culture", question: "What movie features the character Simba?", answer: "The Lion King", distractors: ["Bambi", "Jungle Book", "Tarzan"] },
  { category: "Pop Culture", question: "Who wrote the Harry Potter series?", answer: "J.K. Rowling", distractors: ["J.R.R. Tolkien", "C.S. Lewis", "Roald Dahl"] },
  { category: "Pop Culture", question: "In chess, which piece can only move diagonally?", answer: "Bishop", distractors: ["Rook", "Knight", "King"] },
];

function buildQuestion(raw: typeof RAW_BANK[number], rng: () => number): Question {
  const opts = [raw.answer, ...raw.distractors];
  // Shuffle options
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [opts[i], opts[j]] = [opts[j]!, opts[i]!];
  }
  return {
    category: raw.category,
    question: raw.question,
    options: opts,
    correctIndex: opts.indexOf(raw.answer),
  };
}

export function initialState(seed: number, settings: CategoryQuizSettings): CategoryQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  // Shuffle the bank and pick count questions
  const bank = [...RAW_BANK];
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [bank[i], bank[j]] = [bank[j]!, bank[i]!];
  }
  const selected = bank.slice(0, Math.min(count, bank.length));
  const questions = selected.map(raw => buildQuestion(raw, rng));

  return {
    settings,
    questions,
    currentIndex: 0,
    selectedOption: null,
    confirmed: false,
    score: 0,
    done: false,
  };
}

export function reducer(state: CategoryQuizState, action: CategoryQuizAction): CategoryQuizState {
  if (state.done) return state;

  switch (action.type) {
    case "select": {
      if (state.confirmed) return state;
      return { ...state, selectedOption: action.optionIndex };
    }
    case "confirm": {
      if (state.selectedOption === null || state.confirmed) return state;
      const correct = state.questions[state.currentIndex]!.correctIndex === state.selectedOption;
      return {
        ...state,
        confirmed: true,
        score: correct ? state.score + 10 : state.score,
      };
    }
    case "next": {
      if (!state.confirmed) return state;
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, done: true };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        selectedOption: null,
        confirmed: false,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: CategoryQuizState): { score: number } | null {
  if (state.done) return { score: state.score };
  return null;
}
