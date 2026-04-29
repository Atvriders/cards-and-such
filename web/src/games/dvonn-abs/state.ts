import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DvonnAbsSettings { questions: "10"; }
export interface DvonnAbsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DvonnAbsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'DVONN was designed by?', choices: ['Kris Burm', 'Reiner Knizia', 'Mirko Marchesi', 'Klaus Teuber'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'DVONN board has how many spaces?', choices: ['49 hexagonal spaces', '64 squares', '81 hexagons', '100 spaces'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Number of red 'DVONN' pieces is?", choices: ['Three', 'One', 'Five', 'Seven'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each player places how many colored pieces?', choices: ['23', '10', '30', '15'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'A stack moves a number of squares equal to?', choices: ['Its height (number of pieces)', 'Always one square', 'A die roll', 'Its color count'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Stacks not connected to a DVONN piece (directly or chained) are?', choices: ['Removed from the board', 'Doubled in score', 'Worth two points', 'Captured by opponent'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Game ends when?', choices: ['Neither player can move', 'All pieces are placed', 'Someone reaches 100', 'After 30 turns'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Winner is determined by?', choices: ['Whose color is on top of the most stacks (by total piece count)', 'Highest single stack', 'Most DVONN pieces', 'First to capture'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'DVONN is part of which project?', choices: ['GIPF Project', 'Mensa', 'Mind Sports', 'Spiel des Jahres'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'DVONN is best classified as?', choices: ['A stacking abstract strategy game', 'A trick-taking game', 'A solitaire', 'A racing game'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DvonnAbsSettings): DvonnAbsState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DvonnAbsState, action: DvonnAbsAction): DvonnAbsState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DvonnAbsState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
