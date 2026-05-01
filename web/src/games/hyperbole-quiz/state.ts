import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HyperboleQuizSettings { questions: "8" | "12"; }
export interface HyperboleQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HyperboleQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which is a hyperbole?", choices: ["I'm a little tired","I'm so hungry I could eat a horse","I had a snack","I am tall"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["He runs fast","I've told you a million times","I called him","She is tall"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["My backpack weighs a ton","It is heavy","Carry the bag","Lift the box"], correct: 0 },
  { question: "Which is a hyperbole?", choices: ["I waited a long time","I waited an eternity","The bus came","Time passed"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["She has a big house","Her house is huge","Her house is the size of a small country","Her place is large"], correct: 2 },
  { question: "Which is a hyperbole?", choices: ["This box is heavy","This box weighs a hundred tons","Lift carefully","Big box"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["I laughed loudly","I laughed my head off","She giggled","He smiled"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["I'm freezing","I'm so cold I'm an ice cube","Cool weather","Bring a coat"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["The sun is bright","The sun is hot","I'm dying of heat","It's warm out"], correct: 2 },
  { question: "Which is a hyperbole?", choices: ["I have a lot of homework","I have a mountain of homework","Homework is due","Study time"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["He is a fast runner","He runs faster than the wind","Track race","Sprint event"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["The line is long","The line stretches for miles","Wait in line","Hold a place"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["My dog is loud","My dog's bark could wake the dead","The dog ran","Pet the dog"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["She is smart","She knows everything in the universe","Smart student","Top of class"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["He is tall","He is so tall he scrapes the sky","Tall man","Six feet tall"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["I'm so tired I could sleep for a year","I am tired","Rested up","Took a nap"], correct: 0 },
  { question: "Which is a hyperbole?", choices: ["The bag is light","I could lift this bag with one finger","Light bag","Easy lift"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["The story is funny","I laughed until I cried","Joke told","She smiled"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["This burger is huge","This burger could feed an army","Big burger","Order food"], correct: 1 },
  { question: "Which is a hyperbole?", choices: ["I have nothing to wear (closet full)","I have a dress","I bought a coat","Shopped today"], correct: 0 },
  { question: "Which is a hyperbole?", choices: ["His smile lit up the room","He smiled","He is happy","He grinned"], correct: 0 },
  { question: "Which is a hyperbole?", choices: ["I'm so hungry I could eat a cow","I'm hungry","Lunch time","Need food"], correct: 0 },
  { question: "Which is a hyperbole?", choices: ["She cried a river","She cried","Tears fell","She sobbed"], correct: 0 },
  { question: "Which is a hyperbole?", choices: ["This bag weighs a thousand pounds","Heavy bag","Carry bag","Lift up"], correct: 0 },
  { question: "Which is a hyperbole?", choices: ["I'm so bored I could die","I'm bored","Watching TV","Sit still"], correct: 0 },
  { question: "Which is a hyperbole?", choices: ["The test took forever","The test took an hour","Test today","Study hard"], correct: 0 },
  { question: "Which is a hyperbole?", choices: ["My feet are killing me","My feet hurt","Long walk","Sore feet"], correct: 0 },
  { question: "Which is a hyperbole?", choices: ["I'm drowning in emails","I have many emails","Inbox full","Reply soon"], correct: 0 },
  { question: "Which is a hyperbole?", choices: ["He is older than the hills","He is old","He has gray hair","He is sixty"], correct: 0 },
  { question: "Which is a hyperbole?", choices: ["I could eat the whole fridge","I'm hungry","Lunch ready","Eat snack"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HyperboleQuizSettings): HyperboleQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => {
    const idx = q.choices.map((c, i) => ({ c, i }));
    const s = shuffle(idx, rng);
    const nc = s.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: s.map(x => x.c) as [string, string, string, string], correct: nc };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: HyperboleQuizState, action: HyperboleQuizAction): HyperboleQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const ok = state.selected === q.correct;
      const pts = ok ? 100 + Math.floor(state.timeLeft * 10) : 0;
      return { ...state, submitted: true, score: state.score + pts, correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const t = state.timeLeft - 1;
      return t <= 0 ? { ...state, timeLeft: 0, submitted: true, phase: "result" } : { ...state, timeLeft: t };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      return ni >= state.questions.length ? { ...state, phase: "done" } : { ...state, currentIndex: ni, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}
export function isTerminal(state: HyperboleQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
