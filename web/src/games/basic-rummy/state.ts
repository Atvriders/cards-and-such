import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BasicRummySettings { questions: "10"; }
export interface BasicRummyState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BasicRummyAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'In Basic Rummy you form?', choices: ['Sets and runs to meld and go out', 'Trumps and trick-takes', 'Solitaire piles', 'Bridge contracts'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "A 'set' in Rummy is?", choices: ['Three or more cards of the same rank', 'Three cards in sequence and same suit', 'Any two cards', 'All four suits represented'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "A 'run' in Rummy is?", choices: ['Three or more consecutive cards of the same suit', 'Three of a kind', 'Any three cards', 'All four suits'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players draw cards from?', choices: ['The stock or the discard pile', 'Always from stock only', 'Only from opponents', 'Random'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'After drawing, players must?', choices: ['Discard one card to end their turn', 'Pass without discarding', 'Score 100', 'Trade hands'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of players in Basic Rummy is?', choices: ['2-6 players', 'Exactly four', 'Solo only', 'Always twelve'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Cards dealt per player typically?', choices: ['7-10 depending on player count', 'Always 13', 'Always 5', 'Always 3'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Goal of Basic Rummy is to?', choices: ['Be the first to meld all your cards', 'Score 21 points', 'Capture pieces', 'Win the most tricks'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Standard deck used is?', choices: ['52-card deck', 'Tarot 78-card', '32-card piquet', 'Bridge double deck'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Rummy is part of which game family?', choices: ['The rummy family (largest card-game family)', 'Trick-taking only', 'Solitaire', 'Casino dice'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: BasicRummySettings): BasicRummyState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BasicRummyState, action: BasicRummyAction): BasicRummyState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BasicRummyState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
