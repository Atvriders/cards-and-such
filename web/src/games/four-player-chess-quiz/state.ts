import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FourPlayerChessQuizSettings { questions: "10"; }
export interface FourPlayerChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FourPlayerChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Four-player chess uses", choices: ["Four armies on a cross-shaped board", "Four boards", "Four pawns", "Four squares"], correct: 0 },
  { question: "The board has", choices: ["8×8 plus extensions on each side", "Standard 8×8", "12×12", "Hexagonal grid"], correct: 0 },
  { question: "Players turn order is", choices: ["Clockwise from white", "Random", "White-black-white-black", "Counterclockwise"], correct: 0 },
  { question: "FFA mode is won by", choices: ["Being the last king standing", "Most captures", "First three checks", "Highest pawn count"], correct: 0 },
  { question: "Teams mode is won by", choices: ["The team with at least one king alive after both opponents are mated", "Most points", "First mate", "Three checks"], correct: 0 },
  { question: "When you checkmate someone", choices: ["Their pieces become yours (or removed depending on rules)", "Pieces vanish", "Game ends", "Reset"], correct: 0 },
  { question: "A king in check who can't move is", choices: ["Mated and removed", "Captured", "Drawn", "Dead"], correct: 0 },
  { question: "Castling rules in 4PC are", choices: ["Adapted from standard chess for each player's back rank", "Forbidden", "Required", "Replaced by drops"], correct: 0 },
  { question: "Pawns promote on", choices: ["Their respective 8th rank or center", "Rank 4", "Capture only", "Random rank"], correct: 0 },
  { question: "The variant is hosted prominently on", choices: ["Chess.com four-player chess", "FIDE", "World correspondence", "Olympics"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: FourPlayerChessQuizSettings): FourPlayerChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FourPlayerChessQuizState, action: FourPlayerChessQuizAction): FourPlayerChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FourPlayerChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
