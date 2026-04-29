import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StraightGinSettings { questions: "10"; }
export interface StraightGinState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StraightGinAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'In Straight Gin you may go out only by?', choices: ['Going gin (zero deadwood)', 'Knocking at any deadwood', 'Reaching 100 points', 'Auctioning'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Knocking at deadwood > 0 is?', choices: ['Not allowed in Straight Gin', 'Allowed at any value', 'Allowed only at 10', 'The standard play'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Straight Gin is a variant of?', choices: ['Gin Rummy', 'Bridge', 'Whist', 'Pinochle'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players are dealt?', choices: ['Ten cards each', 'Seven cards each', 'Thirteen cards each', 'Five cards each'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of players is?', choices: ['Two players', 'Four players', 'Three players', 'Six players'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Straight Gin tends to make hands?', choices: ['Longer and more deliberate', 'Always shorter', 'Random in length', 'Identical to standard'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'To win, your hand must form?', choices: ['Three sets/runs covering all 10 cards', 'Any combination of pairs', 'Only flushes', 'Only straights'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Straight Gin is best described as?', choices: ['A purist Gin Rummy variant', 'A trick-taking game', 'A solitaire', 'A bluffing game'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Standard deck used is?', choices: ['52-card deck', '32-card piquet', 'Tarot 78-card', 'Two decks'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Straight Gin demands?', choices: ['Patience and full melding', 'Speed and bluffing', 'Trump-suit choice', 'Bidding'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: StraightGinSettings): StraightGinState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StraightGinState, action: StraightGinAction): StraightGinState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StraightGinState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
