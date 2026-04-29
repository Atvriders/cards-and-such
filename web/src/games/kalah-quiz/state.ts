import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KalahQuizSettings { questions: "10"; }
export interface KalahQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KalahQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Kalah uses", choices: ["12 small pits and 2 large stores", "One large pit", "Eight pits", "No pits"], correct: 0 },
  { question: "Sowing direction is", choices: ["Counterclockwise", "Clockwise", "Random", "No direction"], correct: 0 },
  { question: "A seed dropped in your store gives", choices: ["A bonus turn", "Nothing", "Captures", "Removes pit"], correct: 0 },
  { question: "Capturing in Kalah", choices: ["Last seed in empty pit on your side captures opposite pit", "Standard chess capture", "Diagonal", "Random"], correct: 0 },
  { question: "Kalah was popularized by", choices: ["William Champion in the 1940s", "Bobby Fischer", "Reiner Knizia", "V. R. Parton"], correct: 0 },
  { question: "The game ends when", choices: ["One side runs out of seeds", "Three captures", "Time", "Stalemate"], correct: 0 },
  { question: "Number of seeds per pit at start", choices: ["Usually 4 (3 or 6 also seen)", "One", "Ten", "Random"], correct: 0 },
  { question: "Kalah is most played in", choices: ["Western countries (mass-market mancala)", "West Africa", "East Africa", "Southeast Asia"], correct: 0 },
  { question: "Strategy emphasizes", choices: ["Bonus turn chains and capture timing", "Pure luck", "Pawn push", "Drops"], correct: 0 },
  { question: "Kalah is classified as a", choices: ["Mancala/sowing game", "Race game", "Card game", "Connection game"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: KalahQuizSettings): KalahQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KalahQuizState, action: KalahQuizAction): KalahQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KalahQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
