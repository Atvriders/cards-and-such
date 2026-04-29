import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MarseillaisQuizSettings { questions: "10"; }
export interface MarseillaisQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MarseillaisQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Marseillais Chess gives each player", choices: ["Two consecutive moves per turn", "Three", "One", "Random"], correct: 0 },
  { question: "A check on the first move", choices: ["Must be addressed (no second move) in some variants", "Always ignored", "Wins", "Forbidden"], correct: 0 },
  { question: "Pawn double moves count as", choices: ["One move (or two depending on rule set)", "Three moves", "Free", "Forbidden"], correct: 0 },
  { question: "The variant originated in", choices: ["Marseille, France", "Moscow", "London", "Tokyo"], correct: 0 },
  { question: "Castling counts as", choices: ["One move", "Two moves", "Free", "Forbidden"], correct: 0 },
  { question: "Marseillais is sometimes called", choices: ["Double-move chess", "Triple chess", "Speed chess", "Bullet chess"], correct: 0 },
  { question: "Tactical opportunities are", choices: ["Very rich — combinations are deeper", "Limited", "Standard", "Reduced"], correct: 0 },
  { question: "The first move of a turn must be", choices: ["Legal in itself", "Optional", "Captures only", "Pawn only"], correct: 0 },
  { question: "The variant tests", choices: ["Calculating move pairs", "Pure positional play", "Endgames", "Drops"], correct: 0 },
  { question: "Marseillais Chess is classified as a", choices: ["Compound-move fairy variant", "Standard FIDE rule", "Race game", "Card variant"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MarseillaisQuizSettings): MarseillaisQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MarseillaisQuizState, action: MarseillaisQuizAction): MarseillaisQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MarseillaisQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
