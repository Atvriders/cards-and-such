import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FogOfWarQuizSettings { questions: "10"; }
export interface FogOfWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FogOfWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Fog of War (Dark Chess), each player can see", choices: ["Only their own pieces and squares those pieces attack or can move to", "The whole board normally", "Only the center", "Only enemy pieces"], correct: 0 },
  { question: "The win condition is", choices: ["Capture the opposing king (no check or checkmate concept)", "Standard checkmate", "Promote three pawns", "Stalemate the opponent"], correct: 0 },
  { question: "A move into a square occupied by an enemy piece", choices: ["Captures it, even if you couldn't see it", "Is illegal", "Reveals the piece without capturing", "Ends the game"], correct: 0 },
  { question: "Check is", choices: ["Not announced — the king can be captured directly", "Announced as in standard chess", "Worth bonus points", "Required to be parried"], correct: 0 },
  { question: "Squares hidden by fog appear", choices: ["Empty or shaded — you cannot tell what's there", "As skull icons", "As random pieces", "In a smaller board view"], correct: 0 },
  { question: "Castling in Fog of War is", choices: ["Allowed if the king's destination/path squares are visible to you", "Always allowed without restriction", "Forbidden", "Done with the queen"], correct: 0 },
  { question: "If you move into the line of an unseen bishop,", choices: ["You may be captured next turn", "The bishop reveals itself first", "The move is undone", "The game pauses"], correct: 0 },
  { question: "Pawn captures reveal", choices: ["The captured piece's identity to the capturer", "The entire board for one move", "Nothing — captures are silent", "All enemy pawns"], correct: 0 },
  { question: "Fog of War rewards", choices: ["Probabilistic reasoning and bluffing", "Pure calculation as in standard chess", "Endgame technique only", "Memorization of openings"], correct: 0 },
  { question: "Another common name for the variant is", choices: ["Dark Chess or Kriegspiel-style chess", "Atomic Chess", "Three-check Chess", "Horde Chess"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: FogOfWarQuizSettings): FogOfWarQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FogOfWarQuizState, action: FogOfWarQuizAction): FogOfWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FogOfWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
