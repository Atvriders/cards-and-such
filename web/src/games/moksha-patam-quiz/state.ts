import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MokshaPatamSettings { questions: "10"; }
export interface MokshaPatamState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MokshaPatamAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Moksha Patam evolved into which Western game?", choices: ["Monopoly","Snakes and Ladders","Risk","Sorry"], correct: 1 },
  { question: "The game's snakes represent?", choices: ["Wisdom","Vices and bad karma","Health","Wealth"], correct: 1 },
  { question: "The ladders in Moksha Patam represent?", choices: ["Vices","Virtues / good karma","Suits","Players"], correct: 1 },
  { question: "Moksha Patam originates from?", choices: ["China","India","Japan","Egypt"], correct: 1 },
  { question: "The aim is to reach?", choices: ["The starting square","Moksha (liberation)","A jail","A capital"], correct: 1 },
  { question: "Movement in Moksha Patam is decided by?", choices: ["Cards","Dice or cowries","Voting","Player choice"], correct: 1 },
  { question: "Moksha Patam dates from at least which century?", choices: ["19th","16th","13th","2nd CE / earlier"], correct: 3 },
  { question: "The game is played by how many players?", choices: ["1","2-6","Always 4","8+"], correct: 1 },
  { question: "The number of squares in classical Moksha Patam is around?", choices: ["64","100","144","200"], correct: 1 },
  { question: "Moksha is a concept from which religion?", choices: ["Buddhism only","Hinduism / Indian religions","Shinto","Sufism"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MokshaPatamSettings): MokshaPatamState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MokshaPatamState, action: MokshaPatamAction): MokshaPatamState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MokshaPatamState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
