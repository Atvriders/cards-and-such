import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface XiangqiChessSettings { questions: "10"; }
export interface XiangqiChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type XiangqiChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Xiangqi board features",
    "choices": [
      "A river separating two halves and palaces",
      "Hexagonal grid",
      "Standard 8x8",
      "Triangular squares"
    ],
    "correct": 0
  },
  {
    "question": "Cannon captures by",
    "choices": [
      "Jumping over exactly one screen piece",
      "Sliding straight",
      "Knight-leaps",
      "Diagonal leaps"
    ],
    "correct": 0
  },
  {
    "question": "Generals (kings) cannot",
    "choices": [
      "Face each other on the same open file with no pieces between",
      "Be checked",
      "Move sideways",
      "Be captured"
    ],
    "correct": 0
  },
  {
    "question": "Elephants cannot cross",
    "choices": [
      "The river",
      "Their palace",
      "Diagonals",
      "Files"
    ],
    "correct": 0
  },
  {
    "question": "Soldiers (pawns) gain power when",
    "choices": [
      "They cross the river — gaining sideways movement",
      "They reach rank 8",
      "They form pairs",
      "Two ranks captured"
    ],
    "correct": 0
  },
  {
    "question": "Number of pieces per side at start?",
    "choices": [
      "16",
      "20",
      "24",
      "12"
    ],
    "correct": 0
  },
  {
    "question": "Xiangqi is also called",
    "choices": [
      "Chinese Chess",
      "Korean Chess",
      "Japanese Chess",
      "Burmese Chess"
    ],
    "correct": 0
  },
  {
    "question": "Pieces are placed on",
    "choices": [
      "Intersections of grid lines, not squares",
      "Squares",
      "Triangles",
      "Hexagons"
    ],
    "correct": 0
  },
  {
    "question": "Win condition?",
    "choices": [
      "Checkmate or stalemate the opposing general",
      "Capture all soldiers",
      "Cross the river first",
      "Promote three pawns"
    ],
    "correct": 0
  },
  {
    "question": "Common Xiangqi opening?",
    "choices": [
      "Central Cannon (palitching cannon to center)",
      "King's Indian",
      "Sicilian Najdorf",
      "Latvian Gambit"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: XiangqiChessSettings): XiangqiChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: XiangqiChessState, action: XiangqiChessAction): XiangqiChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: XiangqiChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
