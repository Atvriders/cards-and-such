import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Chess960QuizSettings { questions: "10"; }
export interface Chess960QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Chess960QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Chess960 is also known as", choices: ["Fischer Random Chess", "Antichess", "Bughouse", "Atomic chess"], correct: 0 },
  { question: "The starting position is", choices: ["One of 960 randomized back-rank arrangements", "Always the standard chess setup", "Mirror-symmetric only", "Chosen by the player to move"], correct: 0 },
  { question: "In any Chess960 starting position the bishops are", choices: ["Placed on opposite-colored squares", "Always on c1 and f1", "On the same color", "Adjacent to the king"], correct: 0 },
  { question: "The king must start", choices: ["Between the two rooks", "On e1 always", "On a corner square", "Next to a bishop"], correct: 0 },
  { question: "Black's starting position", choices: ["Mirrors White's setup exactly", "Is chosen independently", "Is always the standard setup", "Is randomized separately"], correct: 0 },
  { question: "Castling rules in Chess960", choices: ["Place the king on g1/c1 and rook on f1/d1 regardless of starting squares", "Are not allowed", "Require three moves", "Are identical to standard chess only"], correct: 0 },
  { question: "Chess960 was promoted by", choices: ["Bobby Fischer in 1996", "Mikhail Tal in 1960", "Magnus Carlsen in 2010", "Garry Kasparov in 1985"], correct: 0 },
  { question: "The number 960 comes from", choices: ["The count of legal back-rank arrangements", "Fischer's birth year", "The year of the first FIDE championship", "An arbitrary marketing choice"], correct: 0 },
  { question: "Opening theory in Chess960 is", choices: ["Largely irrelevant — players must reason from move 1", "Identical to standard chess", "Memorized in 50-move books", "Limited to three openings"], correct: 0 },
  { question: "Pawn structure and middle/endgame technique in Chess960", choices: ["Still apply once pieces develop", "Are completely different", "Are reversed", "Don't matter at all"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Chess960QuizSettings): Chess960QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Chess960QuizState, action: Chess960QuizAction): Chess960QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Chess960QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
