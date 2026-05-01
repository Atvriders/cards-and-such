import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NounQuizSettings { questions: "8" | "10" | "12"; }
export interface NounQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NounQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
{
  "question": "The ___ ran across the road.",
  "choices": [
    "cat",
    "quickly",
    "run",
    "ran"
  ],
  "correct": 0
},
{
  "question": "She bought a new ___.",
  "choices": [
    "dress",
    "wear",
    "beautifully",
    "beautiful"
  ],
  "correct": 0
},
{
  "question": "The ___ shines brightly.",
  "choices": [
    "sun",
    "shiny",
    "shines",
    "brightly"
  ],
  "correct": 0
},
{
  "question": "He drank a glass of ___.",
  "choices": [
    "water",
    "drink",
    "drank",
    "cold"
  ],
  "correct": 0
},
{
  "question": "The ___ barked loudly.",
  "choices": [
    "dog",
    "bark",
    "loudly",
    "loud"
  ],
  "correct": 0
},
{
  "question": "My ___ is a teacher.",
  "choices": [
    "mother",
    "teach",
    "kindly",
    "teaches"
  ],
  "correct": 0
},
{
  "question": "The ___ flew over the trees.",
  "choices": [
    "bird",
    "fly",
    "flew",
    "over"
  ],
  "correct": 0
},
{
  "question": "She wrote a ___.",
  "choices": [
    "book",
    "wrote",
    "writing",
    "write"
  ],
  "correct": 0
},
{
  "question": "The ___ is on the table.",
  "choices": [
    "plate",
    "on",
    "placed",
    "tableted"
  ],
  "correct": 0
},
{
  "question": "He drove the ___.",
  "choices": [
    "car",
    "drove",
    "driving",
    "drives"
  ],
  "correct": 0
},
{
  "question": "The ___ is a planet.",
  "choices": [
    "Earth",
    "earthly",
    "earths",
    "earthen"
  ],
  "correct": 0
},
{
  "question": "My ___ is at home.",
  "choices": [
    "sister",
    "sisterly",
    "sisters arrive",
    "at home goes"
  ],
  "correct": 0
},
{
  "question": "The ___ rang loudly.",
  "choices": [
    "bell",
    "ring",
    "rang",
    "loudly"
  ],
  "correct": 0
},
{
  "question": "She painted a beautiful ___.",
  "choices": [
    "picture",
    "paint",
    "painted",
    "beautifully"
  ],
  "correct": 0
},
{
  "question": "The ___ swims in the sea.",
  "choices": [
    "fish",
    "swim",
    "swimming",
    "sea-going"
  ],
  "correct": 0
},
{
  "question": "He ate an ___.",
  "choices": [
    "apple",
    "ate",
    "eating",
    "eats"
  ],
  "correct": 0
},
{
  "question": "The ___ grew tall.",
  "choices": [
    "tree",
    "grew",
    "growing",
    "tallness"
  ],
  "correct": 0
},
{
  "question": "She lost her ___.",
  "choices": [
    "wallet",
    "lost",
    "losing",
    "loses"
  ],
  "correct": 0
},
{
  "question": "The ___ is hot today.",
  "choices": [
    "weather",
    "hotly",
    "heated",
    "heats"
  ],
  "correct": 0
},
{
  "question": "My ___ is broken.",
  "choices": [
    "phone",
    "brokenly",
    "breaks",
    "broken"
  ],
  "correct": 0
},
{
  "question": "The ___ stopped at the station.",
  "choices": [
    "train",
    "stop",
    "stopped",
    "trained"
  ],
  "correct": 0
},
{
  "question": "He needs a new ___.",
  "choices": [
    "computer",
    "computes",
    "computing",
    "needed"
  ],
  "correct": 0
},
{
  "question": "The ___ runs the country.",
  "choices": [
    "president",
    "runs",
    "running",
    "ruled"
  ],
  "correct": 0
},
{
  "question": "She wears a ___.",
  "choices": [
    "hat",
    "wears",
    "wearing",
    "worn"
  ],
  "correct": 0
},
{
  "question": "The ___ is sharp.",
  "choices": [
    "knife",
    "sharply",
    "sharpens",
    "sharpen"
  ],
  "correct": 0
},
{
  "question": "He plays the ___.",
  "choices": [
    "guitar",
    "plays",
    "playing",
    "played"
  ],
  "correct": 0
},
{
  "question": "The ___ is closed.",
  "choices": [
    "door",
    "closes",
    "closing",
    "closed firmly"
  ],
  "correct": 0
},
{
  "question": "She studies ___.",
  "choices": [
    "history",
    "studied",
    "studying",
    "studies"
  ],
  "correct": 0
},
{
  "question": "The ___ flew through the sky.",
  "choices": [
    "plane",
    "flew",
    "flying",
    "sky-high"
  ],
  "correct": 0
},
{
  "question": "He climbed the ___.",
  "choices": [
    "mountain",
    "climbs",
    "climbing",
    "climbed high"
  ],
  "correct": 0
}
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NounQuizSettings): NounQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NounQuizState, action: NounQuizAction): NounQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NounQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
