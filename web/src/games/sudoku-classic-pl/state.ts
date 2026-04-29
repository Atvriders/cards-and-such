import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SudokuClassicPlSettings { questions: "10"; }
export interface SudokuClassicPlState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SudokuClassicPlAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Sudoku's grid is?", choices: ['9×9 (with nine 3×3 boxes)', '8×8', '10×10', '5×5'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each row must contain?', choices: ['Digits 1-9, each exactly once', 'Random digits', 'Only odd digits', 'Only even digits'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each column must contain?', choices: ['Digits 1-9, each exactly once', 'Any digits with repeats', 'Only the digit 5', 'No digits'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each 3×3 box must contain?', choices: ['Digits 1-9, each exactly once', 'Random digits', 'Only odd digits', 'Only the digit 5'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'A well-formed Sudoku has?', choices: ['Exactly one solution', 'Multiple valid solutions', 'No solution always', 'Infinite solutions'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Sudoku was popularized worldwide by?', choices: ['Wayne Gould (in The Times)', 'Reiner Knizia', 'Will Shortz', 'Garry Kasparov'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Sudoku's modern boom dates to?", choices: ['Mid-2000s', '1900s', '1950s', '2020s'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Sudoku originated as a puzzle now called?', choices: ['Number Place (or Su Doku in Japan)', 'Crossword', 'Word Search', 'Anagram'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Sudoku's name in Japanese roughly means?", choices: ["'Single Number' (sūji wa dokushin ni kagiru)", "'Snake Path'", "'Magic Square'", "'Number Race'"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Sudoku is best classified as?', choices: ['A logic / number-placement puzzle', 'A solitaire card game', 'A dice game', 'A trick-taking game'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SudokuClassicPlSettings): SudokuClassicPlState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SudokuClassicPlState, action: SudokuClassicPlAction): SudokuClassicPlState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SudokuClassicPlState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
