import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RengoSettings { questions: "10"; }
export interface RengoState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RengoAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Rengo is", choices: ["Two-on-two team Go (any gender mix)", "Single-player Go", "Three-player Go", "Pair Go specifically"], correct: 0 },
  { question: "Players within a team", choices: ["Cannot speak about strategy during play", "Talk freely", "Trade stones", "Vote on moves"], correct: 0 },
  { question: "Move order is", choices: ["Strictly alternating between all four players", "Random", "Two moves per player", "All at once"], correct: 0 },
  { question: "Compared to Pair Go", choices: ["No required gender pairing in standard Rengo", "Gender pairing required", "Identical", "Smaller board"], correct: 0 },
  { question: "Rules of capture and scoring follow", choices: ["Standard Go", "Drops allowed", "Custodian capture", "No captures"], correct: 0 },
  { question: "Rengo encourages", choices: ["Reading your partner's plan", "Memorized opening trees", "Random play", "Solo dominance"], correct: 0 },
  { question: "The board is", choices: ["Standard 19×19 (sometimes 13×13)", "Always 5×5", "Hex grid", "Cross-shaped"], correct: 0 },
  { question: "Game length is", choices: ["Comparable to a normal Go game", "Five seconds", "Multi-day always", "One move"], correct: 0 },
  { question: "Rengo events are popular at", choices: ["Club and tournament level worldwide", "Olympics only", "Children's-only events", "Professional Olympics"], correct: 0 },
  { question: "A common motif is", choices: ["Maintaining shape consistent with your partner's intent", "Sacrificing your partner's stones", "Refusing to play", "Capturing your own"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: RengoSettings): RengoState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RengoState, action: RengoAction): RengoState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RengoState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
