import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FourPlayerChessTeamSettings { questions: "10"; }
export interface FourPlayerChessTeamState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FourPlayerChessTeamAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Number of teams in Four-Player Chess (Teams)?",
    "choices": [
      "Two teams of two",
      "Four solo players",
      "Three teams of one and a duo",
      "One team of four"
    ],
    "correct": 0
  },
  {
    "question": "Board layout is",
    "choices": [
      "8x8 with extensions on each side",
      "Standard 8x8 only",
      "10x10 plain",
      "Hexagonal"
    ],
    "correct": 0
  },
  {
    "question": "Each team is allied as",
    "choices": [
      "Two opposing colors of the rectangular layout",
      "Three of four players",
      "Random opponents each round",
      "Solo players"
    ],
    "correct": 0
  },
  {
    "question": "Sharing pieces with partner is",
    "choices": [
      "Forbidden — only legal moves with own pieces",
      "Allowed any move",
      "Allowed for pawns only",
      "Allowed once per game"
    ],
    "correct": 0
  },
  {
    "question": "Winning condition?",
    "choices": [
      "Both opposing kings checkmated or eliminated",
      "First check given",
      "Move into central square",
      "Promote three pawns"
    ],
    "correct": 0
  },
  {
    "question": "When your partner is checkmated, you",
    "choices": [
      "Continue alone against both opponents",
      "Lose immediately",
      "Resign automatically",
      "Pass moves"
    ],
    "correct": 0
  },
  {
    "question": "Move order goes around the board",
    "choices": [
      "Clockwise",
      "Counter-clockwise alternating",
      "Random each turn",
      "Both teams move simultaneously"
    ],
    "correct": 0
  },
  {
    "question": "Pieces' moves follow",
    "choices": [
      "Standard chess movement rules",
      "Hex chess rules",
      "Shogi rules",
      "Random fairy rules"
    ],
    "correct": 0
  },
  {
    "question": "Best strategic principle for a team?",
    "choices": [
      "Coordinate central control with partner",
      "Always attack the partner's enemy first",
      "Trade all queens",
      "Promote pawns immediately"
    ],
    "correct": 0
  },
  {
    "question": "This variant is popular on",
    "choices": [
      "chess.com four-player tab",
      "FIDE rated events",
      "Backgammon Galaxy",
      "Yucata Go"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: FourPlayerChessTeamSettings): FourPlayerChessTeamState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FourPlayerChessTeamState, action: FourPlayerChessTeamAction): FourPlayerChessTeamState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FourPlayerChessTeamState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
