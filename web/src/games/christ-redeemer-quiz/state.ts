import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChristRedeemerQuizSettings { questions: "10" | "20"; }
export interface ChristRedeemerQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChristRedeemerQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Where is Christ the Redeemer located?", choices: ["Buenos Aires", "Rio de Janeiro, Brazil", "Lima, Peru", "Santiago, Chile"], correct: 1 },
  { question: "On which mountain does Christ the Redeemer stand?", choices: ["Sugarloaf", "Corcovado", "Pão de Açúcar", "Pedra Bonita"], correct: 1 },
  { question: "How tall is the statue (excluding pedestal)?", choices: ["~10m", "~30m", "~60m", "~100m"], correct: 1 },
  { question: "How wide is the statue's outstretched arms?", choices: ["~10m", "~28m", "~50m", "~100m"], correct: 1 },
  { question: "How tall does Christ the Redeemer stand including pedestal?", choices: ["~20m", "~38m", "~60m", "~100m"], correct: 1 },
  { question: "When was the statue completed?", choices: ["1900", "1922", "1931", "1950"], correct: 2 },
  { question: "How long did construction take?", choices: ["1 year", "5 years", "9 years", "20 years"], correct: 2 },
  { question: "Who designed the statue?", choices: ["Heitor da Silva Costa (engineer); Paul Landowski (sculptor)", "Bartholdi", "Gaudí", "Rodin"], correct: 0 },
  { question: "What is the statue made of?", choices: ["Bronze", "Reinforced concrete and soapstone", "Marble", "Iron"], correct: 1 },
  { question: "Approximately how much does the statue weigh?", choices: ["~50 tons", "~635 tons", "~1,000 tons", "~5,000 tons"], correct: 1 },
  { question: "In what year was the statue named a New 7 Wonder?", choices: ["2000", "2007", "2012", "2020"], correct: 1 },
  { question: "What area is the statue in?", choices: ["Tijuca Forest National Park", "Copacabana Beach", "City center", "Rio's harbor"], correct: 0 },
  { question: "How was the soapstone for the statue transported?", choices: ["Trucks", "Train (Corcovado Railway)", "Helicopter", "Donkey"], correct: 1 },
  { question: "Where does the lightning rod system stand?", choices: ["Inside the head", "On the head/extended arm", "Pedestal only", "None"], correct: 1 },
  { question: "How many lightning strikes does it endure annually (approx)?", choices: ["1-2", "About 5", "Several major strikes", "100+"], correct: 2 },
  { question: "Who was the Catholic Cardinal who blessed it?", choices: ["Cardinal Leme", "Pope Pius XI (only sent blessing)", "Cardinal Newman", "Pope John XXIII"], correct: 0 },
  { question: "What religion does Christ the Redeemer represent?", choices: ["Catholicism (Christianity)", "Buddhism", "Hindu", "Spiritism"], correct: 0 },
  { question: "How many people visit annually?", choices: ["~10K", "~200K", "~1.8M", "~10M"], correct: 2 },
  { question: "What ascends visitors to the statue?", choices: ["Cable car", "Funicular train and elevator", "Helicopter only", "Walking only"], correct: 1 },
  { question: "Has the statue been damaged?", choices: ["Never", "Yes, by lightning and weather", "Once burned", "Once toppled"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChristRedeemerQuizSettings): ChristRedeemerQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChristRedeemerQuizState, action: ChristRedeemerQuizAction): ChristRedeemerQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChristRedeemerQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
