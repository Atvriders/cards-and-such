import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GipfAbsSettings { questions: "10"; }
export interface GipfAbsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GipfAbsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'GIPF was designed by?', choices: ['Kris Burm', 'Reiner Knizia', 'Klaus Teuber', 'Mirko Marchesi'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'GIPF is the first game in which series?', choices: ['GIPF Project', 'Spiel des Jahres', 'Mensa Select', 'Mind Sports'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'GIPF board is?', choices: ['Hexagonal', 'Square 8×8', 'Round', 'Triangular'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each player has how many pieces total?', choices: ['Eighteen pieces', 'Twelve pieces', 'Twenty-four pieces', 'Six pieces'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "How many of each player's pieces are 'GIPF' pieces?", choices: ['Three GIPF pieces', 'One GIPF piece', 'Five GIPF pieces', 'Ten GIPF pieces'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Pieces are pushed onto the board from?', choices: ['The board edge', 'The center', 'Random positions', 'Diagonal corners'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'A line of how many same-color pieces is captured?', choices: ['Four in a row', 'Three in a row', 'Five in a row', 'Two in a row'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Captured GIPF pieces count for?', choices: ['Double points (two pieces)', 'Same as ordinary', 'No points', 'Three points'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Game ends when?', choices: ["One player's reserve runs out", 'Someone scores 100', 'After 30 turns', 'Board fills'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'GIPF is best classified as?', choices: ['An abstract strategy game', 'A trick-taking game', 'A solitaire', 'A roll-and-write'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: GipfAbsSettings): GipfAbsState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GipfAbsState, action: GipfAbsAction): GipfAbsState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GipfAbsState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
