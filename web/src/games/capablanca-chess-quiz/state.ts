import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CapablancaChessQuizSettings { questions: "10"; }
export interface CapablancaChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CapablancaChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Capablanca Chess uses a", choices: ["10×8 board", "8×8 board", "10×10 board", "Hex grid"], correct: 0 },
  { question: "Two new pieces are", choices: ["Archbishop (knight+bishop) and Chancellor (knight+rook)", "Cannon and elephant", "Lion and dragon", "Wizard and champion"], correct: 0 },
  { question: "The variant was proposed by", choices: ["José Raúl Capablanca", "Bobby Fischer", "Magnus Carlsen", "Reiner Knizia"], correct: 0 },
  { question: "Capablanca's motivation was", choices: ["To revive chess (he feared it was dying out)", "To replace FIDE", "Olympic acceptance", "Speed play"], correct: 0 },
  { question: "Pawn promotion is", choices: ["Standard — promote on the last rank", "Only to queen", "Forbidden", "Only to chancellor"], correct: 0 },
  { question: "The Archbishop is also called", choices: ["Princess or Cardinal", "King", "Sage", "Lion"], correct: 0 },
  { question: "The Chancellor is also called", choices: ["Empress or Marshall", "Queen", "Rook", "Pawn"], correct: 0 },
  { question: "The variant is studied as a", choices: ["Theoretical alternative to FIDE chess", "Olympic event", "Race game", "Card variant"], correct: 0 },
  { question: "Year first proposed", choices: ["1920s", "1850s", "1990s", "2010s"], correct: 0 },
  { question: "Capablanca chess is classified as a", choices: ["Larger-board fairy variant", "Standard FIDE", "Speed chess", "Bullet chess"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CapablancaChessQuizSettings): CapablancaChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CapablancaChessQuizState, action: CapablancaChessQuizAction): CapablancaChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CapablancaChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
