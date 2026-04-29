import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SuicideCheckersQuizSettings { questions: "10"; }
export interface SuicideCheckersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SuicideCheckersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Suicide Checkers wins by", choices: ["Losing all your pieces or having no legal move", "Capturing the king", "Reaching the back rank first", "Moving twelve times"] as [string, string, string, string], correct: 0 },
  { question: "Captures in Suicide Checkers are", choices: ["Mandatory (must capture when possible)", "Forbidden", "Optional", "Allowed only by kings"] as [string, string, string, string], correct: 0 },
  { question: "Strategically you want to", choices: ["Force opponent to capture you", "Defend your back rank", "Promote quickly", "Avoid all jumps"] as [string, string, string, string], correct: 0 },
  { question: "A king in Suicide Checkers", choices: ["Still moves like a normal checkers king", "Cannot move", "Can move two squares per turn", "Is removed from play"] as [string, string, string, string], correct: 0 },
  { question: "Stalemate (no legal move) means", choices: ["You win in Suicide Checkers", "You lose", "Game is drawn", "A reroll occurs"] as [string, string, string, string], correct: 0 },
  { question: "Compared to standard checkers, the strategy is", choices: ["Inverted — sacrifices are good", "Identical", "Faster only", "Position-blind"] as [string, string, string, string], correct: 0 },
  { question: "Suicide Checkers is also known as", choices: ["Giveaway, Anti, or Losing Checkers", "Korean Checkers", "Russian Draughts", "Dameo"] as [string, string, string, string], correct: 0 },
  { question: "Standard Suicide Checkers boards are", choices: ["8x8", "6x6", "10x10 only", "12x12"] as [string, string, string, string], correct: 0 },
  { question: "Multi-jumps in Suicide Checkers are", choices: ["Mandatory if available", "Forbidden", "Optional", "Limited to two jumps"] as [string, string, string, string], correct: 0 },
  { question: "The variant is", choices: ["Solved at small board sizes by computer", "A drawn game", "A pure luck game", "Deprecated everywhere"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SuicideCheckersQuizSettings): SuicideCheckersQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SuicideCheckersQuizState, action: SuicideCheckersQuizAction): SuicideCheckersQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SuicideCheckersQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
