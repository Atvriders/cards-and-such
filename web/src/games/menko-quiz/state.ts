import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MenkoQuizSettings { questions: "10"; }
export interface MenkoQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MenkoQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Menko is a game where players?", choices: ["Match cards by color", "Flip opponent's cards by slapping nearby", "Build poker hands", "Solve puzzles"], correct: 1 },
  { question: "Menko cards are made of?", choices: ["Plastic", "Thick cardboard or wood", "Cloth", "Metal"], correct: 1 },
  { question: "What happens to a flipped card?", choices: ["Discarded", "Captured by the player who flipped it", "Returned to owner", "Reversed"], correct: 1 },
  { question: "Menko is most popular in?", choices: ["China", "Japan", "Korea", "Thailand"], correct: 1 },
  { question: "Menko cards traditionally feature?", choices: ["Anime characters, samurai, or animals", "Roman numerals", "Calligraphy only", "Blank backs"], correct: 0 },
  { question: "Menko is typically played by?", choices: ["Adults only", "Children, often boys", "Professional clubs", "Solo players"], correct: 1 },
  { question: "The action of slamming the card creates?", choices: ["A wind force that flips opponents", "Magic energy", "A point reward", "A pair check"], correct: 0 },
  { question: "Menko is similar to which Korean game?", choices: ["Hwatu", "Ddakji", "Yutnori", "Janggi"], correct: 1 },
  { question: "Round (maru) and rectangular (kaku) are types of?", choices: ["Menko shape", "Menko tournament", "Menko score", "Menko grade"], correct: 0 },
  { question: "Menko's popularity peaked in which era in Japan?", choices: ["Edo", "Meiji to Showa", "Heian", "Reiwa"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MenkoQuizSettings): MenkoQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MenkoQuizState, action: MenkoQuizAction): MenkoQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MenkoQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
