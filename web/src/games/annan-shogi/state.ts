import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AnnanShogiSettings { questions: "10"; }
export interface AnnanShogiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AnnanShogiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Annan Shogi key rule", choices: ["A piece moves as the friendly piece directly behind it", "All pieces fly", "No drops allowed", "Pieces are random"], correct: 0 },
  { question: "Board size", choices: ["9×9 (standard shogi)", "8×8", "7×7", "12×12"], correct: 0 },
  { question: "The 'piece behind' must be", choices: ["An adjacent friendly piece in your own ranks", "An opponent piece", "Any piece anywhere", "Always the king"], correct: 0 },
  { question: "Drops in Annan Shogi", choices: ["Use standard shogi drop rules", "Forbidden", "Replace promotion", "Mandatory"], correct: 0 },
  { question: "A pawn supported by a rook can move like", choices: ["A rook", "A pawn only", "A knight", "A king"], correct: 0 },
  { question: "Origin of Annan", choices: ["Modern shogi variant from late 20th century", "Ancient ritual game", "Medieval Korean", "Roman game"], correct: 0 },
  { question: "Strategic keystone", choices: ["Carefully arrange the supporting piece behind your attackers", "Move randomly", "Trade pieces fast", "Promote pawns first"], correct: 0 },
  { question: "Promotion in Annan", choices: ["Standard shogi promotion zone", "No promotion", "All squares", "First rank only"], correct: 0 },
  { question: "Captured pieces", choices: ["Go to your hand for drops", "Are removed forever", "Become enemy", "Return to start"], correct: 0 },
  { question: "The king's move in Annan", choices: ["Standard king move (king itself uses normal move)", "Becomes a knight", "Cannot move", "Always promotes"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AnnanShogiSettings): AnnanShogiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AnnanShogiState, action: AnnanShogiAction): AnnanShogiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AnnanShogiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
