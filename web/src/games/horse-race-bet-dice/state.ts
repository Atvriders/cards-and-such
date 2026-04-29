import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HorseRaceBetDiceSettings { questions: "10"; }
export interface HorseRaceBetDiceState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HorseRaceBetDiceAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Horse Race uses how many dice?', choices: ['Two dice', 'Three dice', 'Five dice', 'One die'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Horses are numbered?', choices: ['2 through 12', '1 through 6', '1 through 12', '1 through 100'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Most likely sum (and typical longest track) is for which horse?', choices: ['7', '2', '12', '11'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Probability of rolling a 7 with two dice is?', choices: ['6/36 (1/6)', '1/36', '10/36', '11/36'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Probability of rolling a 2 (snake eyes) is?', choices: ['1/36', '1/6', '11/36', '5/36'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Probability of rolling a 12 is?', choices: ['1/36', '1/6', '11/36', '5/36'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Horse Race is mainly?', choices: ['A betting party dice game', 'A trick-taking card game', 'A solitaire', 'A heavy strategy game'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Tracks for less likely numbers are typically?', choices: ["Shorter than 7's track", "Longer than 7's track", "Equal to 7's", 'Random'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players cash in by?', choices: ['Holding bets on the winning horse', 'Reaching 100 points', 'Discarding all cards', 'Bluffing'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Sum of two dice ranges from?', choices: ['2 to 12', '1 to 6', '1 to 12', '0 to 18'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HorseRaceBetDiceSettings): HorseRaceBetDiceState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HorseRaceBetDiceState, action: HorseRaceBetDiceAction): HorseRaceBetDiceState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HorseRaceBetDiceState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
