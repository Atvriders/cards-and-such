import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface ItalyCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ItalyCultureQuizSettings { questions: "10" | "20"; }
export interface ItalyCultureQuizState { questions: ItalyCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ItalyCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: ItalyCultureQuizQuestion[] = [
  { question: "What is the capital of Italy?", choices: ["Milan","Naples","Rome","Florence"], correct: 2 },
  { question: "Who painted the Sistine Chapel ceiling?", choices: ["Raphael","Michelangelo","Da Vinci","Botticelli"], correct: 1 },
  { question: "Pizza Margherita originated in?", choices: ["Rome","Milan","Naples","Florence"], correct: 2 },
  { question: "Carbonara contains which key ingredient?", choices: ["Cream","Eggs","Tomato","Pesto"], correct: 1 },
  { question: "The Colosseum was built in which city?", choices: ["Rome","Verona","Pisa","Naples"], correct: 0 },
  { question: "Which composer wrote 'La Traviata'?", choices: ["Puccini","Verdi","Rossini","Donizetti"], correct: 1 },
  { question: "Italy's currency before the euro was?", choices: ["Lira","Mark","Franc","Peseta"], correct: 0 },
  { question: "Tuscany's main city is?", choices: ["Pisa","Siena","Florence","Lucca"], correct: 2 },
  { question: "Which is a fortified Italian wine?", choices: ["Marsala","Chianti","Prosecco","Soave"], correct: 0 },
  { question: "Italy unified in?", choices: ["1815","1861","1871","1900"], correct: 1 },
  { question: "Mt. Vesuvius destroyed which city in 79 CE?", choices: ["Pompeii","Herculaneum","Both","Naples"], correct: 2 },
  { question: "Ferrari is based in?", choices: ["Milan","Maranello","Turin","Bologna"], correct: 1 },
  { question: "Which dish is typically eaten on Christmas Eve?", choices: ["Lasagna","Seafood feast","Risotto","Pizza"], correct: 1 },
  { question: "Florence's famous river is?", choices: ["Po","Tiber","Arno","Adige"], correct: 2 },
  { question: "The leaning tower is in?", choices: ["Pisa","Florence","Bologna","Lucca"], correct: 0 },
  { question: "Sicily is in which sea?", choices: ["Adriatic","Tyrrhenian/Mediterranean","Aegean","Ionian"], correct: 1 },
  { question: "Italy's national football kit color is?", choices: ["Red","Blue","Green","White"], correct: 1 },
  { question: "Espresso originated in?", choices: ["France","Italy","Spain","Austria"], correct: 1 },
  { question: "Pope Francis lives in?", choices: ["Vatican City","Rome","Florence","Bologna"], correct: 0 },
  { question: "Marco Polo was from?", choices: ["Genoa","Venice","Pisa","Florence"], correct: 1 },
  { question: "Tiramisu means?", choices: ["Pull me up","Strong taste","Sweet cake","Coffee"], correct: 0 },
  { question: "Which luxury car brand is Italian?", choices: ["BMW","Lamborghini","Bugatti","Bentley"], correct: 1 },
  { question: "Giuseppe Garibaldi was a?", choices: ["Composer","General","Painter","Pope"], correct: 1 },
  { question: "Lake Como is in which region?", choices: ["Tuscany","Piedmont","Lombardy","Veneto"], correct: 2 },
  { question: "Italian fashion week takes place in?", choices: ["Rome","Florence","Milan","Naples"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ItalyCultureQuizSettings): ItalyCultureQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ItalyCultureQuizState, action: ItalyCultureQuizAction): ItalyCultureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ItalyCultureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
