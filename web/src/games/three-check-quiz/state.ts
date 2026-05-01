import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ThreeCheckQuizSettings { questions: "10"; }
export interface ThreeCheckQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ThreeCheckQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Three-check chess, you win by", choices: ["Delivering check three times (or by checkmate)", "Capturing all pieces", "Promoting three pawns", "Surviving 30 moves"], correct: 0 },
  { question: "Each check delivered", choices: ["Counts toward the three-check total regardless of whether mate follows", "Only counts if it's mate", "Resets the clock", "Removes a pawn"], correct: 0 },
  { question: "Discovered checks count as", choices: ["One check (or two if double check)", "Zero — they don't count", "Three at once", "Only count if announced"], correct: 0 },
  { question: "Standard checkmate", choices: ["Still ends the game immediately", "No longer ends the game", "Counts as zero checks", "Requires three confirmations"], correct: 0 },
  { question: "A double check counts as", choices: ["Either one or two depending on rule set (commonly one)", "Always three", "Always zero", "Forfeit"], correct: 0 },
  { question: "A common strategy is to", choices: ["Sacrifice material for repeated checking sequences", "Trade queens early", "Avoid all checks", "Castle queenside on move 1"], correct: 0 },
  { question: "If you give two checks and your opponent gives two,", choices: ["Both sides need only one more check to win", "The game is drawn", "Both lose", "Checks reset"], correct: 0 },
  { question: "Three-check is popular on", choices: ["Lichess and other online platforms", "FIDE world championships", "Correspondence-only servers", "Hex boards"], correct: 0 },
  { question: "Perpetual check in Three-check", choices: ["Wins after the third check, not draws", "Always draws", "Is forbidden", "Forfeits the game"], correct: 0 },
  { question: "Three-check rewards", choices: ["Aggressive, attacking play and king-hunts", "Slow positional grinding", "Pawn-only endgames", "Avoiding the center"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ThreeCheckQuizSettings): ThreeCheckQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ThreeCheckQuizState, action: ThreeCheckQuizAction): ThreeCheckQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ThreeCheckQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
