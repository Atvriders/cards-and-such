import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CeeLoQuizSettings { questions: "10"; }
export interface CeeLoQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CeeLoQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Cee-Lo is played with how many dice?", choices: ["1", "2", "3", "5"], correct: 2 },
  { question: "Which roll automatically wins?", choices: ["1-2-3", "4-5-6", "Triples only", "Snake eyes"], correct: 1 },
  { question: "Which roll automatically loses?", choices: ["1-2-3", "4-5-6", "Triples", "Doubles"], correct: 0 },
  { question: "Triples (e.g., 5-5-5) are ranked?", choices: ["Below pairs", "Above pairs but below 4-5-6", "Below 1-2-3", "All triples lose"], correct: 1 },
  { question: "Cee-Lo originated in which country?", choices: ["Korea", "Japan", "China", "Thailand"], correct: 2 },
  { question: "A 'point' roll consists of?", choices: ["A pair plus an odd die", "Three matching dice", "Two odd dice", "A pair plus a 'point' die"], correct: 3 },
  { question: "Cee-Lo is mainly a ___ game.", choices: ["Strategy", "Gambling / chance", "Skill-based", "Bluffing"], correct: 1 },
  { question: "The score on a 'point' roll is?", choices: ["The total of all three dice", "The value of the odd die", "The pair number", "Always 6"], correct: 1 },
  { question: "A roll of 6-6-6 is called?", choices: ["Stinker", "The highest triple in many rules", "Snake", "Boxcars"], correct: 1 },
  { question: "Cee-Lo is a popular?", choices: ["Casino-only game", "Street and casual gambling game", "Family board game", "Solo solitaire"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CeeLoQuizSettings): CeeLoQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CeeLoQuizState, action: CeeLoQuizAction): CeeLoQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CeeLoQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
