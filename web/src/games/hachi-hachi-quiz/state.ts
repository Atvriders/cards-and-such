import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HachiHachiSettings { questions: "10"; }
export interface HachiHachiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HachiHachiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The name 'Hachi-Hachi' refers to which target score?", choices: ["80", "88", "100", "108"], correct: 1 },
  { question: "Hachi-Hachi is traditionally played with how many players?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "Hachi-Hachi uses what kind of deck?", choices: ["Western 52-card", "Hanafuda 48-card", "Kabufuda 40-card", "Tarot deck"], correct: 1 },
  { question: "A round of Hachi-Hachi covers how many months?", choices: ["6", "8", "10", "12"], correct: 3 },
  { question: "At deal time, how many cards are placed face up on the table?", choices: ["4", "6", "8", "12"], correct: 2 },
  { question: "How many cards does each player initially receive in Hachi-Hachi?", choices: ["5", "7", "8", "10"], correct: 2 },
  { question: "A 'Te-yaku' is a yaku scored from?", choices: ["Captured cards", "Initial hand", "Last play", "Highest discard"], correct: 1 },
  { question: "The 'Shikko' rule applies when a player has?", choices: ["Three of one suit in hand", "Four cards of one month in hand", "All hikari cards", "No tane cards"], correct: 1 },
  { question: "Which scoring element is unique to Hachi-Hachi compared to Koi-Koi?", choices: ["Continue option", "Bunmawashi base points", "Hikari yaku", "Akatan yaku"], correct: 1 },
  { question: "The number 88 is chosen because?", choices: ["8 is lucky in Japanese", "It represents flower abundance", "It is the player count squared", "It honors the gambling parlour"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HachiHachiSettings): HachiHachiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HachiHachiState, action: HachiHachiAction): HachiHachiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HachiHachiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
