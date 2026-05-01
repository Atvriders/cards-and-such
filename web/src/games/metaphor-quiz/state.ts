import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MetaphorQuizSettings { questions: "8" | "12"; }
export interface MetaphorQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MetaphorQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In 'time is money,' what does money represent?", choices: ["wealth","value","speed","numbers"], correct: 1 },
  { question: "'Life is a journey' means life is a...", choices: ["path","feast","party","battle"], correct: 0 },
  { question: "'The classroom was a zoo' means it was...", choices: ["calm","chaotic","quiet","empty"], correct: 1 },
  { question: "'Her smile is sunshine' means her smile is...", choices: ["warm and bright","cold","faint","dark"], correct: 0 },
  { question: "'He has a heart of stone' means he is...", choices: ["soft","emotional","unfeeling","kind"], correct: 2 },
  { question: "'The world is a stage' compares the world to...", choices: ["a circus","a play","a school","a village"], correct: 1 },
  { question: "'My memory is a sieve' means memory is...", choices: ["sharp","leaky","large","strong"], correct: 1 },
  { question: "'He is a night owl' means he is active...", choices: ["mornings","afternoons","at night","always"], correct: 2 },
  { question: "'She is the apple of my eye' means she is...", choices: ["food","cherished","ill","tall"], correct: 1 },
  { question: "'Drowning in paperwork' means having...", choices: ["very little","just enough","too much","none"], correct: 2 },
  { question: "'A blanket of snow' compares snow to a...", choices: ["wall","cover","road","weight"], correct: 1 },
  { question: "'Time flies' means time goes...", choices: ["slowly","quickly","backward","sideways"], correct: 1 },
  { question: "'Her voice is music' means her voice is...", choices: ["loud","melodic","sharp","weak"], correct: 1 },
  { question: "'He is a couch potato' means he is...", choices: ["athletic","lazy","brave","small"], correct: 1 },
  { question: "'Ideas are seeds' compares ideas to things that...", choices: ["explode","grow","melt","shrink"], correct: 1 },
  { question: "'A flood of tears' means many...", choices: ["whispers","tears","laughs","words"], correct: 1 },
  { question: "'Chip on his shoulder' means he is...", choices: ["happy","resentful","calm","kind"], correct: 1 },
  { question: "'America is a melting pot' suggests...", choices: ["mixing of cultures","hot weather","metal industry","cooking"], correct: 0 },
  { question: "'My brother is a pig' suggests he is...", choices: ["pink","messy or greedy","strong","short"], correct: 1 },
  { question: "'Books are windows' suggests books offer...", choices: ["air","views","heat","silence"], correct: 1 },
  { question: "'The road of life' compares life to a...", choices: ["river","road","star","sea"], correct: 1 },
  { question: "'A diamond in the rough' means...", choices: ["unfinished gem","pure stone","fake jewel","shiny rock"], correct: 0 },
  { question: "'Wave of emotion' compares emotion to...", choices: ["fire","water","earth","wind"], correct: 1 },
  { question: "'The sky is crying' means it is...", choices: ["sunny","raining","windy","clear"], correct: 1 },
  { question: "'Eyes are mirrors of the soul' makes eyes a...", choices: ["window","mirror","light","door"], correct: 1 },
  { question: "'Music is medicine' means music can...", choices: ["heal","hurt","scare","tire"], correct: 0 },
  { question: "'A storm of protest' compares protest to...", choices: ["a song","a storm","a meal","a road"], correct: 1 },
  { question: "'He is a lion in battle' means he is...", choices: ["scared","brave","weak","quick"], correct: 1 },
  { question: "'Mountain of work' means a lot of...", choices: ["money","tasks","time","food"], correct: 1 },
  { question: "'Words are weapons' means words can...", choices: ["heal","hurt","sing","sleep"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MetaphorQuizSettings): MetaphorQuizState {
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
export function reducer(state: MetaphorQuizState, action: MetaphorQuizAction): MetaphorQuizState {
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
export function isTerminal(state: MetaphorQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
