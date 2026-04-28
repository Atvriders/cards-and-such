import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SingaporeMahjongSettings { questions: "10"; }
export interface SingaporeMahjongState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SingaporeMahjongAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Singapore Mahjong is most directly derived from?", choices: ["Riichi", "Cantonese", "Taiwanese", "MCR"], correct: 1 },
  { question: "Singapore Mahjong tiles total how many in standard set?", choices: ["136", "144", "148", "160"], correct: 1 },
  { question: "Flower tiles in Singapore Mahjong are?", choices: ["Optional", "Mandatory and prominent", "Forbidden", "Used as wilds"], correct: 1 },
  { question: "Drawing the flower matching your seat gives?", choices: ["Penalty", "Bonus points", "No effect", "Skip"], correct: 1 },
  { question: "A 'heavenly hand' is a win on?", choices: ["Last discard", "Dealer's first draw", "Self-draw only", "Concealed kan"], correct: 1 },
  { question: "An 'earthly hand' is a win on?", choices: ["Final discard", "Non-dealer first discard", "Final round", "Initial flower"], correct: 1 },
  { question: "Animal tiles in Singapore Mahjong?", choices: ["Replace winds", "Are used as bonus tiles", "Are forbidden", "Equal dragons"], correct: 1 },
  { question: "A standard winning hand in Singapore is usually how many tiles?", choices: ["13", "14", "15", "16"], correct: 1 },
  { question: "Singapore Mahjong typically uses how many 'flowers'?", choices: ["4", "6", "8", "10"], correct: 2 },
  { question: "Compared to Hong Kong, Singapore play features?", choices: ["More flower bonuses", "Riichi", "Open table style only", "Different tile shapes"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SingaporeMahjongSettings): SingaporeMahjongState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SingaporeMahjongState, action: SingaporeMahjongAction): SingaporeMahjongState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SingaporeMahjongState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
