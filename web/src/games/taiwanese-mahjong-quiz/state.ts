import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TaiwaneseMahjongSettings { questions: "10"; }
export interface TaiwaneseMahjongState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TaiwaneseMahjongAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Taiwanese Mahjong final hand contains how many tiles?", choices: ["13", "14", "15", "16"], correct: 3 },
  { question: "A Taiwanese Mahjong hand needs how many sets plus a pair?", choices: ["3 sets + pair", "4 sets + pair", "5 sets + pair", "6 sets"], correct: 2 },
  { question: "Taiwanese Mahjong is played mostly in?", choices: ["Beijing", "Taiwan", "Singapore", "Hong Kong"], correct: 1 },
  { question: "Flower tiles in Taiwanese Mahjong?", choices: ["Are removed", "Are mandatory bonus tiles", "Are used as wilds", "Don't exist"], correct: 1 },
  { question: "A 'heavenly hand' is a win on?", choices: ["Last draw", "First draw of dealer", "Self-draw only", "Discarded tile"], correct: 1 },
  { question: "An 'earthly hand' is a win for non-dealers on?", choices: ["First discard", "Last draw", "Self-draw", "Concealed riichi"], correct: 0 },
  { question: "Taiwanese Mahjong's scoring style compared to Hong Kong?", choices: ["Larger fixed payouts", "Smaller fixed payouts plus bigger limits", "Identical", "No payouts"], correct: 1 },
  { question: "A Mahjong table seats how many players?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "Mahjong tiles total how many in the basic Taiwanese set?", choices: ["136", "144", "152", "160"], correct: 1 },
  { question: "The number 144 includes?", choices: ["Standard 136 + 8 flowers", "No flowers", "No winds", "No dragons"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TaiwaneseMahjongSettings): TaiwaneseMahjongState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TaiwaneseMahjongState, action: TaiwaneseMahjongAction): TaiwaneseMahjongState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TaiwaneseMahjongState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
