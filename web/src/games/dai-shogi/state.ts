import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DaiShogiSettings { questions: "10"; }
export interface DaiShogiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DaiShogiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Dai Shogi is played on a", choices: ["15×15 board", "9×9 board", "8×8 board", "5×5 board"], correct: 0 },
  { question: "Approximate piece-type count", choices: ["65+ types", "10 types", "6 types", "100 types"], correct: 0 },
  { question: "Historic period", choices: ["Heian/medieval Japan", "Edwardian England", "Modern Brazil", "Ancient Greece"], correct: 0 },
  { question: "A signature unique piece is the", choices: ["Drunk Elephant (suizo)", "Cannon", "Wizard", "Camel"], correct: 0 },
  { question: "Drop rule in Dai Shogi", choices: ["Pieces are NOT dropped (no rensa drops)", "Same as standard shogi", "Drops on first rank only", "Mandatory drops"], correct: 0 },
  { question: "Promotion zone is", choices: ["The far side ranks of the board", "Entire board", "First rank only", "No promotion"], correct: 0 },
  { question: "Game length tends to be", choices: ["Many hours", "Five minutes", "Bullet only", "Three moves"], correct: 0 },
  { question: "Modern popularity", choices: ["Niche enthusiasts and historians", "World championships every year", "Largest shogi tournament", "Mandatory in Japan"], correct: 0 },
  { question: "Compared to standard shogi, Dai is", choices: ["Larger and more complex", "Tiny and simple", "Identical", "Smaller"], correct: 0 },
  { question: "A general called the suzaku is the", choices: ["Phoenix-style fairy piece", "Pawn", "King", "Queen-equivalent"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DaiShogiSettings): DaiShogiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DaiShogiState, action: DaiShogiAction): DaiShogiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DaiShogiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
