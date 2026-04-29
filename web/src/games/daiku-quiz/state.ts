import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DaikuSettings { questions: "10"; }
export interface DaikuState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DaikuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The word 'daiku' translates to?", choices: ["Architect","Carpenter","Mason","Builder"], correct: 1 },
  { question: "The Daiku game uses pieces from which game?", choices: ["Shogi","Go (igo)","Mahjong","Hanafuda"], correct: 1 },
  { question: "Daiku is played on what surface?", choices: ["Hex board","Go board","Cross board","Mancala board"], correct: 1 },
  { question: "The objective of Daiku is to?", choices: ["Capture the king","Build structures scoring area","Reach the centre","Eliminate stones"], correct: 1 },
  { question: "The standard Go board has how many lines per side?", choices: ["13","15","17","19"], correct: 3 },
  { question: "Daiku is played by how many players?", choices: ["1","2-4","6","8"], correct: 1 },
  { question: "A completed Daiku 'structure' typically scores points based on?", choices: ["Player order","Enclosed area","Time","Random luck"], correct: 1 },
  { question: "Go stones come in which two colours?", choices: ["Red and white","Black and white","Blue and red","Green and yellow"], correct: 1 },
  { question: "A typical Daiku game lasts about how long?", choices: ["A few minutes","20-60 minutes","Half a day","Multiple days"], correct: 1 },
  { question: "The complexity of Daiku is described as?", choices: ["Light","Light to medium","Heavy","Extreme"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DaikuSettings): DaikuState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DaikuState, action: DaikuAction): DaikuState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DaikuState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
