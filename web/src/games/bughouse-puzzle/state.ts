import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BughousePuzzleSettings { questions: "10"; }
export interface BughousePuzzleState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BughousePuzzleAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Bughouse is played by", choices: ["Four players on two adjacent boards", "Two players on one board", "Six players in a circle", "A single player solo"], correct: 0 },
  { question: "When you capture a piece, it", choices: ["Is passed to your partner to drop on their board", "Stays in your reserve to drop yourself", "Is removed from play", "Goes back to its starting square"], correct: 0 },
  { question: "A team wins when", choices: ["Either partner delivers checkmate or wins on time", "Both partners checkmate simultaneously", "All four players agree", "One side runs out of pawns"], correct: 0 },
  { question: "Verbal communication between partners is", choices: ["Allowed and central to strategy", "Strictly forbidden", "Limited to a single code word", "Only by written notes"], correct: 0 },
  { question: "Pawns dropped from the reserve may not land on", choices: ["Rank 1 or rank 8", "Any dark square", "Central squares", "The same file twice"], correct: 0 },
  { question: "Partners on the two boards play", choices: ["Opposite colors so captures feed each other", "The same color as each other", "Random colors each game", "Whichever color they prefer mid-game"], correct: 0 },
  { question: "'Sitting' (deliberately not moving) is", choices: ["A legitimate tactic to wait for a piece from your partner", "An automatic forfeit", "Forbidden by rule", "Only allowed in the endgame"], correct: 0 },
  { question: "A drop that delivers checkmate is", choices: ["Legal and a primary winning method", "Illegal", "Allowed only with knights", "Allowed only after move 30"], correct: 0 },
  { question: "Typical Bughouse time controls are", choices: ["Blitz or bullet (often 5 minutes or less)", "Classical (3+ hours)", "Correspondence (days per move)", "No clock at all"], correct: 0 },
  { question: "Bughouse is most associated with", choices: ["Casual chess clubs, scholastic events, and online play", "Official FIDE world championships", "The Olympic Games", "Solitaire chess apps"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: BughousePuzzleSettings): BughousePuzzleState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BughousePuzzleState, action: BughousePuzzleAction): BughousePuzzleState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BughousePuzzleState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
