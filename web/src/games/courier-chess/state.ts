import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CourierChessSettings { questions: "10"; }
export interface CourierChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CourierChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Courier Chess is played on a", choices: ["12×8 board", "8×8 board", "10×10 board", "Hex grid"], correct: 0 },
  { question: "The courier moves like a", choices: ["Modern bishop (any diagonal distance)", "Knight", "Rook", "Pawn"], correct: 0 },
  { question: "Period when popular", choices: ["12th–17th century Europe", "21st century", "Ancient Rome", "Bronze Age"], correct: 0 },
  { question: "Pieces unique to Courier include", choices: ["Courier, Schleich (sage), Mann (man)", "Cannon and elephant", "Wizard and champion", "Hawk and eagle"], correct: 0 },
  { question: "Number of pawns per side", choices: ["12 (one per file)", "8", "16", "4"], correct: 0 },
  { question: "The fers (queen) moves", choices: ["One square diagonally only (medieval style)", "Like a modern queen", "Like a knight", "Like a rook"], correct: 0 },
  { question: "Region of origin", choices: ["Germany and the Low Countries", "China", "India", "Japan"], correct: 0 },
  { question: "Castling in Courier Chess is", choices: ["Not part of the original rules", "Mandatory", "Replaced by drop", "Done with all rooks at once"], correct: 0 },
  { question: "Famous depiction is in the", choices: ["Painting 'The Courier Game' by Lucas van Leyden", "Mona Lisa", "Pyramid hieroglyphs", "Aztec codices"], correct: 0 },
  { question: "Courier Chess foreshadowed", choices: ["Bishop's full diagonal range in modern chess", "The cannon piece", "Pawn promotion", "Castling"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CourierChessSettings): CourierChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CourierChessState, action: CourierChessAction): CourierChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CourierChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
