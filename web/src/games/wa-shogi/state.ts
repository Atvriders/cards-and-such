import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WaShogiSettings { questions: "10"; }
export interface WaShogiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WaShogiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Wa Shogi is played on an", choices: ["11×11 board", "9×9 board", "12×12 board", "8×8 board"], correct: 0 },
  { question: "Theme of the pieces", choices: ["Animals (boar, deer, fox, etc.)", "Birds", "Plants", "Soldiers"], correct: 0 },
  { question: "Drops in Wa Shogi", choices: ["Some versions allow drops; classical does not", "Always allowed", "Always forbidden", "Mandatory"], correct: 0 },
  { question: "Era of origin", choices: ["Medieval Japan", "Modern Vietnam", "Roman Britain", "Aztec era"], correct: 0 },
  { question: "The royal piece is the", choices: ["King (osho)", "Lion", "Eagle", "Tiger"], correct: 0 },
  { question: "Promotion zone is", choices: ["Far ranks of the board", "Center only", "First rank only", "No promotion"], correct: 0 },
  { question: "Number of pieces per side", choices: ["27 in classical setup", "20", "8", "100"], correct: 0 },
  { question: "Wa Shogi is closely related to", choices: ["Dai/Sho shogi family", "Western chess", "Xiangqi", "Backgammon"], correct: 0 },
  { question: "Wa Shogi is best described as", choices: ["A historical regional shogi variant", "A modern app", "A card game", "A dice race"], correct: 0 },
  { question: "A typical strategic motif", choices: ["Use long-range animal leapers to disrupt enemy ranks", "Trade kings", "Promote pawns instantly", "Avoid moving"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: WaShogiSettings): WaShogiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WaShogiState, action: WaShogiAction): WaShogiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WaShogiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
