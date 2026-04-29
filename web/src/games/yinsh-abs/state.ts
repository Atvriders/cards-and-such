import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface YinshAbsSettings { questions: "10"; }
export interface YinshAbsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type YinshAbsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'YINSH was designed by?', choices: ['Kris Burm', 'Reiner Knizia', 'Mirko Marchesi', 'Klaus Teuber'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'YINSH is part of which project?', choices: ['GIPF Project', 'Mensa', 'Spiel des Jahres', 'Mind Sports'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each player starts with how many rings?', choices: ['Five rings', 'Three rings', 'Ten rings', 'Eight rings'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'YINSH board shape is?', choices: ['Hexagonal', 'Square 9×9', 'Triangular', 'Octagonal'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'On a turn a player must?', choices: ['Place a marker in a ring then move that ring', 'Roll dice', 'Draw a card', 'Bid for trump'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Moving a ring causes the line to?', choices: ['Flip any markers it passes', 'Capture immediately', 'Reset', 'Stay still'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Forming a row of how many same-color markers triggers removal?', choices: ['Five markers', 'Three markers', 'Four markers', 'Six markers'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'First to remove how many rings wins?', choices: ['Three rings', 'Five rings', 'Two rings', 'One ring'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'YINSH was the third game in the GIPF series; the first was?', choices: ['GIPF', 'ZÈRTZ', 'DVONN', 'TZAAR'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'YINSH is best classified as?', choices: ['An abstract strategy game', 'A trick-taking card game', 'A roll-and-write', 'A solitaire'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: YinshAbsSettings): YinshAbsState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: YinshAbsState, action: YinshAbsAction): YinshAbsState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: YinshAbsState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
