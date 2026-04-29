import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ZertzAbsSettings { questions: "10"; }
export interface ZertzAbsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ZertzAbsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'ZÈRTZ was designed by?', choices: ['Kris Burm', 'Reiner Knizia', 'Klaus Teuber', 'Mirko Marchesi'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'ZÈRTZ is part of which project?', choices: ['GIPF Project', 'Mensa', 'Spiel des Jahres', 'Mind Sports'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Marbles in ZÈRTZ come in how many colors?', choices: ['Three (white, gray, black)', 'Two', 'Four', 'Five'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Starting board is?', choices: ['37 white rings in a hexagonal layout', 'An 8×8 grid', 'A 5×5 grid', 'A circle'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'On their turn a player must?', choices: ['Place a marble then remove an empty edge ring', 'Roll a die', 'Draw a card', 'Bid'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Capturing happens when?', choices: ['A marble can jump over another into an empty ring', 'Two same-color marbles meet', 'A ring is removed', 'A turn ends'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Captures in ZÈRTZ are?', choices: ['Forced (mandatory)', 'Optional always', 'Only allowed once per turn', 'Banned'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Goal is to collect a target?', choices: ['Combination of marbles by color', 'Number of rings', 'Pattern on the board', 'Trump suit'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'ZÈRTZ is best classified as?', choices: ['An abstract strategy game', 'A trick-taking game', 'A solitaire', 'A roll-and-write'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Captured marbles go to?', choices: ["The capturer's personal pool", 'The board edge', 'The discard', 'The opponent'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ZertzAbsSettings): ZertzAbsState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ZertzAbsState, action: ZertzAbsAction): ZertzAbsState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ZertzAbsState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
