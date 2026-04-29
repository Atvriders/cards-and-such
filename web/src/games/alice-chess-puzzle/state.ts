import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AliceChessPuzzleSettings { questions: "10"; }
export interface AliceChessPuzzleState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AliceChessPuzzleAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Alice Chess is played on", choices: ["Two 8×8 boards", "One 16×16 board", "Hexagonal grid", "Round board"], correct: 0 },
  { question: "After a move, the piece", choices: ["Transfers to the corresponding square on the other board", "Stays put", "Doubles", "Splits"], correct: 0 },
  { question: "The destination square must be empty on", choices: ["The other board", "Both boards", "Either board", "Same color"], correct: 0 },
  { question: "Alice Chess is named after", choices: ["Alice in Wonderland (the looking-glass)", "Alice Beardsley", "A medieval queen", "Alice de Rotrou"], correct: 0 },
  { question: "The two boards represent", choices: ["Two parallel realms (mirror world)", "Past and future", "Two armies", "Hot and cold zones"], correct: 0 },
  { question: "Capturing happens", choices: ["On the source board (just like normal capture)", "Only on board 2", "Only on board 1", "Both boards simultaneously"], correct: 0 },
  { question: "The challenge is", choices: ["Tracking pieces across two boards", "Memorizing openings", "Race to rank 8", "Pawn drops"], correct: 0 },
  { question: "Castling in Alice Chess", choices: ["Generally allowed if the rule set supports it", "Forbidden", "Required", "Reset"], correct: 0 },
  { question: "Inventor of Alice Chess", choices: ["V. R. Parton (1953)", "Bobby Fischer", "Reiner Knizia", "Bobby Cerveny"], correct: 0 },
  { question: "Each move transfers piece to", choices: ["The mirror square on the other board", "Random square", "Same board, new square", "Opposite color square"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AliceChessPuzzleSettings): AliceChessPuzzleState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AliceChessPuzzleState, action: AliceChessPuzzleAction): AliceChessPuzzleState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AliceChessPuzzleState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
