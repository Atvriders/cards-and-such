import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OwareQuizSettings { questions: "10"; }
export interface OwareQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OwareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Oware is played with", choices: ["12 houses (6 per player) and 48 seeds", "9 houses", "8 dice", "One pit"], correct: 0 },
  { question: "A turn consists of", choices: ["Sowing seeds counterclockwise from one of your pits", "Rolling dice", "Drawing cards", "Placing one stone"], correct: 0 },
  { question: "Captures happen when", choices: ["The last seed lands in opponent's house with 2 or 3 seeds", "Any landing", "Random", "Pure luck"], correct: 0 },
  { question: "The game ends when", choices: ["A player has no seeds to sow", "Time runs out", "Both pass", "Three captures"], correct: 0 },
  { question: "Oware comes from", choices: ["West Africa (Akan people)", "East Africa", "South America", "Asia"], correct: 0 },
  { question: "The winner has", choices: ["The most captured seeds", "The most pieces", "Three checks", "Reached center"], correct: 0 },
  { question: "Oware is sometimes called", choices: ["Wari, Awele, or Awalé", "Bao", "Kalah", "Sungka"], correct: 0 },
  { question: "Strategy in Oware emphasizes", choices: ["Counting and planning capture chains", "Pure luck", "Pawn pushes", "Drops"], correct: 0 },
  { question: "A common rule prohibits", choices: ["Starving the opponent on purpose if you can avoid it", "Capturing", "Sowing", "Counting"], correct: 0 },
  { question: "Oware is classified as a", choices: ["Mancala/sowing game", "Race game", "Card game", "Connection game"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: OwareQuizSettings): OwareQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OwareQuizState, action: OwareQuizAction): OwareQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OwareQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
