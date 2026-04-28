import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KoiKoiSettings { questions: "10"; }
export interface KoiKoiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KoiKoiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many cards are in a Hanafuda deck?", choices: ["40", "48", "52", "54"], correct: 1 },
  { question: "The phrase 'Koi-Koi' literally means?", choices: ["Come on, come on", "Match again", "Flowers bloom", "Same again"], correct: 0 },
  { question: "A Hanafuda deck is divided into how many suits?", choices: ["10", "12", "13", "14"], correct: 1 },
  { question: "What does each Hanafuda suit represent?", choices: ["A samurai clan", "A month of the year", "A Japanese province", "A flower festival"], correct: 1 },
  { question: "Which yaku is formed by the boar, deer, and butterfly cards?", choices: ["Hanami-zake", "Tsukimi-zake", "Inoshikacho", "Akatan"], correct: 2 },
  { question: "The 'Tsukimi-zake' yaku requires which two cards?", choices: ["Moon and sake cup", "Crane and pine", "Bird and wisteria", "Cherry curtain and moon"], correct: 0 },
  { question: "The highest single card category in Hanafuda is called?", choices: ["Tane", "Kasu", "Tan", "Hikari"], correct: 3 },
  { question: "How many Hikari (light) cards are there?", choices: ["3", "4", "5", "6"], correct: 2 },
  { question: "A round of Koi-Koi typically continues until?", choices: ["12 months pass", "Cards run out", "All matches resolve", "A fixed turn count"], correct: 1 },
  { question: "When you call 'Koi-Koi', the consequence is that?", choices: ["You score double", "You play on for more, but opponent doubles if they win", "You skip a turn", "You reveal cards"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: KoiKoiSettings): KoiKoiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KoiKoiState, action: KoiKoiAction): KoiKoiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KoiKoiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
