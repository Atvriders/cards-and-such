import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface YutNoriSettings { questions: "10"; }
export interface YutNoriState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type YutNoriAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Yut Nori is most strongly associated with?", choices: ["Korean Lunar New Year", "Chuseok", "Children's Day", "Buddha's birthday"], correct: 0 },
  { question: "Yut Nori uses how many sticks?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "Each stick has?", choices: ["Two flat sides", "One flat and one curved side", "Three sides", "Random faces"], correct: 1 },
  { question: "The five throw outcomes are Do, Gae, Geol, Yut, and?", choices: ["Mo", "Si", "Pa", "Du"], correct: 0 },
  { question: "A 'Yut' (4 flats) lets the team move?", choices: ["1 space", "3 spaces", "4 spaces", "5 spaces"], correct: 2 },
  { question: "A 'Mo' (all curved) lets the team move?", choices: ["3 spaces", "4 spaces", "5 spaces", "6 spaces"], correct: 2 },
  { question: "A 'Do' is named after which animal in folklore?", choices: ["Pig", "Dog", "Tiger", "Horse"], correct: 0 },
  { question: "Capturing an opponent's piece grants?", choices: ["A free extra throw", "Skip a turn", "Score points only", "No bonus"], correct: 0 },
  { question: "The Yut Nori track is shaped like a?", choices: ["Spiral", "Cross/circle", "Straight line", "Hexagon"], correct: 1 },
  { question: "Yut Nori is played in?", choices: ["Solo only", "Teams or individuals", "Pairs only", "Trios only"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: YutNoriSettings): YutNoriState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: YutNoriState, action: YutNoriAction): YutNoriState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: YutNoriState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
