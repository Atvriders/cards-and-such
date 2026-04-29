import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ShengJiQuizSettings { questions: "10"; }
export interface ShengJiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ShengJiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Sheng Ji is also known as?", choices: ["Tractor or Upgrade", "Snake", "Dragon", "Dynasty"], correct: 0 },
  { question: "How many decks are typically used?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Sheng Ji is usually played by how many players?", choices: ["2", "3", "4", "6"], correct: 2 },
  { question: "Players play in?", choices: ["Solo", "Partnerships", "Free-for-all", "Three teams"], correct: 1 },
  { question: "What does 'Sheng Ji' mean in Chinese?", choices: ["Fight the king", "Level up", "Royal flush", "Long road"], correct: 1 },
  { question: "Cards earning points typically include?", choices: ["5s, 10s, and Kings", "Aces", "Jacks", "Threes"], correct: 0 },
  { question: "The trump suit each round is determined by?", choices: ["Last trick winner", "The declarer's current level", "Random draw", "Card with highest face"], correct: 1 },
  { question: "A 'tractor' in Sheng Ji refers to?", choices: ["Two consecutive pairs of trumps", "A bomb", "A solo run", "Doubled cards"], correct: 0 },
  { question: "The game can take how long to complete?", choices: ["Five minutes", "An hour or more", "A single round", "Three rounds"], correct: 1 },
  { question: "Sheng Ji partnerships try to?", choices: ["Capture as many point cards as possible", "Eliminate opponents", "Bid the highest", "Empty hands quickly"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ShengJiQuizSettings): ShengJiQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ShengJiQuizState, action: ShengJiQuizAction): ShengJiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ShengJiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
