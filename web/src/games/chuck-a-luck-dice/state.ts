import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChuckALuckDiceSettings { questions: "10"; }
export interface ChuckALuckDiceState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChuckALuckDiceAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Chuck-a-Luck uses how many dice?', choices: ['Three dice', 'Two dice', 'Five dice', 'One die'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Chuck-a-Luck is also called?', choices: ['Birdcage or Sweat', 'Craps', 'Dudo', "Liar's Dice"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players bet on?', choices: ['Single numbers, sum ranges, triples', 'Card hands', 'Tile patterns', 'Trump suits'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Single-number match on one die pays?', choices: ['1:1', '10:1', '100:1', '0.5:1'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Single-number match on two dice pays?', choices: ['2:1', '1:1', '10:1', '100:1'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Single-number match on all three dice pays?', choices: ['10:1 typically', '1:1', '1000:1', '100:1'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "'Big' bet covers sums of?", choices: ['11 through 17', '4 through 10', '2 through 12', 'Only 21'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "'Small' bet covers sums of?", choices: ['4 through 10', '11 through 17', '2 through 12', 'Only 7'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Chuck-a-Luck has?', choices: ['A significant house edge', 'No house edge', 'Always positive expected value', '100% return'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Chuck-a-Luck is most commonly classified as?', choices: ['A casino dice game', 'A pub trick-taking game', 'A solitaire', "A children's card game"], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ChuckALuckDiceSettings): ChuckALuckDiceState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChuckALuckDiceState, action: ChuckALuckDiceAction): ChuckALuckDiceState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChuckALuckDiceState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
