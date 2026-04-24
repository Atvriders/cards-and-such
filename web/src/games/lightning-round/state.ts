import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface LightningRoundSettings {
  timeLimit: "60" | "90" | "120";
}

export interface LRQuestion {
  question: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  category: string;
}

export type LRPhase = "countdown" | "playing" | "answered" | "done";

export interface LightningRoundState {
  settings: LightningRoundSettings;
  questions: LRQuestion[];
  questionIndex: number;
  score: number;
  phase: LRPhase;
  lastCorrect: boolean | null;
  timeLeft: number; // seconds
  seed: number;
}

export type LightningRoundAction =
  | { type: "start" }
  | { type: "answer"; choice: 0 | 1 | 2 | 3 }
  | { type: "tick" }
  | { type: "next" };

const ALL_QUESTIONS: LRQuestion[] = [
  { question: "What is the capital of France?", options: ["Madrid", "Paris", "Rome", "Berlin"], correct: 1, category: "Geography" },
  { question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correct: 1, category: "Math" },
  { question: "What planet is known as the Red Planet?", options: ["Venus", "Saturn", "Mars", "Jupiter"], correct: 2, category: "Science" },
  { question: "Who wrote 'Romeo and Juliet'?", options: ["Dickens", "Shakespeare", "Twain", "Austen"], correct: 1, category: "Literature" },
  { question: "What is H2O?", options: ["Hydrogen", "Water", "Salt", "Air"], correct: 1, category: "Science" },
  { question: "How many cents in a dollar?", options: ["10", "50", "100", "1000"], correct: 2, category: "Math" },
  { question: "What is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3, category: "Geography" },
  { question: "What color is a banana?", options: ["Red", "Blue", "Yellow", "Green"], correct: 2, category: "General" },
  { question: "How many days in a week?", options: ["5", "6", "7", "8"], correct: 2, category: "General" },
  { question: "What animal says 'moo'?", options: ["Dog", "Cat", "Cow", "Pig"], correct: 2, category: "General" },
  { question: "Which planet has rings?", options: ["Mars", "Jupiter", "Saturn", "Venus"], correct: 2, category: "Science" },
  { question: "What is 7 × 8?", options: ["48", "54", "56", "64"], correct: 2, category: "Math" },
  { question: "What country has the Eiffel Tower?", options: ["Italy", "France", "Spain", "Germany"], correct: 1, category: "Geography" },
  { question: "How many legs does a spider have?", options: ["6", "8", "10", "12"], correct: 1, category: "Science" },
  { question: "Which is the smallest continent?", options: ["Europe", "Antarctica", "Australia", "South America"], correct: 2, category: "Geography" },
  { question: "What language do people speak in Brazil?", options: ["Spanish", "French", "English", "Portuguese"], correct: 3, category: "Geography" },
  { question: "What is the square root of 64?", options: ["6", "7", "8", "9"], correct: 2, category: "Math" },
  { question: "Who painted the Mona Lisa?", options: ["Picasso", "Michelangelo", "Da Vinci", "Rembrandt"], correct: 2, category: "Art" },
  { question: "What is the fastest land animal?", options: ["Lion", "Horse", "Cheetah", "Falcon"], correct: 2, category: "Science" },
  { question: "How many months in a year?", options: ["10", "11", "12", "13"], correct: 2, category: "General" },
  { question: "What is the capital of Japan?", options: ["Kyoto", "Osaka", "Tokyo", "Hiroshima"], correct: 2, category: "Geography" },
  { question: "What gas do plants absorb?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2, category: "Science" },
  { question: "How many players on a basketball team?", options: ["4", "5", "6", "7"], correct: 1, category: "Sports" },
  { question: "What is 12 × 12?", options: ["132", "140", "144", "148"], correct: 2, category: "Math" },
  { question: "Which bird cannot fly?", options: ["Eagle", "Penguin", "Parrot", "Sparrow"], correct: 1, category: "Science" },
  { question: "What color are emeralds?", options: ["Red", "Blue", "Green", "Purple"], correct: 2, category: "General" },
  { question: "How many hours in a day?", options: ["12", "20", "24", "36"], correct: 2, category: "General" },
  { question: "What is the longest river in the world?", options: ["Amazon", "Nile", "Congo", "Mississippi"], correct: 1, category: "Geography" },
  { question: "What does DNA stand for?", options: ["Direct Nucleic Acid", "Deoxyribonucleic Acid", "Double Nitrogen Acid", "Dynamic Nucleotide Array"], correct: 1, category: "Science" },
  { question: "In chess, which piece can only move diagonally?", options: ["Rook", "Knight", "Bishop", "Pawn"], correct: 2, category: "Games" },
  { question: "What is the chemical symbol for gold?", options: ["Go", "Gl", "Au", "Ag"], correct: 2, category: "Science" },
  { question: "How many bones are in the adult human body?", options: ["186", "206", "226", "246"], correct: 1, category: "Science" },
  { question: "Which country hosted the 2016 Summer Olympics?", options: ["China", "Brazil", "UK", "Australia"], correct: 1, category: "Sports" },
  { question: "What is 25% of 200?", options: ["25", "40", "50", "75"], correct: 2, category: "Math" },
  { question: "Who invented the telephone?", options: ["Edison", "Bell", "Tesla", "Morse"], correct: 1, category: "History" },
  { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Brisbane", "Canberra"], correct: 3, category: "Geography" },
  { question: "How many strings does a standard guitar have?", options: ["4", "5", "6", "7"], correct: 2, category: "Music" },
  { question: "What is the currency of Japan?", options: ["Yuan", "Won", "Yen", "Baht"], correct: 2, category: "Geography" },
  { question: "Which element has the symbol O?", options: ["Osmium", "Oxygen", "Oganesson", "Ounium"], correct: 1, category: "Science" },
  { question: "How many players are on a soccer team?", options: ["9", "10", "11", "12"], correct: 2, category: "Sports" },
  { question: "What year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2, category: "History" },
  { question: "What is the hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Quartz"], correct: 2, category: "Science" },
  { question: "How many degrees in a right angle?", options: ["45", "60", "90", "180"], correct: 2, category: "Math" },
  { question: "Which planet is closest to the Sun?", options: ["Venus", "Earth", "Mercury", "Mars"], correct: 2, category: "Science" },
  { question: "What is 15% of 100?", options: ["5", "10", "15", "20"], correct: 2, category: "Math" },
  { question: "What is the tallest mountain on Earth?", options: ["K2", "Kilimanjaro", "Everest", "Denali"], correct: 2, category: "Geography" },
  { question: "What is the largest planet in our solar system?", options: ["Saturn", "Neptune", "Jupiter", "Uranus"], correct: 2, category: "Science" },
  { question: "How many sides does a triangle have?", options: ["2", "3", "4", "5"], correct: 1, category: "Math" },
  { question: "In what country was the Titanic built?", options: ["USA", "France", "Ireland", "UK"], correct: 3, category: "History" },
  { question: "What ocean lies between Europe and America?", options: ["Pacific", "Indian", "Arctic", "Atlantic"], correct: 3, category: "Geography" },
  { question: "What color is the sky on a clear day?", options: ["White", "Blue", "Gray", "Purple"], correct: 1, category: "General" },
  { question: "How many letters in the English alphabet?", options: ["24", "25", "26", "27"], correct: 2, category: "General" },
  { question: "What is the boiling point of water in Celsius?", options: ["90", "95", "100", "105"], correct: 2, category: "Science" },
  { question: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1, category: "Science" },
  { question: "Who was the first US President?", options: ["Lincoln", "Jefferson", "Washington", "Adams"], correct: 2, category: "History" },
  { question: "What is the main ingredient in guacamole?", options: ["Tomato", "Onion", "Avocado", "Lime"], correct: 2, category: "Food" },
  { question: "How many keys on a standard piano?", options: ["72", "76", "88", "96"], correct: 2, category: "Music" },
  { question: "What is 9 squared?", options: ["72", "81", "90", "99"], correct: 1, category: "Math" },
  { question: "Which country is the Sahara Desert in?", options: ["It spans multiple countries", "Egypt only", "Libya only", "Morocco only"], correct: 0, category: "Geography" },
  { question: "What type of animal is a whale?", options: ["Fish", "Reptile", "Mammal", "Amphibian"], correct: 2, category: "Science" },
  { question: "What is the national language of Mexico?", options: ["French", "English", "Portuguese", "Spanish"], correct: 3, category: "Geography" },
  { question: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2, category: "Geography" },
  { question: "What is 3 cubed?", options: ["9", "18", "27", "36"], correct: 2, category: "Math" },
];

export function initialState(seed: number, settings: LightningRoundSettings): LightningRoundState {
  const rng = mulberry32(seed);
  const shuffled = [...ALL_QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  const timeLimit = parseInt(settings.timeLimit);
  return {
    settings,
    questions: shuffled.slice(0, 30),
    questionIndex: 0,
    score: 0,
    phase: "countdown",
    lastCorrect: null,
    timeLeft: timeLimit,
    seed,
  };
}

export function reducer(state: LightningRoundState, action: LightningRoundAction): LightningRoundState {
  switch (action.type) {
    case "start":
      if (state.phase !== "countdown") return state;
      return { ...state, phase: "playing" };

    case "answer": {
      if (state.phase !== "playing") return state;
      const q = state.questions[state.questionIndex]!;
      const correct = action.choice === q.correct;
      const newScore = state.score + (correct ? 1 : 0);
      const nextIdx = state.questionIndex + 1;
      if (nextIdx >= state.questions.length) {
        return { ...state, score: newScore, phase: "done", lastCorrect: correct };
      }
      return {
        ...state,
        score: newScore,
        lastCorrect: correct,
        questionIndex: nextIdx,
      };
    }

    case "tick": {
      if (state.phase !== "playing") return state;
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) {
        return { ...state, timeLeft: 0, phase: "done" };
      }
      return { ...state, timeLeft: newTime };
    }

    case "next":
      return state;

    default:
      return state;
  }
}

export function isTerminal(state: LightningRoundState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
