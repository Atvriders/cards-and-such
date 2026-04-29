import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PreChessPositionsSettings { questions: "10"; }
export interface PreChessPositionsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PreChessPositionsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Pre-Chess Placement allows players to",
    "choices": [
      "Place back-rank pieces in any order before play",
      "Skip pawns",
      "Use 10 pieces",
      "Move twice in turn one"
    ],
    "correct": 0
  },
  {
    "question": "Pawns in Pre-Chess are",
    "choices": [
      "Standard on rank 2",
      "Removed entirely",
      "Placed by player",
      "Hidden until move 1"
    ],
    "correct": 0
  },
  {
    "question": "After placement, the game uses",
    "choices": [
      "Standard chess rules",
      "Atomic chess rules",
      "Crazyhouse rules",
      "Drafts rules"
    ],
    "correct": 0
  },
  {
    "question": "Are the kings allowed in any back-rank file?",
    "choices": [
      "Yes—any back-rank square chosen",
      "Only on e1/e8",
      "Only on a1/h1",
      "Only at center"
    ],
    "correct": 0
  },
  {
    "question": "Bishops should typically be placed",
    "choices": [
      "On opposite-color squares for full coverage",
      "Stacked on same file",
      "Off the board",
      "On the second rank"
    ],
    "correct": 0
  },
  {
    "question": "Castling rules adapt: castling is",
    "choices": [
      "Possible if king and rook are still on back rank, similar to Chess960",
      "Forbidden",
      "Replaced by drop-castling",
      "Mandatory move 1"
    ],
    "correct": 0
  },
  {
    "question": "Pre-Chess differs from Chess960 because",
    "choices": [
      "Players choose placements; Chess960 is randomized",
      "Rooks are removed",
      "It's a 9x9 board",
      "Pawns can promote on rank 5"
    ],
    "correct": 0
  },
  {
    "question": "Best opening principle?",
    "choices": [
      "Coordinate piece placement before the game starts",
      "Push h-pawn early",
      "Trade all knights",
      "Castle on move 2"
    ],
    "correct": 0
  },
  {
    "question": "Pre-Chess is sometimes called",
    "choices": [
      "Pre-Chess or Bronstein-Setup",
      "Random Chess",
      "Atomic Setup",
      "Crazy Setup"
    ],
    "correct": 0
  },
  {
    "question": "Can both armies have asymmetric placements?",
    "choices": [
      "Yes—each player chooses independently",
      "No, must mirror",
      "Only by toss",
      "Only with arbiter approval"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PreChessPositionsSettings): PreChessPositionsState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PreChessPositionsState, action: PreChessPositionsAction): PreChessPositionsState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PreChessPositionsState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
