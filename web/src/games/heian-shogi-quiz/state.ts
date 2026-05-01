import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HeianShogiQuizSettings { questions: "10"; }
export interface HeianShogiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HeianShogiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Heian Shogi is played on a", choices: ["7×7 or 8×8 board (historical sources vary)", "9×9", "10×10", "Hex"], correct: 0 },
  { question: "Heian Shogi predates", choices: ["Standard Shogi", "Modern bullet chess", "Olympic Games", "Lichess"], correct: 0 },
  { question: "The variant comes from", choices: ["The Heian period of Japan (794–1185)", "Edo period", "Meiji era", "Showa era"], correct: 0 },
  { question: "Drops in Heian Shogi", choices: ["Generally not present", "Always present", "Required", "Reset"], correct: 0 },
  { question: "Pawns capture", choices: ["Forward only", "Diagonally", "All directions", "Backward"], correct: 0 },
  { question: "Heian Shogi pieces are", choices: ["Simpler than standard Shogi", "More complex", "Identical", "Three only"], correct: 0 },
  { question: "The variant is studied as", choices: ["A historical Shogi precursor", "Olympic chess", "Race game", "Card variant"], correct: 0 },
  { question: "Promotion in Heian Shogi is", choices: ["Limited to certain pieces", "All pieces", "Forbidden", "Random"], correct: 0 },
  { question: "The variant emphasizes", choices: ["Slow positional play", "Fast bullet", "Pawn race", "Drops"], correct: 0 },
  { question: "Heian Shogi is classified as a", choices: ["Historical Shogi variant", "Standard FIDE", "Race game", "Card variant"], correct: 0 },

  { question: "The earliest source for Heian Shogi is", choices: ["The Nichureki (12th century)", "A 20th-century essay", "A 1500 manuscript", "Roman texts"], correct: 0 },
  { question: "The Tokin (promoted pawn) moves like a", choices: ["Gold General", "Rook", "Bishop", "Knight"], correct: 0 },
  { question: "Heian Shogi has", choices: ["Fewer piece types than modern Shogi", "More piece types", "Identical pieces", "No pieces"], correct: 0 },
  { question: "The Knight in Heian Shogi moves", choices: ["Like the modern Shogi Keima (forward L only)", "Like FIDE knight", "Backward L", "Like a king"], correct: 0 },
  { question: "The Rook is", choices: ["Generally absent in Heian Shogi", "Always present", "Present and central", "Doubled"], correct: 0 },
  { question: "The Bishop is", choices: ["Generally absent in Heian Shogi", "Always present", "Doubled", "Replaces king"], correct: 0 },
  { question: "Heian Dai Shogi differs by being", choices: ["A larger 13×13 cousin", "Smaller 5×5", "Played on hex", "Modern"], correct: 0 },
  { question: "The variant evolved into", choices: ["Modern Shogi over centuries", "Western chess", "Xiangqi", "Janggi"], correct: 0 },
  { question: "Heian-period Japan was known for", choices: ["Court culture and classical literature", "Industrial revolution", "Samurai shogunate", "Modernization"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HeianShogiQuizSettings): HeianShogiQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HeianShogiQuizState, action: HeianShogiQuizAction): HeianShogiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HeianShogiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
