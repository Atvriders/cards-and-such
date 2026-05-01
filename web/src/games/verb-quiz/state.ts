import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VerbQuizSettings { questions: "8" | "10" | "12"; }
export interface VerbQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VerbQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
{
  "question": "She ___ to the store.",
  "choices": [
    "walks",
    "walk's",
    "walked'",
    "walking quietly only"
  ],
  "correct": 0
},
{
  "question": "They ___ pizza yesterday.",
  "choices": [
    "ate",
    "eats",
    "eating",
    "eaten"
  ],
  "correct": 0
},
{
  "question": "He ___ a book right now.",
  "choices": [
    "is reading",
    "reads always",
    "read tomorrow",
    "readed"
  ],
  "correct": 0
},
{
  "question": "I ___ tomorrow.",
  "choices": [
    "will go",
    "goes",
    "gone",
    "going"
  ],
  "correct": 0
},
{
  "question": "She has ___ to Paris.",
  "choices": [
    "been",
    "being",
    "be",
    "bes"
  ],
  "correct": 0
},
{
  "question": "The dog ___ loudly.",
  "choices": [
    "barks",
    "barking",
    "bark's",
    "barked yesterday only"
  ],
  "correct": 0
},
{
  "question": "He ___ his homework already.",
  "choices": [
    "has finished",
    "finish",
    "finishing",
    "finishes never"
  ],
  "correct": 0
},
{
  "question": "They ___ in the pool.",
  "choices": [
    "are swimming",
    "swim's",
    "swimmed",
    "swims pool"
  ],
  "correct": 0
},
{
  "question": "She ___ a cake last week.",
  "choices": [
    "baked",
    "bakes",
    "baking",
    "bake"
  ],
  "correct": 0
},
{
  "question": "I ___ tea every morning.",
  "choices": [
    "drink",
    "drank",
    "drinking",
    "drunken"
  ],
  "correct": 0
},
{
  "question": "He ___ the window yesterday.",
  "choices": [
    "broke",
    "breaks",
    "breaking",
    "broken"
  ],
  "correct": 0
},
{
  "question": "The kids ___ in the yard.",
  "choices": [
    "are playing",
    "plays one",
    "played never",
    "play's"
  ],
  "correct": 0
},
{
  "question": "She ___ a song.",
  "choices": [
    "sang",
    "sings's",
    "singed",
    "sing's"
  ],
  "correct": 0
},
{
  "question": "They ___ a movie tonight.",
  "choices": [
    "will watch",
    "watches",
    "watched yesterday only",
    "watching"
  ],
  "correct": 0
},
{
  "question": "I have ___ that book.",
  "choices": [
    "read",
    "readed",
    "reading",
    "reads"
  ],
  "correct": 0
},
{
  "question": "He ___ the door.",
  "choices": [
    "opened",
    "opens'",
    "opening",
    "open's"
  ],
  "correct": 0
},
{
  "question": "She ___ early today.",
  "choices": [
    "arrived",
    "arrives's",
    "arriving",
    "arrive's"
  ],
  "correct": 0
},
{
  "question": "The bird ___ away.",
  "choices": [
    "flew",
    "flies's",
    "flown only",
    "flying away to"
  ],
  "correct": 0
},
{
  "question": "We ___ dinner now.",
  "choices": [
    "are eating",
    "ate's",
    "eatened",
    "eat's"
  ],
  "correct": 0
},
{
  "question": "They ___ to school every day.",
  "choices": [
    "go",
    "goes",
    "going",
    "gone"
  ],
  "correct": 0
},
{
  "question": "She ___ the cup.",
  "choices": [
    "dropped",
    "drop's",
    "dropping",
    "drops yesterday only"
  ],
  "correct": 0
},
{
  "question": "I ___ him last week.",
  "choices": [
    "met",
    "meets",
    "meeting",
    "meeted"
  ],
  "correct": 0
},
{
  "question": "He ___ the truth.",
  "choices": [
    "told",
    "tells's",
    "telling",
    "told'd"
  ],
  "correct": 0
},
{
  "question": "They have ___ the race.",
  "choices": [
    "won",
    "win's",
    "winning",
    "winned"
  ],
  "correct": 0
},
{
  "question": "She ___ a letter.",
  "choices": [
    "wrote",
    "writes's",
    "writing",
    "writed"
  ],
  "correct": 0
},
{
  "question": "I ___ a new car.",
  "choices": [
    "bought",
    "buys's",
    "buying",
    "buyed"
  ],
  "correct": 0
},
{
  "question": "He ___ his keys.",
  "choices": [
    "lost",
    "loses's",
    "loosing",
    "losed"
  ],
  "correct": 0
},
{
  "question": "We ___ a present.",
  "choices": [
    "gave",
    "gives's",
    "giving",
    "gived"
  ],
  "correct": 0
},
{
  "question": "She ___ the answer.",
  "choices": [
    "knew",
    "knows's",
    "knowing",
    "knowed"
  ],
  "correct": 0
},
{
  "question": "They ___ at the joke.",
  "choices": [
    "laughed",
    "laughs's",
    "laughing",
    "laughd"
  ],
  "correct": 0
}
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VerbQuizSettings): VerbQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VerbQuizState, action: VerbQuizAction): VerbQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VerbQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
