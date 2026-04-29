import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KabuHanafudaSettings { questions: "10"; }
export interface KabuHanafudaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KabuHanafudaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What does 'kabu' refer to in this game?", choices: ["A flower","A score of nine","A losing hand","A bonus card"], correct: 1 },
  { question: "How many cards are in the Hanafuda deck used?", choices: ["32","40","48","52"], correct: 2 },
  { question: "The score is computed as the sum modulo what number?", choices: ["7","9","10","12"], correct: 2 },
  { question: "Hanafuda Kabu most resembles which Western game?", choices: ["Bridge","Baccarat","Poker","Spades"], correct: 1 },
  { question: "A hand totalling 19 has what kabu score?", choices: ["1","9","10","0"], correct: 1 },
  { question: "Hanafuda Kabu is closely related to which Kabufuda game?", choices: ["Oicho-Kabu","Tehonbiki","Sakura","Hwatu"], correct: 0 },
  { question: "The worst possible score in Kabu is?", choices: ["1","0","9","10"], correct: 1 },
  { question: "Which suit feature affects scoring in Kabu?", choices: ["Card colour","Suit value (1-12)","Card art","Card edges"], correct: 1 },
  { question: "Kabu is traditionally played at what social occasion?", choices: ["New Year","Tea ceremony","Weddings","Funerals"], correct: 0 },
  { question: "The dealer in Kabu is typically called?", choices: ["Banker","Kuji","Shoshi","Oya"], correct: 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: KabuHanafudaSettings): KabuHanafudaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KabuHanafudaState, action: KabuHanafudaAction): KabuHanafudaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KabuHanafudaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
