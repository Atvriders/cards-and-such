import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FourPlayerChessFfaSettings { questions: "10"; }
export interface FourPlayerChessFfaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FourPlayerChessFfaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "FFA Chess winner is?", choices: ["Last king standing", "First to checkmate", "Most pieces", "Random"], correct: 0 },
  { question: "Strategic principle in FFA?", choices: ["Don't be the strongest visible target", "Always attack leader", "Trade queens early", "Race to mate"], correct: 0 },
  { question: "You can deliver mate to player 2 OR damage player 3. Best?", choices: ["Mate player 2 — eliminate", "Damage player 3", "Pass", "Trade with self"], correct: 0 },
  { question: "Dead-king pieces become?", choices: ["Frozen / removed depending on ruleset", "Yours", "Random", "Live opponents"], correct: 0 },
  { question: "Why avoid being first to mate?", choices: ["Tempting target for the other two", "Can't move", "Loss of points", "Boring"], correct: 0 },
  { question: "Pawn promotion in 4P chess gives ranks?", choices: ["Promotion only on the far side (8 squares away)", "Anywhere", "Never", "On any opponent rank"], correct: 2 },
  { question: "Three players gang up on you. Best defense?", choices: ["Make peace by attacking the leader", "Resign", "Trade queens", "Castle"], correct: 0 },
  { question: "Bishop pair value in 4P?", choices: ["Even higher — long diagonals span board", "Same", "Lower", "Useless"], correct: 0 },
  { question: "Endgame with 2 players left, FFA reverts to?", choices: ["Standard 2-player chess goals", "Continues at 4-player rules", "Stalemate", "Random"], correct: 0 },
  { question: "Tempo principle in FFA?", choices: ["Avoid wasted moves; every turn 4 things happen", "Trade slowly", "Castle late", "Move pawns"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: FourPlayerChessFfaSettings): FourPlayerChessFfaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FourPlayerChessFfaState, action: FourPlayerChessFfaAction): FourPlayerChessFfaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FourPlayerChessFfaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
