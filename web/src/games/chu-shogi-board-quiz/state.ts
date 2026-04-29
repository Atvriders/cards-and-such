import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChuShogiBoardQuizSettings { questions: "10"; }
export interface ChuShogiBoardQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChuShogiBoardQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Chu Shogi is played on a", choices: ["12x12 board", "9x9 board", "8x8 board", "15x15 board"] as [string, string, string, string], correct: 0 },
  { question: "Chu Shogi includes the famous", choices: ["Lion piece", "Bishop pair", "Pawn cannon", "Knight horde"] as [string, string, string, string], correct: 0 },
  { question: "Compared to standard Shogi, Chu has", choices: ["More piece types and a larger board", "Fewer pieces", "Identical rules", "Smaller board"] as [string, string, string, string], correct: 0 },
  { question: "Captured pieces in Chu Shogi are", choices: ["Removed from play (no drops in classical Chu)", "Always dropped back", "Always promoted", "Returned to opponent"] as [string, string, string, string], correct: 0 },
  { question: "The Lion can move", choices: ["Up to two squares with a capture along the way", "Only one square", "Like a rook", "Like a king only"] as [string, string, string, string], correct: 0 },
  { question: "Chu Shogi promotion happens", choices: ["When entering or exiting the promotion zone", "After every move", "Never", "Only on capture"] as [string, string, string, string], correct: 0 },
  { question: "Chu means", choices: ["Middle (medium-sized variant)", "Small", "Tiny", "Large"] as [string, string, string, string], correct: 0 },
  { question: "Chu Shogi was historically", choices: ["One of the most-played medieval shogi variants", "A modern invention from 2020", "A children-only game", "Played only in Korea"] as [string, string, string, string], correct: 0 },
  { question: "A typical Chu Shogi match takes", choices: ["Several hours", "A few minutes", "No time", "Twenty seconds"] as [string, string, string, string], correct: 0 },
  { question: "The Chu Shogi community today is", choices: ["Small but active among shogi enthusiasts", "Larger than standard shogi", "Professional only", "Extinct"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ChuShogiBoardQuizSettings): ChuShogiBoardQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChuShogiBoardQuizState, action: ChuShogiBoardQuizAction): ChuShogiBoardQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChuShogiBoardQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
