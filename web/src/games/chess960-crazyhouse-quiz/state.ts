import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Chess960CrazyhouseQuizSettings { questions: "10"; }
export interface Chess960CrazyhouseQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Chess960CrazyhouseQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Chess 960 + Crazyhouse combines", choices: ["Random back rank with captured-piece drops", "Standard openings with extra time", "Pawn storms only", "Bare-king endgame"] as [string, string, string, string], correct: 0 },
  { question: "The first decisions in this hybrid usually focus on", choices: ["King safety in the random opening", "Pawn promotion races", "Bishop trades", "Stalemate tricks"] as [string, string, string, string], correct: 0 },
  { question: "Captured pieces in the Crazyhouse layer become", choices: ["Drops in your reserve", "Lost permanently", "Promoted to queens", "Returned to bag at game end"] as [string, string, string, string], correct: 0 },
  { question: "A drop is illegal when it", choices: ["Places a pawn on rank 1 or 8", "Lands on an empty square", "Captures a piece", "Gives check"] as [string, string, string, string], correct: 0 },
  { question: "The combination is often called", choices: ["Crazyhouse 960", "Bug Royale", "Drophouse Random", "Scrabble Chess"] as [string, string, string, string], correct: 0 },
  { question: "Castling rules in Chess 960 require", choices: ["Specific king and rook target squares", "Five empty intermediate squares", "A queen still on the board", "Both rooks on the a-file"] as [string, string, string, string], correct: 0 },
  { question: "Drops give Crazyhouse-style games their", choices: ["Sharp, fast tactical character", "Long endgame phases", "Highly drawn nature", "Pawn-up character"] as [string, string, string, string], correct: 0 },
  { question: "A typical drop targets", choices: ["A check or fork square", "The opponent king square", "The center of the board only", "Squares behind your pawns only"] as [string, string, string, string], correct: 0 },
  { question: "Time controls in this hybrid are usually", choices: ["Blitz or bullet — fast and tactical", "Classical — slow and positional", "Correspondence months long", "Untimed friendlies"] as [string, string, string, string], correct: 0 },
  { question: "The hybrid is supported on", choices: ["Lichess as a custom variant", "FIDE-rated tournaments only", "Over the board only", "Discontinued everywhere"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Chess960CrazyhouseQuizSettings): Chess960CrazyhouseQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Chess960CrazyhouseQuizState, action: Chess960CrazyhouseQuizAction): Chess960CrazyhouseQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Chess960CrazyhouseQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
