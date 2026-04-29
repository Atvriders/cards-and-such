import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HnefataflMiniSettings { questions: "10"; }
export interface HnefataflMiniState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HnefataflMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Hnefatafl is an asymmetric game where", choices: ["The king tries to escape; attackers try to capture him", "Both sides try to mate", "Both race to the corner", "Pawns vs queens"], correct: 0 },
  { question: "The king starts on the", choices: ["Center square (throne)", "Corner", "Side", "Rank 1"], correct: 0 },
  { question: "Captures happen by", choices: ["Surrounding a piece on two opposing sides", "Diagonal capture", "Standard chess capture", "Random"], correct: 0 },
  { question: "The king is captured by", choices: ["Surrounding on all four orthogonal sides", "Just one attacker", "Diagonal capture", "Drop-mate"], correct: 0 },
  { question: "The king escapes by", choices: ["Reaching a corner square", "Reaching center", "Three checks", "Promoting"], correct: 0 },
  { question: "Hnefatafl comes from", choices: ["Viking-era Scandinavia", "Ancient Egypt", "Medieval Japan", "Aztec Mexico"], correct: 0 },
  { question: "The defenders are", choices: ["Outnumbered (king + 12 pieces vs. 24 attackers typically)", "Equal", "Always more", "Pawn only"], correct: 0 },
  { question: "The variant is also called", choices: ["Tafl, or simply Norse Chess", "Chess", "Go", "Backgammon"], correct: 0 },
  { question: "The throne and corners are", choices: ["Hostile to all but the king", "Friendly to all", "Promoted", "Drop zones"], correct: 0 },
  { question: "Hnefatafl tactics rely on", choices: ["Spatial control and asymmetric goals", "Pure pawn play", "Race to rank 8", "Drops"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HnefataflMiniSettings): HnefataflMiniState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HnefataflMiniState, action: HnefataflMiniAction): HnefataflMiniState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HnefataflMiniState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
