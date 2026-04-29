import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ToriShogiSettings { questions: "10"; }
export interface ToriShogiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ToriShogiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tori Shogi is played on a", choices: ["7×7 board", "9×9 board", "5×5 board", "12×12 board"], correct: 0 },
  { question: "Theme of the pieces", choices: ["Birds", "Mythical beasts", "Zodiac animals", "Royal court"], correct: 0 },
  { question: "The most powerful piece is the", choices: ["Phoenix (hou-o)", "Sparrow", "Pheasant", "Quail"], correct: 0 },
  { question: "Drops are", choices: ["Allowed (shogi-style hand)", "Forbidden", "Limited to first rank", "Mandatory"], correct: 0 },
  { question: "The royal piece is the", choices: ["Phoenix", "Crane", "Pawn-bird", "Eagle"], correct: 0 },
  { question: "Designed/published in", choices: ["18th-century Japan", "Ancient China", "Modern France", "Roman Empire"], correct: 0 },
  { question: "Captured birds promote", choices: ["When entering the promotion zone", "Never", "Always immediately", "Only on rank 1"], correct: 0 },
  { question: "The crane (tsuru) moves", choices: ["One square in any direction except sideways", "Like a knight", "Like a rook", "Cannot move"], correct: 0 },
  { question: "Number of pieces per side at start", choices: ["16", "20", "40", "5"], correct: 0 },
  { question: "Strategic theme", choices: ["Use winged pieces to attack the phoenix's flank", "Trade everything", "Refuse to move", "Promote pawns only"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ToriShogiSettings): ToriShogiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ToriShogiState, action: ToriShogiAction): ToriShogiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ToriShogiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
