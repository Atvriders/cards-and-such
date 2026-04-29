import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SkunkBingoDiceSettings { questions: "10"; }
export interface SkunkBingoDiceState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SkunkBingoDiceAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Skunk is most often used as a?', choices: ['Classroom probability lesson', 'Casino game', 'Trick-taking exercise', 'Bridge prep'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each round has players try to score in column?', choices: ['S, K, U, N, or K', '1, 2, 3, 4, or 5', 'A, B, C, D, or E', 'Spring, Summer, Fall, Winter'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of dice rolled is?', choices: ['Two dice', 'One die', 'Five dice', 'Six dice'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'If a single 1 appears the round?', choices: ["Loses that round's accumulated points", "Doubles the round's score", 'Awards a bonus', 'Locks the column'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'If both dice show 1 (snake eyes)?', choices: ['You wipe that column AND all earlier ones', 'You score 100 points', 'You re-roll', 'You skip a turn'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Skunk is a member of which family?', choices: ['Push-your-luck dice games', 'Trick-taking', 'Solitaire', 'Card-shedding'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players each turn choose to?', choices: ['Bank the points or continue rolling', 'Bid trump', 'Discard a card', 'Buy a property'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Goal of Skunk is to?', choices: ['Have the highest total after all five letters', 'Score exactly 50', 'Spell SKUNK first', 'Take the most tricks'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Skunk is suitable for?', choices: ['Multiple players including children', 'Solo only', 'Always exactly two', 'Casino dealers only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Skunk teaches?', choices: ['Probability and risk-decision tradeoffs', 'Memorizing cards', 'Bluffing', 'Bidding contracts'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SkunkBingoDiceSettings): SkunkBingoDiceState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SkunkBingoDiceState, action: SkunkBingoDiceAction): SkunkBingoDiceState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SkunkBingoDiceState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
