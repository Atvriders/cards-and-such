import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HanamikojiSettings { questions: "10"; }
export interface HanamikojiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HanamikojiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Hanamikoji is designed for how many players?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Hanamikoji's central theme is competing for the favour of?", choices: ["Samurai", "Geishas", "Monks", "Merchants"], correct: 1 },
  { question: "The game features how many geishas?", choices: ["5", "6", "7", "9"], correct: 2 },
  { question: "A player wins by securing?", choices: ["4 geishas or 11 points", "All 7 geishas", "12 points", "Last card"], correct: 0 },
  { question: "Each geisha holds a fan with a value of?", choices: ["1 point each", "2 points each", "2-5 points", "Random per game"], correct: 2 },
  { question: "Each round, a player chooses how many actions?", choices: ["Two", "Three", "Four", "Five"], correct: 2 },
  { question: "The 'gift' action presents the opponent with?", choices: ["3 cards to choose from", "Single chosen card", "Two pairs", "Random card"], correct: 0 },
  { question: "The 'offer-choice' action lets the opponent choose?", choices: ["Random card", "One of two pairs", "All cards", "No cards"], correct: 1 },
  { question: "Hanamikoji emphasizes?", choices: ["Long-game tactics", "Fast hand mechanics", "Bluffing and reading opponents", "Pure luck"], correct: 2 },
  { question: "Hanamikoji is part of the family of?", choices: ["Hanafuda", "Modern abstract two-player", "Mahjong", "Roll and write"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HanamikojiSettings): HanamikojiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HanamikojiState, action: HanamikojiAction): HanamikojiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HanamikojiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
