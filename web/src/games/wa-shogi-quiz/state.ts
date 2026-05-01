import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WaShogiQuizSettings { questions: "10"; }
export interface WaShogiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WaShogiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Wa Shogi is played on an", choices: ["11×11 board", "9×9 board", "8×8 board", "Hex grid"], correct: 0 },
  { question: "The pieces are themed around", choices: ["Birds and animals", "Castle pieces", "Modern military", "Standard chess"], correct: 0 },
  { question: "Wa Shogi is a", choices: ["Historical large-board Shogi variant", "Modern speed variant", "Bullet variant", "Card variant"], correct: 0 },
  { question: "Drops follow", choices: ["Standard Shogi drop rules", "No drops", "Limited to one square", "Free placement"], correct: 0 },
  { question: "The variant emphasizes", choices: ["Long, complex strategic play", "Fast bullet pace", "Pawn race", "Pure tactics"], correct: 0 },
  { question: "Wa Shogi pieces include", choices: ["Many fairy types like crane and crow", "Standard 6 pieces", "Pawn only", "King only"], correct: 0 },
  { question: "Promotion happens in", choices: ["The opponent's nearest ranks", "Rank 1", "Center", "No promotion"], correct: 0 },
  { question: "Wa Shogi is from", choices: ["Japan", "Korea", "China", "Thailand"], correct: 0 },
  { question: "Number of distinct piece types", choices: ["Many — over 20", "Six", "Three", "One"], correct: 0 },
  { question: "Wa Shogi is classified as a", choices: ["Large-board fairy Shogi", "Standard FIDE", "Race game", "Card variant"], correct: 0 },

  { question: "Wa Shogi has versions both with and without", choices: ["Drops", "Pawns", "Kings", "Promotion"], correct: 0 },
  { question: "The Crane piece moves", choices: ["Like a Silver General (one diagonal or forward)", "Like a queen", "Two squares orthogonal", "Like a knight"], correct: 0 },
  { question: "Wa Shogi pieces feature animals such as", choices: ["Pheasant, swallow, ox, crane", "Castles only", "Bishops only", "Standard chess"], correct: 0 },
  { question: "The variant is recorded in", choices: ["Edo-period Japanese sources", "Korean texts", "Chinese annals", "Roman manuscripts"], correct: 0 },
  { question: "The starting army size is", choices: ["27 pieces per side", "20 pieces", "8 pieces", "40 pieces"], correct: 0 },
  { question: "Wa Shogi belongs to the family of", choices: ["Large Shogi variants", "Mini Shogi", "Western chess", "Card games"], correct: 0 },
  { question: "\"Wa\" in the name refers to", choices: ["Japan (the old name \"Wa\")", "Wing", "Wave", "War"], correct: 0 },
  { question: "Promotion typically yields", choices: ["Stronger movement (often Gold-like)", "Demotion", "Disappearance", "Pawn"], correct: 0 },
  { question: "The variant is best known among", choices: ["Shogi historians and fairy chess fans", "Casual gamers", "Children", "Bullet players"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: WaShogiQuizSettings): WaShogiQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WaShogiQuizState, action: WaShogiQuizAction): WaShogiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WaShogiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
