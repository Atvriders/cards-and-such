import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type QuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" }
  | { type: "tick" };

export interface QuizSettings {
  questions: "10" | "20" | "30";
}

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In which sport would you perform a 'slam dunk'?", choices: ["Volleyball", "Basketball", "Handball", "Water polo"], correct: 1 },
  { question: "How many players are on a rugby union team?", choices: ["13", "14", "15", "16"], correct: 2 },
  { question: "In which sport is the 'Ryder Cup' competed for?", choices: ["Tennis", "Cricket", "Golf", "Polo"], correct: 2 },
  { question: "What is the maximum number of sets in a men's Grand Slam tennis match?", choices: ["3", "4", "5", "6"], correct: 2 },
  { question: "The Olympic Games originated in which ancient civilization?", choices: ["Roman", "Egyptian", "Greek", "Mesopotamian"], correct: 2 },
  { question: "Usain Bolt holds the world record for the 100m sprint. His time is?", choices: ["9.56s", "9.58s", "9.60s", "9.63s"], correct: 1 },
  { question: "How many Grand Slam tennis tournaments are played per year?", choices: ["2", "3", "4", "5"], correct: 2 },
  { question: "In which country did the sport of sumo wrestling originate?", choices: ["China", "Korea", "Mongolia", "Japan"], correct: 3 },
  { question: "Michael Phelps won a record number of Olympic gold medals in which sport?", choices: ["Diving", "Water polo", "Synchronized swimming", "Swimming"], correct: 3 },
  { question: "What is the national sport of Canada?", choices: ["Ice hockey only", "Lacrosse only", "Both lacrosse and ice hockey", "Curling"], correct: 2 },
  { question: "In cricket, how many balls are in a standard over?", choices: ["4", "5", "6", "8"], correct: 2 },
  { question: "Which country has won the most Rugby World Cups?", choices: ["England", "Australia", "South Africa", "New Zealand"], correct: 3 },
  { question: "In American football, how many points is a field goal worth?", choices: ["1", "2", "3", "6"], correct: 2 },
  { question: "How often are the Summer Olympic Games held?", choices: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], correct: 2 },
  { question: "What sport uses a 'birdie', 'eagle', and 'bogey'?", choices: ["Tennis", "Golf", "Badminton", "Cricket"], correct: 1 },
  { question: "In which sport would you perform a 'hat trick'?", choices: ["Baseball", "Basketball", "Ice hockey or soccer", "Tennis"], correct: 2 },
  { question: "The Boston Celtics play in which sporting league?", choices: ["MLB", "NFL", "NHL", "NBA"], correct: 3 },
  { question: "Which country hosts the Masters golf tournament?", choices: ["Scotland", "England", "Australia", "United States"], correct: 3 },
  { question: "What is the diameter of a basketball hoop in inches?", choices: ["16", "18", "20", "22"], correct: 1 },
  { question: "Muhammad Ali was born with which name?", choices: ["Roy Jones Jr.", "Cassius Clay", "Sonny Liston", "Sugar Ray Leonard"], correct: 1 },
  { question: "In swimming, what stroke is swum on your back?", choices: ["Butterfly", "Breaststroke", "Freestyle", "Backstroke"], correct: 3 },
  { question: "Which country invented baseball?", choices: ["Cuba", "Dominican Republic", "Canada", "United States"], correct: 3 },
  { question: "Serena Williams has won how many Grand Slam singles titles?", choices: ["18", "20", "23", "25"], correct: 2 },
  { question: "What weight class is above 'heavyweight' in boxing?", choices: ["Super heavyweight (amateur only)", "Cruiserweight", "Light heavyweight", "Super heavyweight"], correct: 0 },
  { question: "In which sport do competitors use a 'foil', 'epee', or 'sabre'?", choices: ["Archery", "Fencing", "Jousting", "Judo"], correct: 1 },
  { question: "How long is an Olympic swimming pool in meters?", choices: ["25", "50", "75", "100"], correct: 1 },
  { question: "Which team has won the most Super Bowls?", choices: ["Dallas Cowboys", "San Francisco 49ers", "New England Patriots", "Pittsburgh Steelers"], correct: 2 },
  { question: "In soccer, how long is a standard match?", choices: ["80 minutes", "90 minutes", "100 minutes", "120 minutes"], correct: 1 },
  { question: "What is the governing body of world football (soccer)?", choices: ["UEFA", "CONCACAF", "FIFA", "AFC"], correct: 2 },
  { question: "Which gymnast scored the first perfect '10' in Olympic history?", choices: ["Mary Lou Retton", "Simone Biles", "Nadia Comaneci", "Larisa Latynina"], correct: 2 },
  { question: "The term 'love' in tennis means?", choices: ["A winning shot", "Advantage", "Zero", "Deuce"], correct: 2 },
  { question: "Which Formula 1 driver has won the most World Championships?", choices: ["Ayrton Senna", "Michael Schumacher", "Lewis Hamilton", "Sebastian Vettel"], correct: 2 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: QuizSettings): QuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  let pool = shuffle([...ALL_QUESTIONS], rng);
  pool = pool.slice(0, Math.min(count, pool.length));
  const questions = pool.map(q => {
    const indexed = q.choices.map((c, i) => ({ c, i }));
    const shuffled = shuffle(indexed, rng);
    const newCorrect = shuffled.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: shuffled.map(x => x.c) as [string, string, string, string], correct: newCorrect };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: QuizState, action: QuizAction): QuizState {
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
      const speedBonus = isCorrect ? Math.floor(state.timeLeft * 10) : 0;
      const points = isCorrect ? 100 + speedBonus : 0;
      return { ...state, submitted: true, score: state.score + points, correctCount: state.correctCount + (isCorrect ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) return { ...state, timeLeft: 0, submitted: true, phase: "result" };
      return { ...state, timeLeft: newTime };
    }
    case "next": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: nextIndex, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: QuizState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
