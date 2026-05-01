import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BirdSongsQuizSettings { questions: "10"; }
export interface BirdSongsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BirdSongsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which bird is famous for the call \"who cooks for you, who cooks for you all\"?", choices: ["Great horned owl", "Barred owl", "Screech owl", "Snowy owl"], correct: 1 },
  { question: "The Northern Cardinal song is often described as?", choices: ["A trilling whistle \"birdy-birdy-birdy\"", "A harsh caw", "A flute-like warble", "A buzzing trill"], correct: 0 },
  { question: "Which bird mimics the songs of many other species?", choices: ["Northern mockingbird", "American robin", "Blue jay", "Chickadee"], correct: 0 },
  { question: "The black-capped chickadee call sounds like?", choices: ["\"chick-a-dee-dee-dee\"", "\"caw-caw\"", "\"hoo-hoo\"", "\"tweet-tweet\""], correct: 0 },
  { question: "A common loon is known for its?", choices: ["Yodeling wail", "Harsh squawk", "Soft coo", "Buzzing call"], correct: 0 },
  { question: "\"Drink your tea\" is a mnemonic for which bird song?", choices: ["Eastern towhee", "Song sparrow", "House finch", "Goldfinch"], correct: 0 },
  { question: "Mourning doves are known for their?", choices: ["Mournful cooing", "Shrill scream", "Cackle", "Whistle"], correct: 0 },
  { question: "The American robin sings a series of?", choices: ["Cheerily-cheer-up phrases", "Trills", "Whistles only", "Chirps"], correct: 0 },
  { question: "Which bird is named after its repeated call?", choices: ["Whip-poor-will", "Cardinal", "Sparrow", "Eagle"], correct: 0 },
  { question: "Eastern bluebirds sing a?", choices: ["Soft warble of \"tu-a-wee\"", "Loud caw", "Sharp pip", "Long whistle"], correct: 0 },
  { question: "White-throated sparrow song is often \"Oh sweet\"?", choices: ["\"Canada Canada Canada\"", "\"America America\"", "\"Mexico Mexico\"", "\"England England\""], correct: 0 },
  { question: "The wood thrush is admired for its?", choices: ["Flute-like ee-oh-lay", "Harsh trill", "Mimicked sounds", "Whistled call"], correct: 0 },
  { question: "Red-winged blackbirds sing a distinctive?", choices: ["\"conk-la-ree!\"", "\"caw-caw\"", "\"hoo-hoo\"", "\"chirp\""], correct: 0 },
  { question: "Which bird drums on trees instead of singing?", choices: ["Woodpecker", "Robin", "Sparrow", "Cardinal"], correct: 0 },
  { question: "Indigo bunting song is described as?", choices: ["Paired phrases sung at high pitch", "Single low whistle", "Clucking", "Drumming"], correct: 0 },
  { question: "The killdeer is named for its?", choices: ["Loud \"kill-deer\" call", "Hunting habits", "Color", "Size"], correct: 0 },
  { question: "Catbirds are named because they?", choices: ["Mew like cats", "Hunt cats", "Look like cats", "Live with cats"], correct: 0 },
  { question: "A \"dawn chorus\" refers to?", choices: ["Birds singing at sunrise", "Bird mating dance", "Migration call", "Nest building"], correct: 0 },
  { question: "Songs are typically sung by which sex in most species?", choices: ["Females only", "Males primarily", "Both equally", "Juveniles"], correct: 1 },
  { question: "The primary purposes of bird song are?", choices: ["Territory and mating", "Navigation only", "Cooling off", "Digestion"], correct: 0 },
  { question: "Which bird lacks a song and only croaks/quacks?", choices: ["American crow", "Wood thrush", "Cardinal", "Wren"], correct: 0 },
  { question: "Hermit thrush song is known for being?", choices: ["Ethereal and flute-like", "Harsh", "Buzzy", "Repetitive caw"], correct: 0 },
  { question: "Yellow warbler sings a phrase often described as?", choices: ["\"sweet-sweet-sweet, I'm so sweet\"", "\"caw-caw\"", "\"hoo-hoo\"", "\"tee-tee\""], correct: 0 },
  { question: "Carolina wren is loud for its size, singing?", choices: ["\"teakettle-teakettle-teakettle\"", "\"chick-a-dee\"", "\"caw\"", "\"hoo-hoo\""], correct: 0 },
  { question: "The vocal organ in birds is called the?", choices: ["Larynx", "Syrinx", "Trachea", "Crop"], correct: 1 },
  { question: "Some birds can sing two notes at once because?", choices: ["Two sides of syrinx work independently", "Echo", "Magic", "Fast switching"], correct: 0 },
  { question: "Nightingales are famous in Europe for?", choices: ["Singing at night", "Bright colors", "Migration distance", "Size"], correct: 0 },
  { question: "Which bird is the state bird of seven US states for its singing?", choices: ["Northern cardinal", "Robin", "Mockingbird", "Bluebird"], correct: 0 },
  { question: "A \"call\" differs from a \"song\" because calls are?", choices: ["Shorter and functional (alarm, contact)", "Longer", "Only sung at dawn", "Always musical"], correct: 0 },
  { question: "Young birds learn species-specific songs by?", choices: ["Listening to adults during a critical period", "Instinct alone", "Reading", "Pure invention"], correct: 0 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }

export function initialState(seed: number, _settings: BirdSongsQuizSettings): BirdSongsQuizState {
  const rng = mulberry32(seed);
  const count = 10;
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s = shuffle(idx,rng); const nc = s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: BirdSongsQuizState, action: BirdSongsQuizAction): BirdSongsQuizState {
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

export function isTerminal(state: BirdSongsQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
