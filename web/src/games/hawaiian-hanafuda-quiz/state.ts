import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HawaiianHanafudaSettings { questions: "10"; }
export interface HawaiianHanafudaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HawaiianHanafudaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Hawaiian Hanafuda uses what kind of deck?", choices: ["Western 52-card","Hanafuda 48-card","Tarot 78-card","Domino tiles"], correct: 1 },
  { question: "Hawaiian Hanafuda was popularised by which immigrant group?", choices: ["Korean","Filipino","Japanese","Chinese"], correct: 2 },
  { question: "The simplified Hawaiian rules omit which feature?", choices: ["Flower months","Hikari ranking","Complex yaku list","Suits"], correct: 2 },
  { question: "Hawaiian Hanafuda is typically played for how many players?", choices: ["1","2-4","6","8+"], correct: 1 },
  { question: "Which Hanafuda card month corresponds to cherry blossoms?", choices: ["February","March","April","May"], correct: 1 },
  { question: "Hawaii adopted Hanafuda due to immigration starting in which century?", choices: ["18th","19th","20th","21st"], correct: 1 },
  { question: "A common Hawaiian Hanafuda yaku is named after?", choices: ["Surfing","A flower","Volcanoes","The hula"], correct: 1 },
  { question: "The Hawaiian variant retains the standard?", choices: ["48 card count","70 card count","32 card count","40 card count"], correct: 0 },
  { question: "The five Hikari (light) cards are present in Hawaiian Hanafuda: true or false?", choices: ["True","False","Only three are kept","Replaced by stars"], correct: 0 },
  { question: "Hawaiian Hanafuda rules tend to be?", choices: ["Stricter than Koi-Koi","Identical to Koi-Koi","Simpler than Koi-Koi","More complex than Tenhou"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HawaiianHanafudaSettings): HawaiianHanafudaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HawaiianHanafudaState, action: HawaiianHanafudaAction): HawaiianHanafudaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HawaiianHanafudaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
