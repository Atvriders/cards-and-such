import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OneColorGoSettings { questions: "10"; }
export interface OneColorGoState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OneColorGoAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "One Color Go uses", choices: ["Stones of a single color for both players", "Two colors as standard", "Three colors", "Numbered stones"], correct: 0 },
  { question: "Players must remember", choices: ["Which stones are theirs versus opponent's", "Nothing — same as standard", "Move count only", "Liberties only"], correct: 0 },
  { question: "Captures still occur by", choices: ["Standard liberty rules", "No captures", "Only with announcement", "Diagonal capture"], correct: 0 },
  { question: "This variant trains", choices: ["Visualization and memory", "Memorized openings", "Random play", "Speed only"], correct: 0 },
  { question: "A referee may", choices: ["Track ownership in case of dispute", "Play moves for you", "Set time limits only", "Be absent always"], correct: 0 },
  { question: "Game ends when", choices: ["Both players pass", "First capture", "After 100 moves", "Random"], correct: 0 },
  { question: "One Color Go is popular as", choices: ["A training exercise for strong players", "A children's first game", "A bullet format", "A solitaire"], correct: 0 },
  { question: "Score is calculated", choices: ["After ownership is reconstructed", "Immediately", "Never", "By coin flip"], correct: 0 },
  { question: "Compared with standard Go, this is", choices: ["Significantly harder mentally", "Easier", "Identical", "Faster"], correct: 0 },
  { question: "Best skill", choices: ["Strong board visualization and recall", "Memorized opening trees", "Fast clicking", "Random moves"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: OneColorGoSettings): OneColorGoState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OneColorGoState, action: OneColorGoAction): OneColorGoState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OneColorGoState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
