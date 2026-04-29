import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HuaQuanSettings { questions: "10"; }
export interface HuaQuanState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HuaQuanAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Hua Quan literally translates to?", choices: ["Flower fist","Cup guess","Hand cup","Drinking shout"], correct: 0 },
  { question: "Hua Quan is which type of game?", choices: ["Card","Finger-guessing drinking game","Board","Dice"], correct: 1 },
  { question: "The game is played simultaneously by how many players?", choices: ["1","2 (mostly)","4","8"], correct: 1 },
  { question: "Each player throws how many fingers each round?", choices: ["A fixed number","0-5 of their choosing","Always 5","Always 1"], correct: 1 },
  { question: "Players shout out their guess of?", choices: ["The combined total","Their own count","The opponent's count","A random number"], correct: 0 },
  { question: "The losing player traditionally?", choices: ["Wins points","Drinks","Cheers loudly","Sits out"], correct: 1 },
  { question: "Hua Quan is most popular at?", choices: ["Funerals","Banquets and toasts","School","Funerals only"], correct: 1 },
  { question: "The drink in Hua Quan is usually?", choices: ["Beer","Rice wine / baijiu","Coffee","Soda"], correct: 1 },
  { question: "A correct guess in Hua Quan is?", choices: ["Higher than the truth","Equal to the combined finger total","Lower","Lucky"], correct: 1 },
  { question: "Hua Quan is similar in spirit to which Western game?", choices: ["Bridge","Rock-paper-scissors","Bingo","Trivia"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HuaQuanSettings): HuaQuanState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HuaQuanState, action: HuaQuanAction): HuaQuanState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HuaQuanState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
