import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TwixtSettings { questions: "10"; }
export interface TwixtState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TwixtAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Twixt is played with", choices: ["Pegs and bridges on a square pegboard", "Stones on intersections", "Cards", "Dice"], correct: 0 },
  { question: "Goal is to", choices: ["Connect your two opposite sides with a chain of bridges", "Capture all opponent pegs", "Reach center", "Promote pegs"], correct: 0 },
  { question: "A bridge is formed when", choices: ["Two of your pegs are placed in a knight's-move pattern with no obstruction", "Two pegs touch directly", "Three pegs form a line", "Pegs surround opponent"], correct: 0 },
  { question: "Bridges may", choices: ["Not cross opposing bridges", "Cross any bridge", "Be removed by either player", "Capture pegs"], correct: 0 },
  { question: "Twixt was invented by", choices: ["Alex Randolph (1962)", "Reiner Knizia", "Sid Sackson", "Bobby Fischer"], correct: 0 },
  { question: "Standard board size", choices: ["24×24 with corner notches", "8×8", "Hex grid", "Round"], correct: 0 },
  { question: "The game is", choices: ["Connection-game family member", "Race-game family", "Card-trick family", "Mancala family"], correct: 0 },
  { question: "A draw is", choices: ["Theoretically very rare", "Very common", "Always the result", "Forbidden"], correct: 0 },
  { question: "Strategy emphasizes", choices: ["Multi-purpose pegs that block and connect", "Sacrificing all pegs", "Memorized openings", "Random placement"], correct: 0 },
  { question: "Twixt has been featured in", choices: ["Mensa game-of-the-year recognition", "FIDE championships", "Olympic Games", "Mahjong World Cup"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TwixtSettings): TwixtState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TwixtState, action: TwixtAction): TwixtState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TwixtState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
