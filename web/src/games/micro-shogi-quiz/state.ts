import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MicroShogiQuizSettings { questions: "10"; }
export interface MicroShogiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MicroShogiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Micro Shogi is played on a", choices: ["4×5 board", "5×5 board", "9×9 board", "Hex"], correct: 0 },
  { question: "After every move, the piece", choices: ["Promotes (or demotes)", "Stays the same", "Captures", "Drops"], correct: 0 },
  { question: "Each side has", choices: ["Four pieces", "Eight", "Twelve", "One"], correct: 0 },
  { question: "Drops follow", choices: ["Standard Shogi drops", "No drops", "Required", "Reset"], correct: 0 },
  { question: "The flip rule makes the variant", choices: ["Highly tactical due to constant identity changes", "Slow", "Random", "Drop-heavy"], correct: 0 },
  { question: "Designer of Micro Shogi", choices: ["Toyota Genryu", "Bobby Fischer", "V. R. Parton", "Reiner Knizia"], correct: 0 },
  { question: "Pawn drops follow", choices: ["Standard nifu rule", "Are forbidden", "Reset", "Free placement"], correct: 0 },
  { question: "The board has", choices: ["20 squares", "25 squares", "81 squares", "One square"], correct: 0 },
  { question: "Promotion happens", choices: ["Every move automatically", "Only on capture", "On rank 4", "Never"], correct: 0 },
  { question: "Micro Shogi is classified as a", choices: ["Ultra-mini Shogi fairy variant", "Standard FIDE", "Race game", "Card variant"], correct: 0 },

  { question: "Micro Shogi is also nicknamed", choices: ["\"Poppy Shogi\" (Yari Shogi family)", "Bullet Shogi", "Reverse Shogi", "Hex Shogi"], correct: 0 },
  { question: "Each side starts with", choices: ["Four pieces (King, Pawn, Bishop or Silver, Rook or Gold)", "Twenty pieces", "Two kings", "Pawns only"], correct: 0 },
  { question: "Movement causes", choices: ["Automatic flip to the paired piece", "No change", "Capture", "Drop"], correct: 0 },
  { question: "Captured pieces drop", choices: ["As one of the two paired forms", "Always promoted", "Always demoted", "Off-board"], correct: 0 },
  { question: "Compared to Kyoto Shogi, Micro is", choices: ["Even smaller and faster", "Larger", "Slower", "Identical"], correct: 0 },
  { question: "Promotion happens", choices: ["Every move automatically (flip)", "On rank 4", "Never", "On capture only"], correct: 0 },
  { question: "Mating with a dropped pawn follows", choices: ["Uchifuzume restriction", "No restriction", "Always allowed", "Required"], correct: 0 },
  { question: "The variant illustrates", choices: ["Maximum flip-paired tactical density", "Slow strategy", "Pure luck", "Card play"], correct: 0 },
  { question: "Micro Shogi is classified as", choices: ["Ultra-mini fairy Shogi", "Standard FIDE", "Race game", "Card variant"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MicroShogiQuizSettings): MicroShogiQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MicroShogiQuizState, action: MicroShogiQuizAction): MicroShogiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MicroShogiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
