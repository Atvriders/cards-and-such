import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BetzaArmiesSettings { questions: "10"; }
export interface BetzaArmiesState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BetzaArmiesAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Ralph Betza's variant lets each side pick", choices: ["A different fairy army", "Same FIDE army", "Random pieces every move", "No army"], correct: 0 },
  { question: "The four classic Betza armies include", choices: ["Colorbound Clobberers, Nutty Knights, Remarkable Rookies, plus FIDE", "Only one army", "Only knights", "Only kings"], correct: 0 },
  { question: "Each army is designed to be", choices: ["Roughly equal to FIDE in strength", "Twice as strong", "Half as strong", "All-pawn"], correct: 0 },
  { question: "The Colorbound Clobberers feature", choices: ["Pieces stuck on one color", "Only kings", "Pawns only", "Cannons"], correct: 0 },
  { question: "The Nutty Knights consist of", choices: ["Knight-like leapers in unusual configurations", "Sliding rooks only", "Pawn-only force", "All bishops"], correct: 0 },
  { question: "Remarkable Rookies emphasize", choices: ["Rook-style sliding pieces", "Bishop diagonals", "Knight jumps", "Pawn pushes"], correct: 0 },
  { question: "Board and pawns remain", choices: ["Standard 8×8 with normal pawns", "10×10 with no pawns", "Hex grid", "Round board"], correct: 0 },
  { question: "Castling is", choices: ["Allowed for armies that include rooks/king", "Disabled always", "Mandatory first move", "Replaced with drop"], correct: 0 },
  { question: "Betza himself was a", choices: ["Prolific fairy-chess theorist", "World champion", "Olympic athlete", "Game publisher"], correct: 0 },
  { question: "The fundamental challenge is", choices: ["Learning your opponent's army's strengths and weaknesses", "Memorizing FIDE openings", "Playing slowly", "Drawing every game"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: BetzaArmiesSettings): BetzaArmiesState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BetzaArmiesState, action: BetzaArmiesAction): BetzaArmiesState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BetzaArmiesState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
