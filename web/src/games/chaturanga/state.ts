import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChaturangaSettings { questions: "10"; }
export interface ChaturangaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChaturangaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Chaturanga originated in", choices: ["Ancient India (~6th century)", "Modern Russia", "Ancient Greece", "Renaissance Italy"], correct: 0 },
  { question: "Chaturanga literally means", choices: ["Four divisions of the army", "King's game", "Battlefield", "Royal court"], correct: 0 },
  { question: "Played on a", choices: ["8×8 board (ashtapada)", "10×10 board", "Hex board", "12×12 board"], correct: 0 },
  { question: "The four divisions are", choices: ["Infantry, cavalry, elephants, chariots", "Knights, kings, queens, pawns", "Cannons, generals, elephants, guards", "Bishops only"], correct: 0 },
  { question: "The bishop's predecessor was the", choices: ["Elephant (gaja), moving 2 squares diagonally", "Lion", "Camel", "Horse"], correct: 0 },
  { question: "The queen's predecessor was the", choices: ["Mantri/fers — one square diagonally", "Ferz, moving any distance", "Royal courier", "Maharajah"], correct: 0 },
  { question: "Pawn promotion in Chaturanga", choices: ["Promoted only to the type of piece in that file", "Promoted to queen", "Did not exist", "Promoted to king"], correct: 0 },
  { question: "Modern chess descends from", choices: ["Chaturanga via Shatranj and medieval European games", "Independent invention in Europe", "Chinese xiangqi", "Japanese shogi"], correct: 0 },
  { question: "Number of players historically", choices: ["2 or 4", "Always 6", "Always 1", "Always 8"], correct: 0 },
  { question: "The king moved", choices: ["One square in any direction (as today)", "Like a knight", "Like a queen", "Could not move"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ChaturangaSettings): ChaturangaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChaturangaState, action: ChaturangaAction): ChaturangaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChaturangaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
