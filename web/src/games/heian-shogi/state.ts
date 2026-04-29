import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HeianShogiSettings { questions: "10"; }
export interface HeianShogiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HeianShogiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Heian Shogi is played on a", choices: ["7×7 board", "9×9 board", "11×11 board", "5×5 board"], correct: 0 },
  { question: "Era of origin", choices: ["Heian period Japan (~9th–12th century)", "Modern Japan", "Edo era", "Meiji era"], correct: 0 },
  { question: "Number of pieces per side", choices: ["13", "20", "40", "8"], correct: 0 },
  { question: "Drops in Heian Shogi", choices: ["Not part of the historical rules", "Standard shogi-style", "Mandatory", "Only kings drop"], correct: 0 },
  { question: "The royal piece is the", choices: ["King (osho)", "Lion", "Phoenix", "Crane"], correct: 0 },
  { question: "Promotion is", choices: ["Limited compared to modern shogi", "Identical to modern", "Disallowed entirely", "Available everywhere"], correct: 0 },
  { question: "The bishop equivalent here is", choices: ["The flying chariot or copper general", "Modern bishop", "Cannon", "Camel"], correct: 0 },
  { question: "Heian Shogi influenced", choices: ["The development of modern shogi", "Western chess directly", "Mahjong", "Backgammon"], correct: 0 },
  { question: "Game pace is", choices: ["Shorter than modern shogi due to fewer pieces", "Identical to modern", "Multi-day", "Three moves only"], correct: 0 },
  { question: "Heian Shogi is studied today as", choices: ["A historical predecessor", "An online esport", "A children's game only", "A solitaire variant"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HeianShogiSettings): HeianShogiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HeianShogiState, action: HeianShogiAction): HeianShogiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HeianShogiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
