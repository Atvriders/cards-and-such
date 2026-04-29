import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TenshoKarutaSettings { questions: "10"; }
export interface TenshoKarutaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TenshoKarutaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tensho Karuta cards were introduced to Japan by traders from where?", choices: ["China","Korea","Portugal","Spain"], correct: 2 },
  { question: "Tensho Karuta dates from which century?", choices: ["14th","15th","16th","17th"], correct: 2 },
  { question: "The Tensho era falls under which Japanese historical period?", choices: ["Heian","Sengoku/Azuchi-Momoyama","Edo","Meiji"], correct: 1 },
  { question: "Tensho Karuta inspired which later Japanese deck?", choices: ["Tarot","Kabufuda","Mah Jong","Janggi"], correct: 1 },
  { question: "How many suits did the original Tensho deck have?", choices: ["3","4","5","6"], correct: 1 },
  { question: "The original Tensho suits were similar to which European deck?", choices: ["French","Italian","Portuguese","German"], correct: 2 },
  { question: "The word 'karuta' is borrowed from which language?", choices: ["Spanish","Portuguese","Dutch","English"], correct: 1 },
  { question: "Tensho Karuta was eventually banned by which Tokugawa policy?", choices: ["Sakoku isolation","Sword hunt","Edict of expulsion","Land reform"], correct: 0 },
  { question: "A typical Tensho Karuta deck contained how many cards?", choices: ["32","40","48","52"], correct: 2 },
  { question: "What replaced Tensho Karuta after its ban?", choices: ["Western cards","Domestic Japanese variants","Mahjong tiles","Dominoes"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TenshoKarutaSettings): TenshoKarutaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TenshoKarutaState, action: TenshoKarutaAction): TenshoKarutaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TenshoKarutaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
