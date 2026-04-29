import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KabaddiCardSettings { questions: "10"; }
export interface KabaddiCardState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KabaddiCardAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Kabaddi card game is based on which Indian sport?", choices: ["Cricket","Kabaddi","Polo","Hockey"], correct: 1 },
  { question: "Kabaddi's main mechanic in real life is?", choices: ["Throwing a ball","Holding breath while raiding","Hitting wickets","Wrestling"], correct: 1 },
  { question: "In the card abstraction, players represent?", choices: ["Cricket players","Raiders and tacklers","Players in a relay","Pitchers and batters"], correct: 1 },
  { question: "A successful 'raid' in the card game scores?", choices: ["Points","Negative","Zero","Random"], correct: 0 },
  { question: "Kabaddi is the national sport of which country?", choices: ["India","Bangladesh","Sri Lanka","Nepal"], correct: 1 },
  { question: "A typical Kabaddi card game supports how many players?", choices: ["1","2-4","10+","Tournament-only"], correct: 1 },
  { question: "A 'tackle' card defends against?", choices: ["A raid","A serve","A bid","A trump"], correct: 0 },
  { question: "Kabaddi is played professionally in the?", choices: ["NBA","Pro Kabaddi League","MLB","NFL"], correct: 1 },
  { question: "A Kabaddi raid traditionally lasts about?", choices: ["10 seconds","30 seconds (one breath)","5 minutes","An hour"], correct: 1 },
  { question: "A round of Kabaddi card game typically lasts?", choices: ["A few minutes","10-30 minutes","Hours","Days"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: KabaddiCardSettings): KabaddiCardState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KabaddiCardState, action: KabaddiCardAction): KabaddiCardState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KabaddiCardState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
