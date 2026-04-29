import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ReversiRandomStartSettings { questions: "10"; }
export interface ReversiRandomStartState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ReversiRandomStartAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Random Start Reversi randomizes", choices: ["The initial 4 disc placements", "The whole board", "Disc colors", "Player turns forever"], correct: 0 },
  { question: "The standard 4-center placement is", choices: ["Replaced with random valid central placement", "Removed entirely", "Doubled", "Played by hand"], correct: 0 },
  { question: "Goal remains", choices: ["Most discs of your color at game end", "Fewest discs", "First flip wins", "Reach corner"], correct: 0 },
  { question: "A random start often", choices: ["Renders standard opening theory useless", "Confirms standard theory", "Has no impact", "Always favors black"], correct: 0 },
  { question: "Players should focus on", choices: ["Mid-game tactics rather than memorized lines", "Memorized openings", "Random moves", "Refusing to move"], correct: 0 },
  { question: "Mobility considerations", choices: ["Are even more important from the start", "Become irrelevant", "Are unchanged", "Are reversed"], correct: 0 },
  { question: "When the board fills", choices: ["The game ends and discs are counted", "Game continues", "Players reset", "First to flip wins"], correct: 0 },
  { question: "Compared with standard Reversi, Random Start is", choices: ["More variable but uses the same basic rules", "Completely different game", "Smaller board", "Hex board"], correct: 0 },
  { question: "Best skill", choices: ["Adapt to the position you're given", "Memorize openings", "Roll dice well", "Flip discs randomly"], correct: 0 },
  { question: "Random Start Reversi is part of the", choices: ["Reversi/Othello family", "Chess family", "Card family", "Race game family"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ReversiRandomStartSettings): ReversiRandomStartState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ReversiRandomStartState, action: ReversiRandomStartAction): ReversiRandomStartState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ReversiRandomStartState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
