import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EuropeanCitiesQuizSettings { questions: "10" | "20" | "30"; }
export interface EuropeanCitiesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EuropeanCitiesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which country contains the city of Florence?", choices: ["Spain","Italy","Greece","France"], correct: 1 },
  { question: "Country of Berlin?", choices: ["Austria","Switzerland","Germany","Netherlands"], correct: 2 },
  { question: "Country of Vienna?", choices: ["Austria","Hungary","Czech Republic","Slovakia"], correct: 0 },
  { question: "Country of Lisbon?", choices: ["Spain","Portugal","Italy","France"], correct: 1 },
  { question: "Country of Helsinki?", choices: ["Sweden","Norway","Finland","Denmark"], correct: 2 },
  { question: "Country of Copenhagen?", choices: ["Norway","Sweden","Iceland","Denmark"], correct: 3 },
  { question: "Country of Amsterdam?", choices: ["Belgium","Netherlands","Germany","Luxembourg"], correct: 1 },
  { question: "Country of Brussels?", choices: ["Netherlands","Luxembourg","Belgium","France"], correct: 2 },
  { question: "Country of Dublin?", choices: ["UK","Ireland","Iceland","Scotland"], correct: 1 },
  { question: "Country of Edinburgh?", choices: ["Ireland","Wales","Scotland","England"], correct: 2 },
  { question: "Country of Reykjavik?", choices: ["Norway","Greenland","Iceland","Faroe Islands"], correct: 2 },
  { question: "Country of Athens?", choices: ["Greece","Cyprus","Turkey","Albania"], correct: 0 },
  { question: "Country of Budapest?", choices: ["Romania","Hungary","Slovakia","Bulgaria"], correct: 1 },
  { question: "Country of Bucharest?", choices: ["Bulgaria","Hungary","Romania","Serbia"], correct: 2 },
  { question: "Country of Warsaw?", choices: ["Czech Republic","Slovakia","Poland","Belarus"], correct: 2 },
  { question: "Country of Prague?", choices: ["Slovakia","Czech Republic","Poland","Austria"], correct: 1 },
  { question: "Country of Bratislava?", choices: ["Slovakia","Czech Republic","Hungary","Croatia"], correct: 0 },
  { question: "Country of Ljubljana?", choices: ["Croatia","Slovenia","Slovakia","Bosnia"], correct: 1 },
  { question: "Country of Zagreb?", choices: ["Slovenia","Bosnia","Croatia","Serbia"], correct: 2 },
  { question: "Country of Sarajevo?", choices: ["Croatia","Bosnia and Herzegovina","Serbia","Montenegro"], correct: 1 },
  { question: "Country of Belgrade?", choices: ["Bosnia","Romania","Serbia","Bulgaria"], correct: 2 },
  { question: "Country of Sofia?", choices: ["Romania","Greece","Bulgaria","Serbia"], correct: 2 },
  { question: "Country of Tirana?", choices: ["Albania","Bulgaria","Macedonia","Greece"], correct: 0 },
  { question: "Country of Tallinn?", choices: ["Latvia","Lithuania","Estonia","Finland"], correct: 2 },
  { question: "Country of Riga?", choices: ["Lithuania","Latvia","Estonia","Belarus"], correct: 1 },
  { question: "Country of Vilnius?", choices: ["Estonia","Latvia","Lithuania","Belarus"], correct: 2 },
  { question: "Country of Minsk?", choices: ["Russia","Belarus","Ukraine","Lithuania"], correct: 1 },
  { question: "Country of Kiev (Kyiv)?", choices: ["Russia","Ukraine","Belarus","Moldova"], correct: 1 },
  { question: "Country of Chisinau?", choices: ["Moldova","Ukraine","Romania","Belarus"], correct: 0 },
  { question: "Country of Valletta?", choices: ["Malta","Cyprus","Sicily","Crete"], correct: 0 },
  { question: "Country of Nicosia?", choices: ["Greece","Turkey","Cyprus","Malta"], correct: 2 },
  { question: "Country of Andorra la Vella?", choices: ["Andorra","Liechtenstein","Monaco","San Marino"], correct: 0 },
  { question: "Country of Vaduz?", choices: ["Andorra","Liechtenstein","Monaco","Luxembourg"], correct: 1 },
  { question: "Country of Monaco-Ville?", choices: ["Monaco","San Marino","Andorra","Vatican"], correct: 0 },
  { question: "Country of Luxembourg City?", choices: ["Belgium","Luxembourg","France","Germany"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EuropeanCitiesQuizSettings): EuropeanCitiesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EuropeanCitiesQuizState, action: EuropeanCitiesQuizAction): EuropeanCitiesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EuropeanCitiesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
