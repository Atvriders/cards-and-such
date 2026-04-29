import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BughousePuzzleSettings { questions: "10"; }
export interface BughousePuzzleState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BughousePuzzleAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Bughouse is played by", choices: ["Four players on two boards", "Two players on one board", "Six players", "Solo"], correct: 0 },
  { question: "Captured pieces are", choices: ["Passed to your partner to drop", "Removed permanently", "Returned to original square", "Promoted automatically"], correct: 0 },
  { question: "A team wins when", choices: ["Either partner checkmates the opposing king", "Both partners draw", "All pawns promote", "Time expires"], correct: 0 },
  { question: "Communication between partners is", choices: ["Encouraged — verbal coordination is part of the game", "Forbidden", "Limited to one word", "By writing only"], correct: 0 },
  { question: "Time controls are usually", choices: ["Fast (blitz/bullet)", "Days per move", "Six hours per game", "Untimed"], correct: 0 },
  { question: "Pieces dropped on rank 1/8 may be", choices: ["Pawns may not drop on those ranks", "Always queens", "Always knights", "Forbidden completely"], correct: 0 },
  { question: "The board layout is", choices: ["Two opposite-colored teams across two boards", "One large board", "Hexagonal", "Triangular"], correct: 0 },
  { question: "Sitting still without moving is", choices: ["A tactic — to wait for partner to pass a piece", "Forbidden", "Loss by forfeit", "An automatic draw"], correct: 0 },
  { question: "Drops can give", choices: ["Immediate check or mate", "No checks ever", "Only check, never mate", "Only mates if announced"], correct: 0 },
  { question: "Bughouse is associated with", choices: ["Casual chess clubs and online speed play", "FIDE world championships", "Olympic competition", "Solitaire"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: BughousePuzzleSettings): BughousePuzzleState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BughousePuzzleState, action: BughousePuzzleAction): BughousePuzzleState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BughousePuzzleState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
