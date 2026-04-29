import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OmwesoBoardSettings { questions: "10"; }
export interface OmwesoBoardState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OmwesoBoardAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Omweso is a traditional game from?', choices: ['Uganda', 'Egypt', 'Ghana', 'Senegal'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Omweso board layout is?', choices: ['4 rows × 8 pits (32 pits)', '2 rows × 6 pits', '3 rows × 9 pits', '1 row × 14 pits'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of seeds in Omweso is?', choices: ['64 seeds total (4 per pit)', '48', '12', '120'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each player controls how many rows?', choices: ['Two adjacent rows', 'One row', 'Four rows', 'All rows'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Omweso sows seeds in which direction?', choices: ['Counterclockwise', 'Clockwise', 'Random direction', 'Chosen each turn'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "'Relay' sowing means?", choices: ['Last seed in occupied pit; pick up all and continue', 'End turn immediately', 'Trade rows', 'Score double'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Captures typically occur when?', choices: ["Last seed lands in player's own row's pit with conditions met", "Any seed lands in opponent's pit", 'Random chance', 'Time runs out'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Omweso is part of which game family?', choices: ['Mancala', 'Chess', 'Dice race', 'Trick-taking'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Omweso uses what as game pieces?', choices: ['Seeds or stones', 'Cards', 'Dice', 'Tokens'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Omweso is best classified as?', choices: ['A mancala-family abstract strategy game', 'A war game', 'A solitaire', 'A roll-and-write'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: OmwesoBoardSettings): OmwesoBoardState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OmwesoBoardState, action: OmwesoBoardAction): OmwesoBoardState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OmwesoBoardState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
