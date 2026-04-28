import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CantoneseMahjongSettings { questions: "10"; }
export interface CantoneseMahjongState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CantoneseMahjongAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Cantonese Mahjong is the default style in?", choices: ["Beijing", "Hong Kong", "Singapore", "Tokyo"], correct: 1 },
  { question: "A Cantonese Mahjong winning hand uses how many tiles?", choices: ["13", "14", "15", "16"], correct: 1 },
  { question: "The scoring unit in Cantonese Mahjong is?", choices: ["Yaku", "Fan", "Han", "Tens"], correct: 1 },
  { question: "A 'chicken hand' refers to?", choices: ["A wild tile", "A hand with no scoring elements", "Highest hand", "Worst tile draw"], correct: 1 },
  { question: "A 'self-drawn' winning tile is called?", choices: ["Zimo", "Pao", "Riichi", "Chow"], correct: 0 },
  { question: "Self-drawing the winning tile gives a?", choices: ["Bonus to all losers", "Reduced score", "No effect", "Penalty"], correct: 0 },
  { question: "A 'limit hand' is the?", choices: ["Smallest hand", "Maximum score cap hand", "Forbidden hand", "Test hand"], correct: 1 },
  { question: "A common minimum to win in Cantonese is?", choices: ["3 fan", "5 fan", "7 fan", "10 fan"], correct: 0 },
  { question: "Cantonese Mahjong does NOT use?", choices: ["Flower tiles", "Riichi declaration", "Fan scoring", "Winds"], correct: 1 },
  { question: "Cantonese is sometimes called?", choices: ["Hong Kong style", "Beijing style", "Tokyo style", "Lao style"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CantoneseMahjongSettings): CantoneseMahjongState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CantoneseMahjongState, action: CantoneseMahjongAction): CantoneseMahjongState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CantoneseMahjongState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
