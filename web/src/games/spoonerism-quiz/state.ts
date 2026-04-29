import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpoonerismQuizSettings { questions: "8" | "10" | "12"; }
export interface SpoonerismQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpoonerismQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Spoonerism: 'belly jeans' = ?",
    "choices": [
      "jelly beans",
      "baby genes",
      "belly grins",
      "bell joins"
    ],
    "correct": 0
  },
  {
    "question": "'lack of pies' = ?",
    "choices": [
      "pack of lies",
      "lack of fries",
      "lots of pies",
      "luck of pies"
    ],
    "correct": 0
  },
  {
    "question": "'shake a tower' = ?",
    "choices": [
      "take a shower",
      "make a tower",
      "shape a tower",
      "sake a hour"
    ],
    "correct": 0
  },
  {
    "question": "'cattle ships' = ?",
    "choices": [
      "battleships",
      "cattle hips",
      "saddle ships",
      "battle slips"
    ],
    "correct": 0
  },
  {
    "question": "'dear old queen' = ?",
    "choices": [
      "queer old dean",
      "dear old quill",
      "near old green",
      "fair old queen"
    ],
    "correct": 0
  },
  {
    "question": "'tons of soil' = ?",
    "choices": [
      "sons of toil",
      "tons of foil",
      "tans of soil",
      "ton of toils"
    ],
    "correct": 0
  },
  {
    "question": "'wave the sails' = ?",
    "choices": [
      "save the whales",
      "wave the rails",
      "gave the sails",
      "wave the snails"
    ],
    "correct": 0
  },
  {
    "question": "'fight in your liar' = ?",
    "choices": [
      "light in your fryer",
      "fight in your liver",
      "write in your fire",
      "light in your eye"
    ],
    "correct": 0
  },
  {
    "question": "'roaring pain' = ?",
    "choices": [
      "pouring rain",
      "raring pane",
      "road in pain",
      "ruling pen"
    ],
    "correct": 0
  },
  {
    "question": "'know your blows' = ?",
    "choices": [
      "blow your nose",
      "grow your blows",
      "know the blow",
      "go your blows"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SpoonerismQuizSettings): SpoonerismQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpoonerismQuizState, action: SpoonerismQuizAction): SpoonerismQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpoonerismQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
