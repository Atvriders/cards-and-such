import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ShipCaptainCrewFoolSettings { questions: "10"; }
export interface ShipCaptainCrewFoolState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ShipCaptainCrewFoolAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'In Ship Captain Crew Mate you must set aside?', choices: ['A 6, then a 5, then a 4 in that order', 'Any three matching dice', 'All sixes', 'Three pairs'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The 6 represents the?', choices: ['Ship', 'Crew', 'Captain', 'Mate'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The 5 represents the?', choices: ['Captain', 'Ship', 'Mate', 'Cargo'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The 4 represents the?', choices: ['Crew', 'Captain', 'Ship', 'Cargo'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of dice used is?', choices: ['Five dice', 'Three dice', 'Six dice', 'One die'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of rolls allowed per turn is?', choices: ['Three rolls', 'One roll', 'Five rolls', 'Ten rolls'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Score is the sum of?', choices: ['The two non-Ship/Captain/Crew dice (Mate and Cargo)', 'All five dice', 'Just the highest die', 'Always 21'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Ship Captain Crew Mate is best classified as?', choices: ['A push-your-luck dice game', 'A trick-taking card game', 'A solitaire', 'A bluffing game'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Common alternative name is?', choices: ['Ship of Fools', 'Skat-Mate', 'Roll Royal', 'Yacht-Yacht'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'If you fail to roll the 6-5-4 sequence in three rolls?', choices: ['You score zero for the turn', 'You roll five more times', 'You go bankrupt', 'You force re-deal'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ShipCaptainCrewFoolSettings): ShipCaptainCrewFoolState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ShipCaptainCrewFoolState, action: ShipCaptainCrewFoolAction): ShipCaptainCrewFoolState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ShipCaptainCrewFoolState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
