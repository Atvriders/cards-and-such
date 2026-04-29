import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HexGameSettings { questions: "10"; }
export interface HexGameState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HexGameAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Hex is played on a", choices: ["Rhombus-shaped hexagonal grid", "Square 8×8", "Triangular grid", "Round board"], correct: 0 },
  { question: "Players try to connect", choices: ["Their two opposite sides with a chain of stones", "Three corners", "Center to edge", "All four sides"], correct: 0 },
  { question: "Hex was invented by", choices: ["Piet Hein (1942) and independently John Nash", "Bobby Fischer", "Reiner Knizia", "Garry Kasparov"], correct: 0 },
  { question: "A draw in Hex is", choices: ["Provably impossible", "Very common", "The most likely outcome", "Always forced"], correct: 0 },
  { question: "Standard size board is", choices: ["11×11", "8×8", "5×5", "100×100"], correct: 0 },
  { question: "First-player advantage is", choices: ["Significant; the swap rule balances it", "Nonexistent", "Reversed", "Eliminated by dice"], correct: 0 },
  { question: "The swap (pie) rule lets", choices: ["Player two take player one's first move", "Both swap stones each turn", "The board flip", "The colors reverse forever"], correct: 0 },
  { question: "Hex is part of the", choices: ["Connection-game family", "Race-game family", "Card family", "Mancala family"], correct: 0 },
  { question: "Strategy emphasizes", choices: ["Building chains while blocking opponent's chain", "Sacrificing all stones", "Memorized openings only", "Random placement"], correct: 0 },
  { question: "John Nash called it", choices: ["Nash, before being renamed Hex", "Connect", "Bridge", "Knot"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HexGameSettings): HexGameState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HexGameState, action: HexGameAction): HexGameState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HexGameState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
