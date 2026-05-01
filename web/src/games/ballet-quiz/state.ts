import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BalletQuizSettings { questions: "10" | "20" | "30"; }
export interface BalletQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BalletQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what country did ballet originate as court dance?", choices: ["Italy","France","Russia","Spain"], correct: 0 },
  { question: "In what country did ballet flourish under royal patronage in 17th c.?", choices: ["France","Italy","England","Germany"], correct: 0 },
  { question: "Who codified classical ballet positions?", choices: ["Pierre Beauchamp","Louis XIV","Marius Petipa","Both Beauchamp and Louis"], correct: 3 },
  { question: "What king founded the first ballet academy in 1661?", choices: ["Louis XIV","Louis XV","Henry IV","Louis XVI"], correct: 0 },
  { question: "What's the basic ballet positions count?", choices: ["5","3","7","10"], correct: 0 },
  { question: "What is a tutu?", choices: ["Ballet skirt","Hat","Shoe","Cape"], correct: 0 },
  { question: "What are pointe shoes?", choices: ["Shoes for dancing on toes","Tap shoes","Soft shoes","Character shoes"], correct: 0 },
  { question: "Who composed Swan Lake?", choices: ["Tchaikovsky","Stravinsky","Prokofiev","Glazunov"], correct: 0 },
  { question: "Who composed The Nutcracker?", choices: ["Tchaikovsky","Stravinsky","Prokofiev","Glazunov"], correct: 0 },
  { question: "Who composed The Sleeping Beauty?", choices: ["Tchaikovsky","Stravinsky","Prokofiev","Saint-Saens"], correct: 0 },
  { question: "Who composed The Rite of Spring?", choices: ["Stravinsky","Tchaikovsky","Prokofiev","Debussy"], correct: 0 },
  { question: "Who composed Romeo and Juliet (ballet)?", choices: ["Prokofiev","Tchaikovsky","Stravinsky","Berlioz"], correct: 0 },
  { question: "Who choreographed many classic ballets at Mariinsky?", choices: ["Marius Petipa","Lev Ivanov","Both","Mikhail Fokine"], correct: 2 },
  { question: "What is the Mariinsky Theatre's city?", choices: ["St. Petersburg","Moscow","Kyiv","Vienna"], correct: 0 },
  { question: "What is the Bolshoi Theatre's city?", choices: ["Moscow","St. Petersburg","Kyiv","Warsaw"], correct: 0 },
  { question: "Who choreographed Rite of Spring premier (1913)?", choices: ["Vaslav Nijinsky","George Balanchine","Marius Petipa","Mikhail Fokine"], correct: 0 },
  { question: "What is plie?", choices: ["Bend at the knees","Jump","Turn","Pose"], correct: 0 },
  { question: "What is pirouette?", choices: ["Spinning turn on one leg","Jump","Bend","Step"], correct: 0 },
  { question: "What is grand jete?", choices: ["Big leap","Spin","Bend","Pose"], correct: 0 },
  { question: "What is a pas de deux?", choices: ["Dance for two","Solo","Group dance","Step combo"], correct: 0 },
  { question: "What style is Balanchine associated with?", choices: ["Neoclassical ballet","Romantic","Contemporary","Folk"], correct: 0 },
  { question: "What U.S. company did Balanchine co-found?", choices: ["New York City Ballet","ABT","Houston Ballet","Boston Ballet"], correct: 0 },
  { question: "Who is Mikhail Baryshnikov?", choices: ["Russian-American ballet star","Choreographer","Dancer","Both - dancer and director"], correct: 0 },
  { question: "Who is Rudolf Nureyev?", choices: ["Russian-born ballet star who defected","Choreographer","Composer","All of these"], correct: 0 },
  { question: "What is the term for ballet vocabulary?", choices: ["French (Italian roots)","Latin","Russian","Italian only"], correct: 0 },
  { question: "What is en pointe?", choices: ["On the tips of the toes","Flat","High step","Bent"], correct: 0 },
  { question: "What's a barre used for?", choices: ["Warming up and exercises","Just decoration","Tying ribbons","Hanging shoes"], correct: 0 },
  { question: "What is contemporary ballet?", choices: ["Modern fusion of classical and modern dance","Pure classical","Folk","Old style"], correct: 0 },
  { question: "Who composed Don Quixote ballet?", choices: ["Ludwig Minkus","Tchaikovsky","Saint-Saens","Strauss"], correct: 0 },
  { question: "Who composed Coppelia?", choices: ["Leo Delibes","Tchaikovsky","Saint-Saens","Massenet"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BalletQuizSettings): BalletQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BalletQuizState, action: BalletQuizAction): BalletQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BalletQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
