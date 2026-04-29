import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NinukiRenjuSettings { questions: "10"; }
export interface NinukiRenjuState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NinukiRenjuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Ninuki-Renju adds which alternate win to Renju?",
    "choices": [
      "Capturing five pairs of opponent stones",
      "Forming a square",
      "Crossing the board",
      "First move advantage"
    ],
    "correct": 0
  },
  {
    "question": "Captures occur when",
    "choices": [
      "Two adjacent enemy stones are flanked by your stones",
      "A pair is touched",
      "Stones cross center",
      "Group is surrounded"
    ],
    "correct": 0
  },
  {
    "question": "Ninuki literally means",
    "choices": [
      "Two-pull (pair-capture)",
      "Five line",
      "Big stone",
      "King row"
    ],
    "correct": 0
  },
  {
    "question": "Standard Ninuki-Renju board?",
    "choices": [
      "15x15",
      "9x9",
      "19x19",
      "8x8"
    ],
    "correct": 0
  },
  {
    "question": "Ninuki-Renju is closely related to",
    "choices": [
      "Pente (a near-identical Western variant)",
      "Go",
      "Chess",
      "Mahjong"
    ],
    "correct": 0
  },
  {
    "question": "Pair captures count toward win when",
    "choices": [
      "Five captured pairs equals victory",
      "Three pairs equals victory",
      "Ten pairs needed",
      "Captures don't matter"
    ],
    "correct": 0
  },
  {
    "question": "Forbidden moves still applied to black?",
    "choices": [
      "Yes, in classical Renju-style",
      "No, never",
      "Only after move 20",
      "Only by tournament rule"
    ],
    "correct": 0
  },
  {
    "question": "Ninuki-Renju is from",
    "choices": [
      "Japan, dating to early 20th century",
      "Modern USA",
      "Ancient China",
      "1900s Korea"
    ],
    "correct": 0
  },
  {
    "question": "If both win conditions occur on same move?",
    "choices": [
      "Five-in-a-row wins (per most rule sets)",
      "Capture wins",
      "Game restarts",
      "It's a draw"
    ],
    "correct": 0
  },
  {
    "question": "Strategically, captures threaten",
    "choices": [
      "Both winning by capture and undermining opponent's lines",
      "Only capture wins",
      "Only stops 5-in-row",
      "Nothing"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: NinukiRenjuSettings): NinukiRenjuState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NinukiRenjuState, action: NinukiRenjuAction): NinukiRenjuState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NinukiRenjuState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
