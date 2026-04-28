import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TozanGoSettings { questions: "10"; }
export interface TozanGoState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TozanGoAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tozan Go is named for the concept of?", choices: ["Uphill", "Downhill", "Mountain peak", "Valley"], correct: 0 },
  { question: "In Tozan Go, the weaker player usually plays?", choices: ["White", "Black with extra stones", "Black with no stones", "Both"], correct: 1 },
  { question: "Tozan Go is mainly used for?", choices: ["Pro tournaments", "Teaching mismatched players", "Time-limited blitz", "Solo puzzles"], correct: 1 },
  { question: "Compared to standard Go, Tozan Go differs in?", choices: ["Rules of capture", "Handicap setup", "Board shape", "Stone color"], correct: 1 },
  { question: "A standard Go handicap is implemented by?", choices: ["Time", "Pre-placed stones", "Coin flip", "Komi only"], correct: 1 },
  { question: "The stronger player in Tozan Go plays the role of?", choices: ["Climber", "Mountain", "Defender", "Reader"], correct: 1 },
  { question: "Tozan Go's purpose is to make matches?", choices: ["More lopsided", "More balanced", "Faster", "Shorter"], correct: 1 },
  { question: "The inverted handicap helps learners?", choices: ["Reach a winning chance", "Lose more", "Play smaller boards", "Skip moves"], correct: 0 },
  { question: "Tozan Go would be used most in a?", choices: ["Pro match", "Go school lesson", "Casino", "Speed tournament"], correct: 1 },
  { question: "Tozan Go is essentially Go plus?", choices: ["A new piece", "A reshaped board", "A teaching handicap framing", "A second die"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TozanGoSettings): TozanGoState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TozanGoState, action: TozanGoAction): TozanGoState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TozanGoState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
