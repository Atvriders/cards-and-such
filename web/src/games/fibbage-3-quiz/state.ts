import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Fibbage3QuizSettings { questions: "10"; }
export interface Fibbage3QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Fibbage3QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Fibbage 3 added which mode?",
    "choices": [
      "Enough About You",
      "Solo dungeon",
      "Map painting",
      "Auction"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage 3 is in which Jackbox pack?",
    "choices": [
      "Pack 4",
      "Pack 5",
      "Pack 6",
      "Pack 9"
    ],
    "correct": 0
  },
  {
    "question": "'Enough About You' draws prompts from?",
    "choices": [
      "Player-submitted facts",
      "Trivia DB",
      "News",
      "Dictionary"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage 3 uses up to how many players?",
    "choices": [
      "4",
      "6",
      "8",
      "16"
    ],
    "correct": 2
  },
  {
    "question": "Audience mode allows what?",
    "choices": [
      "Bonus stream voters to play along",
      "Solo only",
      "Co-op only",
      "Drawing only"
    ],
    "correct": 0
  },
  {
    "question": "Truth-or-dare-like reveals are at end of round?",
    "choices": [
      "Yes - the truth is shown",
      "No - never",
      "Only on tie",
      "Only with paid DLC"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage 3 supports the controller as?",
    "choices": [
      "Phone via web URL",
      "Console pad only",
      "Keyboard only",
      "VR only"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage 3 round count is typically?",
    "choices": [
      "1",
      "3 with final",
      "10",
      "100"
    ],
    "correct": 1
  },
  {
    "question": "Lying convincingly rewards?",
    "choices": [
      "Points from each duped voter",
      "Random dice",
      "Mass votes by audience only",
      "Nothing"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage 3 is great for which group setting?",
    "choices": [
      "Streaming/parties",
      "Solo grinding",
      "Pen and paper LAN",
      "Single sit-down"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Fibbage3QuizSettings): Fibbage3QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Fibbage3QuizState, action: Fibbage3QuizAction): Fibbage3QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Fibbage3QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
