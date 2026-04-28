import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface McrMahjongSettings { questions: "10"; }
export interface McrMahjongState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type McrMahjongAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "MCR stands for?", choices: ["Mahjong Common Rules", "Mahjong Competition Rules", "Mahjong Chinese Rules", "Mahjong Card Rules"], correct: 1 },
  { question: "MCR scoring uses how many elements?", choices: ["28", "48", "81", "100"], correct: 2 },
  { question: "MCR is the ruleset used at?", choices: ["Olympic Games", "World Mahjong Championship", "WTA Tour", "FIDE"], correct: 1 },
  { question: "MCR's purpose was to?", choices: ["Add gambling", "Standardize tournament Mahjong", "Speed up play", "Replace tiles"], correct: 1 },
  { question: "Big Four Winds in MCR scores?", choices: ["8 points", "18 points", "48 points", "88 points"], correct: 3 },
  { question: "MCR's minimum hand to win is usually?", choices: ["3 points", "6 points", "8 points", "10 points"], correct: 2 },
  { question: "MCR was first published around?", choices: ["1980", "1998", "2008", "2018"], correct: 1 },
  { question: "MCR strips away?", choices: ["All flower tiles", "Local-only yaku", "Winds", "Dragons"], correct: 1 },
  { question: "A MCR tournament typically uses?", choices: ["Doubles only", "Individual or team formats", "Solo only", "Pairs only"], correct: 1 },
  { question: "The 'Pung of Terminals' element scores?", choices: ["1 point", "8 points", "16 points", "88 points"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: McrMahjongSettings): McrMahjongState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: McrMahjongState, action: McrMahjongAction): McrMahjongState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: McrMahjongState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
