import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KnightmateQuizSettings { questions: "10"; }
export interface KnightmateQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KnightmateQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Knightmate the royal piece is", choices: ["The knight (Royal Knight)", "The king", "The queen", "The bishop"], correct: 0 },
  { question: "Players win by", choices: ["Checkmating the royal knight", "Standard mate", "Three checks", "Capture all pawns"], correct: 0 },
  { question: "The king (non-royal) on the board moves like", choices: ["A non-royal man (one square in any direction)", "A queen", "A knight", "A pawn"], correct: 0 },
  { question: "Pawns promote to", choices: ["Knights instead of queens (typical rules)", "Queens", "Bishops", "Rooks"], correct: 0 },
  { question: "Castling in Knightmate is", choices: ["Generally not present", "Required", "Standard", "Replaces promotion"], correct: 0 },
  { question: "Designer of Knightmate", choices: ["Bruce Zimov (1972)", "Bobby Fischer", "Reiner Knizia", "V. R. Parton"], correct: 0 },
  { question: "The variant emphasizes", choices: ["Coordinated piece play around a leaping royal", "Pawn race", "Drop mechanics", "Hex moves"], correct: 0 },
  { question: "Pinning the royal knight is", choices: ["A key attacking idea", "Impossible", "Forbidden", "Always a draw"], correct: 0 },
  { question: "Number of royal knights per side", choices: ["One", "Two", "Three", "Eight"], correct: 0 },
  { question: "Knightmate is classified as", choices: ["A fairy-chess variant", "Standard FIDE", "Race game", "Card variant"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: KnightmateQuizSettings): KnightmateQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KnightmateQuizState, action: KnightmateQuizAction): KnightmateQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KnightmateQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
