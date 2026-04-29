import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TsuroQuizSettings { questions: "10"; }
export interface TsuroQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TsuroQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tsuro is a game of?", choices: ["Trick-taking", "Path-laying / tile placement", "Dice rolling", "Word matching"], correct: 1 },
  { question: "Each player controls a single?", choices: ["Dragon stone marker", "Knight", "Pawn", "Card hand"], correct: 0 },
  { question: "Players are eliminated by?", choices: ["Running out of cards", "Their stone running off the board", "Losing all coins", "Time"], correct: 1 },
  { question: "The goal in Tsuro is to be?", choices: ["First out", "Last stone remaining on the board", "Highest score", "Closest to center"], correct: 1 },
  { question: "Tsuro tiles feature?", choices: ["Letters", "Curving paths and connections", "Bamboo", "Sushi"], correct: 1 },
  { question: "Tsuro plays in approximately?", choices: ["1 hour", "20 minutes", "5 minutes", "3 hours"], correct: 1 },
  { question: "A spin-off variant set on the seas is called?", choices: ["Tsuro of the Seas", "Tsuro Dragon", "Tsuro Sky", "Tsuro Ice"], correct: 0 },
  { question: "Tsuro typically supports how many players?", choices: ["2-4", "2-8", "4 only", "1-3"], correct: 1 },
  { question: "Players draw new tiles from?", choices: ["Their own deck", "A shared face-down stack", "Discard pile", "An online server"], correct: 1 },
  { question: "Tsuro's theme is inspired by?", choices: ["Indian mythology", "Asian / dragon mysticism", "European castles", "Sci-fi"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TsuroQuizSettings): TsuroQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TsuroQuizState, action: TsuroQuizAction): TsuroQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TsuroQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
