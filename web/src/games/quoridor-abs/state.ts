import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface QuoridorAbsSettings { questions: "10"; }
export interface QuoridorAbsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type QuoridorAbsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Quoridor's board is?", choices: ['A 9×9 grid', 'An 8×8 grid', 'A 13×13 grid', 'A 5×5 grid'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'On each turn a player either?', choices: ['Moves the pawn one square or places a wall', 'Rolls a die', 'Draws a card', 'Bids for trump'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Walls in Quoridor span?', choices: ['Two squares', 'One square', 'Three squares', 'Five squares'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Wall placement may not?', choices: ["Completely block any opponent's path to their goal", 'Touch the edge', 'Cross the center', 'Be diagonal'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Two-player Quoridor gives each player how many walls?', choices: ['Ten walls', 'Twenty walls', 'Five walls', 'One wall'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Quoridor was designed by?', choices: ['Mirko Marchesi', 'Reiner Knizia', 'Klaus Teuber', 'Wolfgang Kramer'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Quoridor was published by?', choices: ['Gigamic', 'Hasbro', 'Mattel', 'Ravensburger'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Goal is to be the first to?', choices: ['Reach the row opposite your starting row', 'Capture all opponent walls', 'Score 100 points', 'Wall in opponents'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'If two pawns meet face-to-face, you may?', choices: ['Jump over the opposing pawn', 'Force a reset', 'Trade walls', 'Pass'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Quoridor has won what award?', choices: ['Mensa Select Award', 'Spiel des Jahres', 'GenCon Diamond', 'Origins Hall of Fame'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: QuoridorAbsSettings): QuoridorAbsState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: QuoridorAbsState, action: QuoridorAbsAction): QuoridorAbsState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: QuoridorAbsState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
