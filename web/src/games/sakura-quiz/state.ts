import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SakuraSettings { questions: "10"; }
export interface SakuraState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SakuraAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Sakura is designed primarily as a?", choices: ["Tournament Hanafuda", "Children's Karuta", "Western-friendly Hanafuda", "Casino dice game"], correct: 2 },
  { question: "The Japanese word 'Sakura' refers to?", choices: ["Pine", "Cherry blossom", "Plum", "Wisteria"], correct: 1 },
  { question: "Cherry blossom is the suit for which month in Hanafuda?", choices: ["February", "March", "April", "May"], correct: 1 },
  { question: "Sakura uses which scoring approach compared to Koi-Koi?", choices: ["More yaku", "Simpler captured-card counts", "Bidding", "Trick-taking"], correct: 1 },
  { question: "A Sakura player wins by?", choices: ["Completing yaku", "Holding most points in captured cards", "Calling 'Koi'", "Discarding all"], correct: 1 },
  { question: "Sakura preserves the Hanafuda concept of?", choices: ["Trump suits", "Twelve months as suits", "Trick-taking", "Auctions"], correct: 1 },
  { question: "Sakura art is usually?", choices: ["Traditional Japanese", "Western watercolour", "Manga", "Pixel"], correct: 1 },
  { question: "Sakura is most useful as?", choices: ["Pro tournament tool", "Teaching tool", "Gambling currency", "Solo puzzle"], correct: 1 },
  { question: "Compared to Hana Awase, Sakura adds?", choices: ["Bidding", "Light scoring objectives", "Trick-taking", "Dice"], correct: 1 },
  { question: "A Sakura deck still contains how many cards?", choices: ["32", "40", "48", "52"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SakuraSettings): SakuraState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SakuraState, action: SakuraAction): SakuraState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SakuraState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
