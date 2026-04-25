import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DanceQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DanceQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface DanceQuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The tango originated in which country?", choices: ["Spain", "Argentina", "Brazil", "Cuba"], correct: 1 },
  { question: "Ballet originated in which country?", choices: ["France", "Russia", "Italy", "England"], correct: 2 },
  { question: "The waltz originated in which region?", choices: ["France", "England", "German-speaking Europe", "Eastern Europe"], correct: 2 },
  { question: "The flamenco dance is associated with which Spanish region?", choices: ["Catalonia", "Andalusia", "Castile", "Galicia"], correct: 1 },
  { question: "Bharatanatyam is a classical dance form from which country?", choices: ["Sri Lanka", "India", "Nepal", "Bangladesh"], correct: 1 },
  { question: "The Macarena dance was popularized by which decade?", choices: ["1970s", "1980s", "1990s", "2000s"], correct: 2 },
  { question: "Swan Lake was composed by?", choices: ["Brahms", "Beethoven", "Tchaikovsky", "Chopin"], correct: 2 },
  { question: "Salsa dancing originated in which city?", choices: ["Havana", "New York City", "Miami", "San Juan"], correct: 1 },
  { question: "What is a 'pirouette' in ballet?", choices: ["A jump", "A spin on one foot", "A bow", "A leap forward"], correct: 1 },
  { question: "Which dance style features syncopated rhythms and originated in 1920s USA?", choices: ["Charleston", "Foxtrot", "Quickstep", "Jive"], correct: 0 },
  { question: "The haka is a traditional dance of which people?", choices: ["Hawaiian", "Maori of New Zealand", "Aboriginal Australian", "Tongan"], correct: 1 },
  { question: "Which dance is named after a lake in South Carolina?", choices: ["Foxtrot", "Lindy Hop", "Charleston", "Jitterbug"], correct: 2 },
  { question: "The moonwalk dance move was popularized by?", choices: ["James Brown", "Michael Jackson", "Prince", "Usher"], correct: 1 },
  { question: "Breakdancing originated in which US city?", choices: ["Chicago", "Los Angeles", "New York City", "Philadelphia"], correct: 2 },
  { question: "Which dance style did Fred Astaire and Ginger Rogers popularize on film?", choices: ["Swing", "Ballroom/tap", "Jazz", "Foxtrot"], correct: 1 },
  { question: "What is a 'pas de deux' in ballet?", choices: ["A solo dance", "A dance for two", "A group formation", "A curtain bow"], correct: 1 },
  { question: "The Gangnam Style dance was by which artist?", choices: ["BTS", "PSY", "BigBang", "EXO"], correct: 1 },
  { question: "The cha-cha dance originated from which country?", choices: ["Brazil", "Cuba", "Puerto Rico", "Dominican Republic"], correct: 1 },
  { question: "K-pop stands for?", choices: ["Korean popular music", "Korean pop dance", "Korean performance", "Korean parade"], correct: 0 },
  { question: "The Viennese waltz differs from the slow waltz in its?", choices: ["Step pattern", "Much faster tempo", "Partner hold", "Music key"], correct: 1 },
  { question: "Tap dancing uses metal plates on the?", choices: ["Heels only", "Toes only", "Both heels and toes", "Sides of shoes"], correct: 2 },
  { question: "Which dance is sometimes called 'the forbidden dance' due to past restrictions?", choices: ["Tango", "Lambada", "Samba", "Merengue"], correct: 1 },
  { question: "Irish step dancing is characterized by?", choices: ["Fluid arm movements", "Rigid upper body and fast foot work", "Slow graceful moves", "Partner lifts"], correct: 1 },
  { question: "The Nutcracker ballet was first performed in which city?", choices: ["Paris", "Moscow", "St. Petersburg", "London"], correct: 2 },
  { question: "Bhangra is a dance style from which region?", choices: ["Gujarat", "Punjab", "Rajasthan", "Bengal"], correct: 1 },
  { question: "The disco era peaked in which decade?", choices: ["1960s", "1970s", "1980s", "1990s"], correct: 1 },
  { question: "Which dance style involves improvised partner dancing to swing music?", choices: ["Foxtrot", "Lindy Hop", "Quickstep", "Viennese Waltz"], correct: 1 },
  { question: "Popping and locking is associated with which dance style?", choices: ["Jazz", "Hip-hop street dance", "Ballet", "Ballroom"], correct: 1 },
  { question: "The polka originated in which country?", choices: ["Poland", "Czech lands (Bohemia)", "Slovakia", "Austria"], correct: 1 },
  { question: "The 'dab' dance move was popularized mainly in which decade?", choices: ["2000s", "2010s", "1990s", "2020s"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: DanceQuizSettings): DanceQuizState {
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

export function reducer(state: DanceQuizState, action: DanceQuizAction): DanceQuizState {
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

export function isTerminal(state: DanceQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
