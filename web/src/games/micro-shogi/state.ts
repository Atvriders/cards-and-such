import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MicroShogiSettings { questions: "10"; }
export interface MicroShogiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MicroShogiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Micro Shogi is played on a", choices: ["4×5 board", "5×5 board", "9×9 board", "12×12 board"], correct: 0 },
  { question: "A signature rule is", choices: ["Every piece promotes after every move", "No promotion", "Only pawns promote", "King promotes"], correct: 0 },
  { question: "Number of pieces per side", choices: ["5", "20", "40", "1"], correct: 0 },
  { question: "Captured pieces", choices: ["Are kept in hand and may be dropped (shogi-style)", "Are removed forever", "Return to start", "Become the king"], correct: 0 },
  { question: "Game pace is", choices: ["Very fast (a handful of moves)", "Days long", "Untimed only", "One move per game"], correct: 0 },
  { question: "Designer/era", choices: ["20th-century Japanese variant", "Ancient Egypt", "Medieval England", "Modern Brazil"], correct: 0 },
  { question: "The king is called", choices: ["Osho", "Wang", "Roi", "Rey"], correct: 0 },
  { question: "Promotion zone in Micro Shogi", choices: ["Effectively the entire board (every move promotes)", "Last rank only", "Center 4 squares", "First rank only"], correct: 0 },
  { question: "Drops in Micro Shogi", choices: ["Are allowed and decisive", "Forbidden", "Cost a turn", "Promote pieces"], correct: 0 },
  { question: "Best general strategy", choices: ["Use drops to attack the king with reinforcement", "Avoid using drops", "Trade everything", "Refuse to move"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MicroShogiSettings): MicroShogiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MicroShogiState, action: MicroShogiAction): MicroShogiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MicroShogiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
