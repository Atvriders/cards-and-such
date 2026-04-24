import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MillionaireSettings {
  lifelines: "all" | "none";
}

export interface MillionaireQuestion {
  question: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export type MillionairePhase =
  | "playing"
  | "lifeline_audience"
  | "lifeline_phone"
  | "walk_away"
  | "wrong"
  | "won";

export interface MillionaireState {
  settings: MillionaireSettings;
  questions: MillionaireQuestion[];
  level: number; // 0-14
  score: number;
  phase: MillionairePhase;
  eliminated: boolean[]; // which options are 50/50'd away
  audienceVotes: number[]; // 4 percentages
  phoneHint: string;
  lifeline5050Used: boolean;
  lifelineAudienceUsed: boolean;
  lifelinePhoneUsed: boolean;
  lastChoice: number;
  seed: number;
}

export type MillionaireAction =
  | { type: "answer"; choice: 0 | 1 | 2 | 3 }
  | { type: "use_5050" }
  | { type: "use_audience" }
  | { type: "use_phone" }
  | { type: "dismiss_lifeline" }
  | { type: "walk_away" };

export const PRIZES = [100, 200, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
const SAFETY_NETS = [0, 1000, 32000];

function safetyNet(level: number): number {
  let safe = 0;
  for (const s of SAFETY_NETS) {
    if (PRIZES.indexOf(s) < level) safe = s;
  }
  return safe;
}

const ALL_QUESTIONS: MillionaireQuestion[] = [
  // Easy (levels 0-3)
  { question: "How many days are in a week?", options: ["5", "6", "7", "8"], correct: 2 },
  { question: "What color is a ripe banana?", options: ["Red", "Green", "Yellow", "Blue"], correct: 2 },
  { question: "How many legs does a dog have?", options: ["2", "4", "6", "8"], correct: 1 },
  { question: "What do you call frozen rain?", options: ["Hail", "Snow", "Sleet", "Fog"], correct: 0 },
  { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], correct: 1 },
  { question: "Which planet do we live on?", options: ["Mars", "Venus", "Earth", "Jupiter"], correct: 2 },
  { question: "How many months are in a year?", options: ["10", "11", "12", "13"], correct: 2 },
  { question: "What animal says 'moo'?", options: ["Pig", "Sheep", "Cow", "Dog"], correct: 2 },
  // Medium (levels 4-8)
  { question: "What is the capital of France?", options: ["London", "Berlin", "Rome", "Paris"], correct: 3 },
  { question: "How many states are in the USA?", options: ["48", "49", "50", "52"], correct: 2 },
  { question: "What is the chemical symbol for water?", options: ["WA", "H2O", "HO2", "WO"], correct: 1 },
  { question: "Who painted the Sistine Chapel ceiling?", options: ["Da Vinci", "Raphael", "Michelangelo", "Botticelli"], correct: 2 },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
  { question: "In what year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2 },
  { question: "What is the square root of 144?", options: ["11", "12", "13", "14"], correct: 1 },
  { question: "How many bones are in the adult human body?", options: ["186", "196", "206", "216"], correct: 2 },
  { question: "What is the capital of Japan?", options: ["Osaka", "Kyoto", "Hiroshima", "Tokyo"], correct: 3 },
  { question: "Which element has the atomic number 1?", options: ["Helium", "Hydrogen", "Carbon", "Oxygen"], correct: 1 },
  // Hard (levels 9-13)
  { question: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1 },
  { question: "Who wrote 'War and Peace'?", options: ["Dostoevsky", "Chekhov", "Tolstoy", "Turgenev"], correct: 2 },
  { question: "What is the half-life of Carbon-14?", options: ["1,570 years", "5,730 years", "14,000 years", "570,000 years"], correct: 1 },
  { question: "Which country has the most natural lakes?", options: ["Russia", "USA", "Brazil", "Canada"], correct: 3 },
  { question: "What is the speed of light in km/s?", options: ["100,000", "300,000", "500,000", "1,000,000"], correct: 1 },
  { question: "Who discovered penicillin?", options: ["Curie", "Pasteur", "Fleming", "Lister"], correct: 2 },
  { question: "What year was the Eiffel Tower completed?", options: ["1879", "1889", "1899", "1909"], correct: 1 },
  { question: "In which ocean is the Mariana Trench?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
  { question: "Who formulated the general theory of relativity?", options: ["Bohr", "Newton", "Einstein", "Tesla"], correct: 2 },
  { question: "What is the capital of Kazakhstan?", options: ["Almaty", "Astana", "Bishkek", "Tashkent"], correct: 1 },
  { question: "How many symphonies did Beethoven complete?", options: ["7", "8", "9", "10"], correct: 2 },
  { question: "What is the Fibonacci sequence after 13?", options: ["18", "19", "21", "22"], correct: 2 },
  // Extra questions for variety
  { question: "What is the smallest prime number?", options: ["0", "1", "2", "3"], correct: 2 },
  { question: "What planet is known for its Great Red Spot?", options: ["Saturn", "Neptune", "Uranus", "Jupiter"], correct: 3 },
  { question: "How many strings does a standard violin have?", options: ["3", "4", "5", "6"], correct: 1 },
];

function getPhoneHint(q: MillionaireQuestion, rng: () => number): string {
  const correct = q.options[q.correct];
  const isRight = rng() < 0.75;
  if (isRight) {
    return `"I'm pretty sure it's ${correct}. I'd go with that."`;
  }
  // Give a wrong answer hint
  const wrongs = q.options.filter((_, i) => i !== q.correct);
  const wrong = wrongs[Math.floor(rng() * wrongs.length)]!;
  return `"Hmm, I think it might be ${wrong}… but I'm not 100% sure."`;
}

function getAudienceVotes(q: MillionaireQuestion, rng: () => number): number[] {
  const votes = [5, 5, 5, 5];
  // Give ~60% to correct, rest spread
  votes[q.correct] = 55 + Math.floor(rng() * 20);
  const remaining = 100 - votes[q.correct]!;
  const others = [0, 1, 2, 3].filter(i => i !== q.correct);
  const a = Math.floor(rng() * remaining * 0.6);
  const b = Math.floor(rng() * (remaining - a) * 0.7);
  const c = remaining - a - b;
  votes[others[0]!] = a;
  votes[others[1]!] = b;
  votes[others[2]!] = c;
  return votes;
}

export function initialState(seed: number, settings: MillionaireSettings): MillionaireState {
  const rng = mulberry32(seed);
  const shuffled = [...ALL_QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return {
    settings,
    questions: shuffled.slice(0, 15),
    level: 0,
    score: 0,
    phase: "playing",
    eliminated: [false, false, false, false],
    audienceVotes: [25, 25, 25, 25],
    phoneHint: "",
    lifeline5050Used: false,
    lifelineAudienceUsed: false,
    lifelinePhoneUsed: false,
    lastChoice: -1,
    seed,
  };
}

export function reducer(state: MillionaireState, action: MillionaireAction): MillionaireState {
  const rng = mulberry32(state.seed + state.level * 31 + 7);

  switch (action.type) {
    case "answer": {
      if (state.phase !== "playing") return state;
      const q = state.questions[state.level]!;
      if (state.eliminated[action.choice]) return state;
      if (action.choice !== q.correct) {
        const safe = safetyNet(state.level);
        return {
          ...state,
          score: safe,
          phase: "wrong",
          lastChoice: action.choice,
        };
      }
      const earned = PRIZES[state.level]!;
      const nextLevel = state.level + 1;
      if (nextLevel >= PRIZES.length) {
        return { ...state, score: earned, phase: "won", level: nextLevel, lastChoice: action.choice };
      }
      return {
        ...state,
        score: earned,
        level: nextLevel,
        phase: "playing",
        eliminated: [false, false, false, false],
        audienceVotes: [25, 25, 25, 25],
        phoneHint: "",
        lastChoice: action.choice,
      };
    }

    case "use_5050": {
      if (state.phase !== "playing") return state;
      if (state.lifeline5050Used || state.settings.lifelines === "none") return state;
      const q = state.questions[state.level]!;
      const wrongs = [0, 1, 2, 3].filter(i => i !== q.correct && !state.eliminated[i]);
      // Eliminate 2 wrong answers
      const toElim = wrongs.slice(0, 2);
      const elim = [...state.eliminated];
      toElim.forEach(i => { elim[i] = true; });
      return { ...state, eliminated: elim, lifeline5050Used: true };
    }

    case "use_audience": {
      if (state.phase !== "playing") return state;
      if (state.lifelineAudienceUsed || state.settings.lifelines === "none") return state;
      const q = state.questions[state.level]!;
      const votes = getAudienceVotes(q, rng);
      return { ...state, audienceVotes: votes, lifelineAudienceUsed: true, phase: "lifeline_audience" };
    }

    case "use_phone": {
      if (state.phase !== "playing") return state;
      if (state.lifelinePhoneUsed || state.settings.lifelines === "none") return state;
      const q = state.questions[state.level]!;
      const hint = getPhoneHint(q, rng);
      return { ...state, phoneHint: hint, lifelinePhoneUsed: true, phase: "lifeline_phone" };
    }

    case "dismiss_lifeline":
      if (state.phase === "lifeline_audience" || state.phase === "lifeline_phone") {
        return { ...state, phase: "playing" };
      }
      return state;

    case "walk_away":
      if (state.phase !== "playing") return state;
      return { ...state, score: PRIZES[state.level - 1] ?? 0, phase: "walk_away" };

    default:
      return state;
  }
}

export function isTerminal(state: MillionaireState): { score: number } | null {
  if (state.phase === "wrong" || state.phase === "won" || state.phase === "walk_away") {
    return { score: state.score };
  }
  return null;
}
