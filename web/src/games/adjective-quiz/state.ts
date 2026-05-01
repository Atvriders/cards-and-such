import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AdjectiveQuizSettings { questions: "8" | "10" | "12"; }
export interface AdjectiveQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AdjectiveQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
{
  "question": "She wore a ___ dress.",
  "choices": [
    "red",
    "run",
    "ran",
    "running"
  ],
  "correct": 0
},
{
  "question": "The ___ cat slept.",
  "choices": [
    "lazy",
    "lazily",
    "laziness",
    "lazes"
  ],
  "correct": 0
},
{
  "question": "It was a ___ day.",
  "choices": [
    "sunny",
    "sun",
    "sunning",
    "suns"
  ],
  "correct": 0
},
{
  "question": "He bought a ___ car.",
  "choices": [
    "new",
    "newly",
    "news",
    "newness"
  ],
  "correct": 0
},
{
  "question": "The ___ child laughed.",
  "choices": [
    "happy",
    "happily",
    "happiness",
    "happens"
  ],
  "correct": 0
},
{
  "question": "She has ___ hair.",
  "choices": [
    "long",
    "longly",
    "longing",
    "longs"
  ],
  "correct": 0
},
{
  "question": "The ___ soup was hot.",
  "choices": [
    "delicious",
    "delight",
    "delights",
    "delighted"
  ],
  "correct": 0
},
{
  "question": "That was a ___ movie.",
  "choices": [
    "scary",
    "scare",
    "scares",
    "scaring"
  ],
  "correct": 0
},
{
  "question": "He told a ___ joke.",
  "choices": [
    "funny",
    "fun",
    "funning",
    "funs"
  ],
  "correct": 0
},
{
  "question": "The ___ dog barked.",
  "choices": [
    "big",
    "bigly",
    "bigness",
    "bigs"
  ],
  "correct": 0
},
{
  "question": "She is a ___ student.",
  "choices": [
    "smart",
    "smartly",
    "smartness",
    "smarts"
  ],
  "correct": 0
},
{
  "question": "They live in a ___ house.",
  "choices": [
    "small",
    "smallness",
    "smallest",
    "smally"
  ],
  "correct": 0
},
{
  "question": "The ___ road was wet.",
  "choices": [
    "narrow",
    "narrowly",
    "narrowness",
    "narrows"
  ],
  "correct": 0
},
{
  "question": "It is a ___ idea.",
  "choices": [
    "good",
    "goodness",
    "well",
    "goods"
  ],
  "correct": 0
},
{
  "question": "He is ___.",
  "choices": [
    "tall",
    "tally",
    "tallness",
    "talls"
  ],
  "correct": 0
},
{
  "question": "She wore a ___ ring.",
  "choices": [
    "gold",
    "goldly",
    "golden hour",
    "golds"
  ],
  "correct": 0
},
{
  "question": "The water is ___.",
  "choices": [
    "cold",
    "coldly",
    "coldness",
    "colds"
  ],
  "correct": 0
},
{
  "question": "That coffee is ___.",
  "choices": [
    "hot",
    "hotly",
    "hotness",
    "hots"
  ],
  "correct": 0
},
{
  "question": "The ___ kitten is cute.",
  "choices": [
    "fluffy",
    "fluff",
    "fluffs",
    "fluffing"
  ],
  "correct": 0
},
{
  "question": "She gave me a ___ smile.",
  "choices": [
    "warm",
    "warmly",
    "warmness",
    "warms"
  ],
  "correct": 0
},
{
  "question": "He is a ___ runner.",
  "choices": [
    "fast",
    "fasten",
    "fastness",
    "fasts"
  ],
  "correct": 0
},
{
  "question": "The lecture was ___.",
  "choices": [
    "boring",
    "bore",
    "bores",
    "bored to leave"
  ],
  "correct": 0
},
{
  "question": "She has ___ eyes.",
  "choices": [
    "blue",
    "bluely",
    "blueness",
    "blues"
  ],
  "correct": 0
},
{
  "question": "This box is ___.",
  "choices": [
    "heavy",
    "heavily",
    "heaviness",
    "heavies"
  ],
  "correct": 0
},
{
  "question": "The ___ flower bloomed.",
  "choices": [
    "yellow",
    "yellowly",
    "yellowing",
    "yellows"
  ],
  "correct": 0
},
{
  "question": "That's an ___ answer.",
  "choices": [
    "interesting",
    "interest",
    "interests",
    "interested party"
  ],
  "correct": 0
},
{
  "question": "She is ___.",
  "choices": [
    "kind",
    "kindly",
    "kindness",
    "kinds"
  ],
  "correct": 0
},
{
  "question": "The ___ moon glowed.",
  "choices": [
    "full",
    "fully",
    "fullness",
    "fills"
  ],
  "correct": 0
},
{
  "question": "It was a ___ surprise.",
  "choices": [
    "pleasant",
    "pleasantly",
    "pleasantness",
    "pleases"
  ],
  "correct": 0
},
{
  "question": "He bought a ___ bicycle.",
  "choices": [
    "shiny",
    "shine",
    "shines",
    "shining"
  ],
  "correct": 0
}
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AdjectiveQuizSettings): AdjectiveQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AdjectiveQuizState, action: AdjectiveQuizAction): AdjectiveQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AdjectiveQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
