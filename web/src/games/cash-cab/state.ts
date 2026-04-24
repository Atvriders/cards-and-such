import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CashCabSettings {
  questions: "10" | "15" | "20";
}

export interface CashCabQuestion {
  question: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  category: string;
}

export type CashCabPhase = "intro" | "playing" | "answered" | "stopped" | "done";

export interface CashCabState {
  settings: CashCabSettings;
  questions: CashCabQuestion[];
  questionIndex: number;
  cash: number;
  phase: CashCabPhase;
  lastCorrect: boolean | null;
  lastChoice: number;
  correctAnswer: string;
  seed: number;
}

export type CashCabAction =
  | { type: "start" }
  | { type: "answer"; choice: 0 | 1 | 2 | 3 }
  | { type: "continue_ride" }
  | { type: "stop_and_keep" };

const ALL_QUESTIONS: CashCabQuestion[] = [
  { question: "What is the capital of Italy?", options: ["Milan", "Naples", "Rome", "Florence"], correct: 2, category: "Geography" },
  { question: "How many planets are in our solar system?", options: ["7", "8", "9", "10"], correct: 1, category: "Science" },
  { question: "What is 6 × 9?", options: ["48", "52", "54", "56"], correct: 2, category: "Math" },
  { question: "Which gas makes up most of Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correct: 2, category: "Science" },
  { question: "Who wrote '1984'?", options: ["Huxley", "Orwell", "Kafka", "Camus"], correct: 1, category: "Literature" },
  { question: "What is the largest country by area?", options: ["USA", "China", "Canada", "Russia"], correct: 3, category: "Geography" },
  { question: "How many sides does an octagon have?", options: ["6", "7", "8", "9"], correct: 2, category: "Math" },
  { question: "What is the currency of the UK?", options: ["Euro", "Dollar", "Pound", "Franc"], correct: 2, category: "General" },
  { question: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3, category: "Geography" },
  { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi"], correct: 2, category: "Science" },
  { question: "In what year did the Berlin Wall fall?", options: ["1987", "1988", "1989", "1990"], correct: 2, category: "History" },
  { question: "How many keys does a standard piano have?", options: ["76", "80", "88", "96"], correct: 2, category: "Music" },
  { question: "What is the chemical symbol for iron?", options: ["Ir", "Io", "Fe", "In"], correct: 2, category: "Science" },
  { question: "Who invented the light bulb?", options: ["Tesla", "Edison", "Bell", "Faraday"], correct: 1, category: "History" },
  { question: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Montreal", "Ottawa"], correct: 3, category: "Geography" },
  { question: "How many hearts does an octopus have?", options: ["1", "2", "3", "4"], correct: 2, category: "Science" },
  { question: "What is 15% of 80?", options: ["8", "10", "12", "14"], correct: 2, category: "Math" },
  { question: "Which mountain is the tallest?", options: ["K2", "Denali", "Everest", "Kilimanjaro"], correct: 2, category: "Geography" },
  { question: "In chess, how does a knight move?", options: ["Diagonally", "Straight", "L-shape", "Any direction"], correct: 2, category: "Games" },
  { question: "What is the boiling point of water in Fahrenheit?", options: ["200°F", "212°F", "220°F", "232°F"], correct: 1, category: "Science" },
  { question: "Who painted the Mona Lisa?", options: ["Raphael", "Michelangelo", "Da Vinci", "Caravaggio"], correct: 2, category: "Art" },
  { question: "How many zeros in one million?", options: ["5", "6", "7", "8"], correct: 1, category: "Math" },
  { question: "What is the national sport of Japan?", options: ["Judo", "Karate", "Sumo", "Baseball"], correct: 2, category: "Sports" },
  { question: "Which animal is the fastest on land?", options: ["Lion", "Falcon", "Cheetah", "Horse"], correct: 2, category: "Science" },
  { question: "What does USB stand for?", options: ["Universal Serial Bus", "Universal System Board", "Unified Serial Bridge", "Universal Software Bus"], correct: 0, category: "Technology" },
  { question: "What year did the Titanic sink?", options: ["1910", "1912", "1914", "1916"], correct: 1, category: "History" },
  { question: "What is the main language spoken in Argentina?", options: ["Portuguese", "Spanish", "Italian", "French"], correct: 1, category: "Geography" },
  { question: "How many teeth does an adult human typically have?", options: ["28", "30", "32", "34"], correct: 2, category: "Science" },
  { question: "What is 2 to the power of 10?", options: ["512", "1024", "2048", "256"], correct: 1, category: "Math" },
  { question: "Which planet is known as the Morning Star?", options: ["Mercury", "Mars", "Venus", "Jupiter"], correct: 2, category: "Science" },
  { question: "Who was the first person to walk on the Moon?", options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "John Glenn"], correct: 2, category: "History" },
  { question: "What is the smallest country in the world?", options: ["Monaco", "San Marino", "Liechtenstein", "Vatican City"], correct: 3, category: "Geography" },
  { question: "How many feet are in a mile?", options: ["4,280", "5,280", "6,280", "7,280"], correct: 1, category: "General" },
  { question: "What is the atomic number of carbon?", options: ["4", "6", "8", "12"], correct: 1, category: "Science" },
  { question: "Which country invented pizza?", options: ["Greece", "Spain", "France", "Italy"], correct: 3, category: "Food" },
];

export function initialState(seed: number, settings: CashCabSettings): CashCabState {
  const rng = mulberry32(seed);
  const questionCount = parseInt(settings.questions);
  const shuffled = [...ALL_QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return {
    settings,
    questions: shuffled.slice(0, questionCount),
    questionIndex: 0,
    cash: 0,
    phase: "intro",
    lastCorrect: null,
    lastChoice: -1,
    correctAnswer: "",
    seed,
  };
}

export function reducer(state: CashCabState, action: CashCabAction): CashCabState {
  switch (action.type) {
    case "start":
      if (state.phase !== "intro") return state;
      return { ...state, phase: "playing", cash: 50 };

    case "answer": {
      if (state.phase !== "playing") return state;
      const q = state.questions[state.questionIndex]!;
      const correct = action.choice === q.correct;
      const newCash = correct ? state.cash * 2 : Math.max(0, state.cash - 50);
      return {
        ...state,
        cash: newCash,
        lastCorrect: correct,
        lastChoice: action.choice,
        correctAnswer: q.options[q.correct],
        phase: "answered",
      };
    }

    case "continue_ride": {
      if (state.phase !== "answered") return state;
      const nextIdx = state.questionIndex + 1;
      if (nextIdx >= state.questions.length) {
        return { ...state, questionIndex: nextIdx, phase: "done" };
      }
      return {
        ...state,
        questionIndex: nextIdx,
        lastCorrect: null,
        lastChoice: -1,
        correctAnswer: "",
        phase: "playing",
      };
    }

    case "stop_and_keep":
      if (state.phase !== "answered") return state;
      return { ...state, phase: "stopped" };

    default:
      return state;
  }
}

export function isTerminal(state: CashCabState): { score: number } | null {
  if (state.phase === "done" || state.phase === "stopped") {
    return { score: state.cash };
  }
  return null;
}
