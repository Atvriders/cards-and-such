import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RifleChessQuizSettings { questions: "10"; }
export interface RifleChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RifleChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Rifle Chess, a capture is", choices: ["Made remotely — capturing piece stays put", "Always normal", "Forbidden", "Doubled"], correct: 0 },
  { question: "The captured piece is", choices: ["Removed from the board", "Returned to opponent's hand", "Demoted", "Captured square left empty"], correct: 0 },
  { question: "Rifle Chess is also called", choices: ["Shoot Chess", "Kill Chess", "Rifle Bullet", "Sniper Chess"], correct: 0 },
  { question: "The variant changes", choices: ["Movement of captures, but not initial placement", "Board size", "Piece values entirely", "Promotion ranks"], correct: 0 },
  { question: "A bishop ranged-attacks via", choices: ["Its diagonal (squares it controls)", "Knight L-jump", "Pawn diagonal", "King radius"], correct: 0 },
  { question: "The pawn captures by", choices: ["Shooting diagonally one square", "Standard chess capture (move-and-take)", "Knight L-jump", "Rook line"], correct: 0 },
  { question: "The king moves and captures", choices: ["Like a normal king but captures remotely", "Not at all", "Like a knight", "Like a pawn"], correct: 0 },
  { question: "Rifle Chess is classified as", choices: ["A fairy variant", "Standard FIDE", "Race game", "Card variant"], correct: 0 },
  { question: "Strategically", choices: ["Ranged attacks make defense harder", "Pawn play dominates", "Pure tactics", "Endgame favors black"], correct: 0 },
  { question: "Castling in Rifle Chess is", choices: ["Standard if king and rook unmoved", "Forbidden", "Required", "Disabled"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: RifleChessQuizSettings): RifleChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RifleChessQuizState, action: RifleChessQuizAction): RifleChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RifleChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
