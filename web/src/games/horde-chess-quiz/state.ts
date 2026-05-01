import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HordeChessQuizSettings { questions: "10"; }
export interface HordeChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HordeChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Horde chess, one side plays", choices: ["36 pawns versus a standard army", "Only kings", "Only queens", "Two armies of equal size"], correct: 0 },
  { question: "The Black side (standard army) wins by", choices: ["Capturing every white pawn", "Checkmating the white king", "Promoting first", "Surviving 50 moves"], correct: 0 },
  { question: "The white horde wins by", choices: ["Checkmating the black king", "Reaching rank 8 with any pawn", "Capturing all black pieces", "Stalemating black"], correct: 0 },
  { question: "The horde side has", choices: ["No king at all", "A king on e1", "Two kings", "A king disguised as a pawn"], correct: 0 },
  { question: "Horde pawns on the second rank may", choices: ["Move two squares as in standard chess", "Move three squares", "Only capture", "Not move at all"], correct: 0 },
  { question: "Pawns on rank 1 of the horde", choices: ["May still advance one or two squares (special rule)", "Cannot move at all", "Promote immediately", "Become rooks"], correct: 0 },
  { question: "If the horde runs out of pawns,", choices: ["Black wins", "The game is drawn", "White still has a hidden king", "White respawns pawns"], correct: 0 },
  { question: "En passant against horde pawns is", choices: ["Allowed normally", "Forbidden", "Only allowed once per game", "Allowed only on rank 4"], correct: 0 },
  { question: "A typical Black strategy in Horde is", choices: ["Trade pieces for multiple pawns to thin the horde", "Avoid captures entirely", "Sacrifice the queen on move 1", "Promote a knight"], correct: 0 },
  { question: "Horde is a variant of", choices: ["Dunsany's Chess (the asymmetric pawn-army idea)", "Xiangqi", "Shogi", "Go"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HordeChessQuizSettings): HordeChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HordeChessQuizState, action: HordeChessQuizAction): HordeChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HordeChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
