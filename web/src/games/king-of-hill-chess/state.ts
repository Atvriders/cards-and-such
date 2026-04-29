import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KingOfHillChessSettings { questions: "10"; }
export interface KingOfHillChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KingOfHillChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Primary win condition unique to King of the Hill?",
    "choices": [
      "Move king to a center square",
      "Capture all pawns",
      "Promote two pawns",
      "Stalemate"
    ],
    "correct": 0
  },
  {
    "question": "Which squares are the 'hill'?",
    "choices": [
      "d4, e4, d5, e5",
      "a1, h1, a8, h8",
      "All sixteen central squares",
      "Only e4 and d5"
    ],
    "correct": 0
  },
  {
    "question": "Standard checkmate also wins King of the Hill, right?",
    "choices": [
      "Yes, both win conditions apply",
      "No, only the hill-rule wins",
      "Only by stalemate",
      "Only by repetition"
    ],
    "correct": 0
  },
  {
    "question": "Pawn structure must center play because",
    "choices": [
      "Defending the center denies the king's path",
      "Pawns become queens automatically",
      "Pawns capture sideways",
      "Pawns are removed early"
    ],
    "correct": 0
  },
  {
    "question": "Rapid king-marches typically begin once",
    "choices": [
      "Pieces have been traded down",
      "On move one",
      "After castling kingside only",
      "Never—the king must hide"
    ],
    "correct": 0
  },
  {
    "question": "If a king walking toward d5 is checked, the player must",
    "choices": [
      "Get out of check normally",
      "Ignore the check",
      "Capture the checker free",
      "Roll dice to escape"
    ],
    "correct": 0
  },
  {
    "question": "Standard castling is",
    "choices": [
      "Allowed with usual restrictions",
      "Forbidden",
      "King-side only",
      "Queen-side only"
    ],
    "correct": 0
  },
  {
    "question": "Most common opening intent is to",
    "choices": [
      "Build a strong central pawn structure",
      "Push h-pawn early",
      "Sacrifice the queen",
      "Trade all rooks"
    ],
    "correct": 0
  },
  {
    "question": "If both kings reach the hill on the same move",
    "choices": [
      "The player whose move it was wins",
      "It is a draw",
      "The higher-rated player wins",
      "Game continues"
    ],
    "correct": 0
  },
  {
    "question": "King of the Hill is supported on",
    "choices": [
      "Lichess and other variant servers",
      "FIDE rated tournaments",
      "Only physical sets",
      "Only correspondence"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: KingOfHillChessSettings): KingOfHillChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KingOfHillChessState, action: KingOfHillChessAction): KingOfHillChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KingOfHillChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
