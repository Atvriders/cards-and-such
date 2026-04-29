import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface XiangqiClassicQuizSettings { questions: "10"; }
export interface XiangqiClassicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type XiangqiClassicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Xiangqi is played on a", choices: ["9-file by 10-rank board with a river", "8x8 board", "9x9 board", "10x10 board"] as [string, string, string, string], correct: 0 },
  { question: "The cannon in Xiangqi captures by", choices: ["Jumping over exactly one screen piece", "Sliding diagonally", "Standing still and shooting", "Capturing the king from any square"] as [string, string, string, string], correct: 0 },
  { question: "The general (king) is restricted to", choices: ["The 3x3 palace", "Any rank", "Only the home rank", "The river squares"] as [string, string, string, string], correct: 0 },
  { question: "Two generals on the same file with no piece between", choices: ["Loses for the player on move (flying generals)", "Is a stalemate", "Is forbidden to move into", "Is a normal position"] as [string, string, string, string], correct: 0 },
  { question: "Elephants cannot", choices: ["Cross the river", "Move sideways", "Move at all", "Capture"] as [string, string, string, string], correct: 0 },
  { question: "Pawns in Xiangqi gain extra movement", choices: ["After crossing the river", "After three moves", "Only on diagonals", "Never"] as [string, string, string, string], correct: 0 },
  { question: "Promotion in Xiangqi is", choices: ["Implicit — pawns gain sideways movement past river", "Forbidden", "To queen on rank 1", "A free choice"] as [string, string, string, string], correct: 0 },
  { question: "The horse moves like", choices: ["A knight, but is blocked at the leg-square", "A standard chess knight unblocked", "A rook one square", "A bishop one square"] as [string, string, string, string], correct: 0 },
  { question: "Xiangqi is most popular in", choices: ["Greater China and Vietnam", "Brazil and Argentina", "Iceland", "Egypt"] as [string, string, string, string], correct: 0 },
  { question: "A common Xiangqi opening involves", choices: ["Central cannon to the central file", "Pawn to e4", "Knight to f3", "Castling kingside"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: XiangqiClassicQuizSettings): XiangqiClassicQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: XiangqiClassicQuizState, action: XiangqiClassicQuizAction): XiangqiClassicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: XiangqiClassicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
