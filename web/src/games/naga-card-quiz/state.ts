import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NagaCardSettings { questions: "10"; }
export interface NagaCardState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NagaCardAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Naga card game originates from which country?", choices: ["Vietnam","Cambodia","Thailand","Laos"], correct: 2 },
  { question: "What does 'naga' mean in Thai?", choices: ["Mountain","Serpent / snake","Fire","Sky"], correct: 1 },
  { question: "The Naga card game is designed primarily for?", choices: ["Adults","Children","Casinos","Tournaments"], correct: 1 },
  { question: "The main mechanic of Naga is?", choices: ["Colour matching","Memorisation","Trick-taking","Auction"], correct: 0 },
  { question: "A 'naga' chain is built by matching what?", choices: ["Numbers","Colours","Animals","Letters"], correct: 1 },
  { question: "How many players typically play Naga?", choices: ["1","2-6","8+","12"], correct: 1 },
  { question: "Nagas in Thai mythology live where?", choices: ["Mountains","Sky","Rivers / underwater","Forests"], correct: 2 },
  { question: "The chain longest at game end is usually?", choices: ["Penalised","Rewarded","Discarded","Ignored"], correct: 1 },
  { question: "Naga cards usually come in how many colours?", choices: ["3","4-6","8","12"], correct: 1 },
  { question: "Naga is similar in concept to which Western game?", choices: ["Snap","Uno","Bridge","Solitaire"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: NagaCardSettings): NagaCardState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NagaCardState, action: NagaCardAction): NagaCardState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NagaCardState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
