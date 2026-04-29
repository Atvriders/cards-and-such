import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WariAwaleSettings { questions: "10"; }
export interface WariAwaleState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WariAwaleAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Wari originates from which African region?", choices: ["North Africa","West Africa (Akan / Ghana)","East Africa","South Africa"], correct: 1 },
  { question: "Wari is played by how many players?", choices: ["1","2","4","6"], correct: 1 },
  { question: "Wari belongs to which family of games?", choices: ["Chess family","Mancala family","Rummy family","Domino family"], correct: 1 },
  { question: "The aim of Wari is to capture how many seeds?", choices: ["10","15","25","48"], correct: 2 },
  { question: "A standard Wari board has how many pits per side?", choices: ["4","6","8","10"], correct: 1 },
  { question: "Capturing a pit happens when a sown seed makes the pit total?", choices: ["1","2 or 3","5","Anything even"], correct: 1 },
  { question: "Wari is also widely known as?", choices: ["Mahjong","Awale / Awari / Oware","Kalah","Senet"], correct: 1 },
  { question: "A standard Wari game uses how many seeds in total?", choices: ["32","48","64","100"], correct: 1 },
  { question: "The game emphasises which skill?", choices: ["Memorisation","Counting and planning","Bluffing","Reflexes"], correct: 1 },
  { question: "Wari has been played in Africa for at least how long?", choices: ["50 years","200 years","Several centuries","10,000 years"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: WariAwaleSettings): WariAwaleState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WariAwaleState, action: WariAwaleAction): WariAwaleState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WariAwaleState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
