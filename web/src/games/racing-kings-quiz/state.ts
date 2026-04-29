import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RacingKingsQuizSettings { questions: "10"; }
export interface RacingKingsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RacingKingsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The objective is to", choices: ["Be the first to move your king to rank 8", "Checkmate", "Capture queen", "Three checks"], correct: 0 },
  { question: "Check is", choices: ["Forbidden — moves giving check are illegal", "Mandatory", "Allowed", "Three needed to win"], correct: 0 },
  { question: "Both kings start on", choices: ["Rank 1, both colors", "Opposite ranks", "Same square", "The center"], correct: 0 },
  { question: "Pawns in Racing Kings", choices: ["Are not on the board", "Are at rank 2 only", "Are doubled", "Promote instantly"], correct: 0 },
  { question: "Pieces are placed on", choices: ["Ranks 1 and 2 of one side", "All ranks", "Center", "Random squares"], correct: 0 },
  { question: "When white reaches rank 8", choices: ["Black gets one move to also reach rank 8 for a draw", "Game ends immediately", "Black wins", "Three checks needed"], correct: 0 },
  { question: "Castling is", choices: ["Forbidden", "Required", "Standard", "Only queen-side"], correct: 0 },
  { question: "A draw is possible", choices: ["When both kings reach rank 8 simultaneously", "Never", "Always", "Only by stalemate"], correct: 0 },
  { question: "The variant emphasizes", choices: ["King mobility and piece-cleared paths", "Pawn race", "Drop tactics", "Three-check ladders"], correct: 0 },
  { question: "Racing Kings is supported on", choices: ["Lichess", "FIDE OTB", "Olympic Chess", "All standard tournaments"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: RacingKingsQuizSettings): RacingKingsQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RacingKingsQuizState, action: RacingKingsQuizAction): RacingKingsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RacingKingsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
