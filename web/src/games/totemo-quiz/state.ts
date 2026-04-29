import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TotemoSettings { questions: "10"; }
export interface TotemoState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TotemoAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The word 'totemo' in Japanese means?", choices: ["Animal","Very","Stack","Card"], correct: 1 },
  { question: "Totemo is what type of game?", choices: ["Trick-taking","Memory + stacking","Bidding","Auction"], correct: 1 },
  { question: "Totemo is targeted at which age group?", choices: ["Adults","Children","Tournament players","Casino visitors"], correct: 1 },
  { question: "A typical Totemo deck features?", choices: ["Numbers","Animals","Plants","Tools"], correct: 1 },
  { question: "The stacking mechanic in Totemo encourages?", choices: ["Bluffing","Memory + dexterity","Solitaire","Speed running"], correct: 1 },
  { question: "A round of Totemo typically lasts how long?", choices: ["Hours","5-15 minutes","Days","Weeks"], correct: 1 },
  { question: "Totemo supports how many players?", choices: ["1 only","2-5","10+","Tournaments only"], correct: 1 },
  { question: "Animals in Totemo typically include?", choices: ["Mythical only","Familiar real animals","Robots","Sea monsters"], correct: 1 },
  { question: "A successful match in Totemo lets the player?", choices: ["Discard","Take and stack the matched cards","Skip a turn","Reset"], correct: 1 },
  { question: "Totemo is especially popular at?", choices: ["Tea ceremonies","Family gatherings","Sumo tournaments","Funerals"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TotemoSettings): TotemoState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TotemoState, action: TotemoAction): TotemoState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TotemoState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
