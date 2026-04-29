import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChwaziSettings { questions: "10"; }
export interface ChwaziState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChwaziAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Chwazi originated from which country?", choices: ["Japan","Korea","China","Vietnam"], correct: 1 },
  { question: "Chwazi is best categorised as?", choices: ["Card game","Decision-randomizer mini-game","Board game","Sports game"], correct: 1 },
  { question: "Chwazi uses what input mechanism?", choices: ["Dice","Touchscreen finger placement","Cards","Coins"], correct: 1 },
  { question: "Players use Chwazi most often to?", choices: ["Score points","Pick someone to do something","Play tournaments","Earn rewards"], correct: 1 },
  { question: "Chwazi randomly selects what?", choices: ["A finger / player","A number","A team","A score"], correct: 0 },
  { question: "Chwazi typically supports how many players?", choices: ["Exactly 2","2 to 10+","16 max","Single only"], correct: 1 },
  { question: "Chwazi is most popular as a?", choices: ["Phone app","Board game","Card deck","TV show"], correct: 0 },
  { question: "Chwazi solves what social problem?", choices: ["Score keeping","Fair quick choice","Long planning","Dispute resolution"], correct: 1 },
  { question: "A typical Chwazi decision takes how long?", choices: ["Hours","A few seconds","Minutes","Days"], correct: 1 },
  { question: "The output of Chwazi is?", choices: ["A list of finishers","One winner highlighted","A point total","A bracket"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ChwaziSettings): ChwaziState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChwaziState, action: ChwaziAction): ChwaziState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChwaziState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
