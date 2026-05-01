import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RacingKingsQuizSettings { questions: "10"; }
export interface RacingKingsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RacingKingsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Racing Kings, the goal is to", choices: ["Be the first to get your king to the eighth rank", "Checkmate the opponent", "Capture the enemy king", "Promote a pawn"], correct: 0 },
  { question: "In the starting position both armies are placed", choices: ["On the first two ranks together (no pawns)", "On opposite sides as in standard chess", "Randomly", "Only kings on the board"], correct: 0 },
  { question: "Pawns in Racing Kings", choices: ["Are not used — there are none", "Start on rank 2 as normal", "Move backwards", "Are placed on rank 4"], correct: 0 },
  { question: "Giving check is", choices: ["Forbidden — no move may give check", "Encouraged", "Required every turn", "Worth bonus points"], correct: 0 },
  { question: "If both kings reach rank 8, the result is", choices: ["A draw (if Black reaches on the move after White)", "White always wins", "Black always wins", "Sudden-death playoff"], correct: 0 },
  { question: "Castling in Racing Kings is", choices: ["Not allowed", "Required on move 1", "Allowed both sides", "Done with the queen"], correct: 0 },
  { question: "The starting square for the white king is usually", choices: ["b1 (with the rest of the army nearby)", "e1", "a1", "h1"], correct: 0 },
  { question: "Because checks are illegal,", choices: ["Players cannot use forced check sequences to slow opponents", "Mate is impossible to detect", "All games end in draws", "Pieces freeze"], correct: 0 },
  { question: "A typical winning idea is to", choices: ["Use minor pieces to escort the king up the board", "Trade all the pieces", "Push pawns rapidly", "Castle long"], correct: 0 },
  { question: "Racing Kings is most associated with", choices: ["Lichess and online variant play", "FIDE classical events", "Correspondence chess only", "Hexagonal boards"], correct: 0 },
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
