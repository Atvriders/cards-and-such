import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OklahomaGinSettings { questions: "10"; }
export interface OklahomaGinState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OklahomaGinAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Oklahoma Gin's distinctive rule is?", choices: ['Upcard sets the maximum knock count', 'Always knock at 10', 'No knocking allowed', 'Wild jokers'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'If the upcard is an Ace it typically?', choices: ['Forces a gin (zero deadwood) to knock', 'Doubles the score only', 'Allows knock at any value', 'Has no effect'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'If the upcard is a Spade?', choices: ["The hand's score is doubled", 'Game ends immediately', 'Players pass cards', 'Trump is reset'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players in Oklahoma Gin are dealt?', choices: ['Ten cards each', 'Seven cards each', 'Thirteen cards each', 'Five cards each'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Oklahoma Gin is a variant of?', choices: ['Gin Rummy', 'Bridge', 'Whist', 'Pinochle'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of players is?', choices: ['Two players', 'Four players', 'Three players', 'Six players'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'To knock you must have deadwood?', choices: ["At or below the upcard's limit", 'Always at zero', 'At or below 10 always', 'At or below 20'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Standard deck used is?', choices: ['52-card deck', '32-card piquet', 'Tarot 78-card', 'Two decks'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Oklahoma Gin emphasizes?', choices: ["Adapting strategy to each hand's knock limit", 'Speed only', 'Bluffing', 'Memorization'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Oklahoma Gin is sometimes called?', choices: ["Hollywood Gin's cousin", "Texas Hold'em Lite", 'Spades Plus', 'Whist Junior'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: OklahomaGinSettings): OklahomaGinState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OklahomaGinState, action: OklahomaGinAction): OklahomaGinState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OklahomaGinState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
