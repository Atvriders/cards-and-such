import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AtomicChessQuizSettings { questions: "10"; }
export interface AtomicChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AtomicChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Atomic chess, a capture causes", choices: ["An explosion that removes the captured piece, capturer, and adjacent non-pawn pieces", "Only the captured piece to vanish", "All pieces on the file to vanish", "The board to flip"], correct: 0 },
  { question: "Pawns adjacent to an explosion are", choices: ["Not removed by the blast", "Removed along with everything else", "Promoted to queens", "Moved one square back"], correct: 0 },
  { question: "A king is lost when", choices: ["It is exploded by an adjacent capture (or stepped onto by capture)", "It is checkmated as in standard chess", "It is captured directly only", "It runs out of legal moves"], correct: 0 },
  { question: "In Atomic, you may not make a move that", choices: ["Explodes your own king", "Pushes a pawn two squares", "Castles kingside", "Promotes to a queen"], correct: 0 },
  { question: "If both kings would explode in the same blast,", choices: ["The capturing side wins (rules vary, but typically the mover wins)", "The game is drawn", "The pieces respawn", "Both kings move randomly"], correct: 0 },
  { question: "Kings cannot capture in Atomic because", choices: ["The capturing king would be destroyed in the explosion", "Kings can never capture", "It would end the game prematurely", "It would create infinite loops"], correct: 0 },
  { question: "Check in Atomic is", choices: ["Possible to ignore if the threatening piece can be exploded indirectly", "Identical to standard chess", "Impossible to deliver", "Only via knights"], correct: 0 },
  { question: "A standard Atomic tactic is to", choices: ["Lure pieces near the enemy king for a chain explosion", "Trade queens immediately", "Promote pawns on the a-file", "Avoid all captures"], correct: 0 },
  { question: "Pawn captures in Atomic", choices: ["Also cause an explosion", "Are silent and harmless", "Are forbidden", "Only explode if next to a king"], correct: 0 },
  { question: "Atomic chess is most often played", choices: ["Online at fast time controls", "Over-the-board in classical events", "Without any clock", "On a hex board"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AtomicChessQuizSettings): AtomicChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AtomicChessQuizState, action: AtomicChessQuizAction): AtomicChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AtomicChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
