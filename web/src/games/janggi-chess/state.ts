import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface JanggiChessSettings { questions: "10"; }
export interface JanggiChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type JanggiChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Janggi originates from",
    "choices": [
      "Korea",
      "China",
      "Japan",
      "Vietnam"
    ],
    "correct": 0
  },
  {
    "question": "Janggi board size?",
    "choices": [
      "9x10 with palace areas",
      "8x8",
      "10x10",
      "Hexagonal"
    ],
    "correct": 0
  },
  {
    "question": "The palace consists of",
    "choices": [
      "A 3x3 region around the general for each side",
      "Whole back rank",
      "Center 4 squares",
      "All king-color squares"
    ],
    "correct": 0
  },
  {
    "question": "Cannons in Janggi capture by",
    "choices": [
      "Jumping over a single screen piece",
      "Sliding diagonally",
      "Jumping two pieces",
      "Knight-leaps"
    ],
    "correct": 0
  },
  {
    "question": "Two cannons cannot",
    "choices": [
      "Use each other as a screen",
      "Be on the same file",
      "Move at all",
      "Promote"
    ],
    "correct": 0
  },
  {
    "question": "Win condition?",
    "choices": [
      "Checkmate the general",
      "Stalemate",
      "Capture all pawns",
      "Cross river"
    ],
    "correct": 0
  },
  {
    "question": "Janggi pawns?",
    "choices": [
      "Move forward and sideways, never backward",
      "Move backward only",
      "Move diagonally",
      "Cannot move"
    ],
    "correct": 0
  },
  {
    "question": "Pieces unique to Janggi?",
    "choices": [
      "Cannons that need a screen and elephants with diagonal jumps",
      "Bishops only",
      "Just rooks",
      "Knights only"
    ],
    "correct": 0
  },
  {
    "question": "Board uses how many squares for movement?",
    "choices": [
      "Pieces sit on intersections, not in squares",
      "Standard squares",
      "Triangle nodes",
      "Hexagon centers"
    ],
    "correct": 0
  },
  {
    "question": "Janggi is",
    "choices": [
      "A national pastime in Korea",
      "A French variant",
      "A Mahjong variant",
      "A poker variant"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: JanggiChessSettings): JanggiChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: JanggiChessState, action: JanggiChessAction): JanggiChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: JanggiChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
