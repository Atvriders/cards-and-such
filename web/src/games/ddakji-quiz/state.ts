import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DdakjiSettings { questions: "10"; }
export interface DdakjiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DdakjiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Ddakji are made of?", choices: ["Cardstock paper", "Plastic", "Wood", "Stone"], correct: 0 },
  { question: "A Ddakji is played by?", choices: ["Drawing cards", "Slamming a paper tile to flip opponent's", "Rolling dice", "Tossing coins"], correct: 1 },
  { question: "You win opponent's ddakji by?", choices: ["Touching it", "Flipping it over with impact", "Landing on it", "Folding it"], correct: 1 },
  { question: "Ddakji is most commonly a?", choices: ["Casino game", "Korean children's game", "Pro tournament game", "Solitaire"], correct: 1 },
  { question: "Ddakji gained global notice via which Netflix series?", choices: ["Squid Game", "Sweet Home", "Hellbound", "All of Us Are Dead"], correct: 0 },
  { question: "Each ddakji is shaped like a?", choices: ["Triangle", "Square", "Circle", "Pentagon"], correct: 1 },
  { question: "Ddakji is similar in flipping mechanic to Japanese?", choices: ["Karuta", "Menko", "Mahjong", "Hanafuda"], correct: 1 },
  { question: "Ddakji play surface is best when?", choices: ["Slick concrete", "Hard with mild grip", "Fluffy carpet", "Sand"], correct: 1 },
  { question: "A successful flip earns?", choices: ["Points only", "The opponent's ddakji", "A free turn only", "Nothing"], correct: 1 },
  { question: "Ddakji folds typically come in pairs of?", choices: ["1 sheet", "2 paper sheets folded together", "3 sheets", "5 sheets"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DdakjiSettings): DdakjiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DdakjiState, action: DdakjiAction): DdakjiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DdakjiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
