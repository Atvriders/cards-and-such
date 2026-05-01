import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SupercarsQuizSettings { questions: "10" | "20" | "30"; }
export interface SupercarsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SupercarsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is widely considered the first 'supercar'?", choices: ["Lamborghini Miura (1966)", "Ferrari 250 GTO", "Aston Martin DB5", "Jaguar E-Type"], correct: 0 },
  { question: "The Ferrari F40's top speed?", choices: ["About 201 mph", "180 mph", "220 mph", "190 mph"], correct: 0 },
  { question: "F40 was launched to celebrate Ferrari's?", choices: ["40th anniversary", "50th anniversary", "30th anniversary", "60th anniversary"], correct: 0 },
  { question: "Lamborghini Countach designer?", choices: ["Marcello Gandini", "Giorgetto Giugiaro", "Pininfarina", "Walter de Silva"], correct: 0 },
  { question: "Countach production years?", choices: ["1974-1990", "1980-1995", "1970-1985", "1972-1988"], correct: 0 },
  { question: "McLaren F1's record top speed (1998)?", choices: ["240 mph", "230 mph", "250 mph", "220 mph"], correct: 0 },
  { question: "McLaren F1 designer?", choices: ["Gordon Murray", "Adrian Newey", "Frank Stephenson", "Peter Stevens"], correct: 0 },
  { question: "How many seats does the McLaren F1 have?", choices: ["3 (driver center)", "2", "4", "1"], correct: 0 },
  { question: "Bugatti Veyron's top speed?", choices: ["About 253 mph (Super Sport 268)", "230 mph", "300 mph", "200 mph"], correct: 0 },
  { question: "Bugatti Veyron engine?", choices: ["8.0L W16 quad-turbo", "6.0L V12", "5.0L V10", "4.0L V8"], correct: 0 },
  { question: "Bugatti Chiron Super Sport 300+ broke what speed?", choices: ["304+ mph", "280 mph", "320 mph", "260 mph"], correct: 0 },
  { question: "Koenigsegg is from which country?", choices: ["Sweden", "Norway", "Denmark", "Germany"], correct: 0 },
  { question: "Founder of Koenigsegg?", choices: ["Christian von Koenigsegg", "Christian Karlsson", "Christian Koenig", "Karl von Koenig"], correct: 0 },
  { question: "Koenigsegg Jesko's HP rating?", choices: ["Over 1,500 HP", "1,000 HP", "2,000 HP", "800 HP"], correct: 0 },
  { question: "Pagani is from which country?", choices: ["Italy", "Switzerland", "Argentina (founder)", "Italy (HQ); Argentine founder"], correct: 3 },
  { question: "Pagani founder?", choices: ["Horacio Pagani", "Ettore Pagani", "Giorgio Pagani", "Marco Pagani"], correct: 0 },
  { question: "Pagani Zonda debuted in?", choices: ["1999", "1995", "2003", "2008"], correct: 0 },
  { question: "Pagani Huayra is named after a?", choices: ["Andean wind god", "Argentine river", "Italian poet", "Greek warrior"], correct: 0 },
  { question: "Ferrari LaFerrari engine?", choices: ["6.3L V12 hybrid", "4.5L V8", "3.9L V8 turbo", "5.5L V12"], correct: 0 },
  { question: "McLaren P1 powertrain?", choices: ["3.8L twin-turbo V8 hybrid", "5.0L V12", "4.0L V8 NA", "6.5L V12"], correct: 0 },
  { question: "Porsche 918 Spyder powertrain?", choices: ["4.6L V8 hybrid", "3.8L flat-6 turbo", "6.0L V12", "4.0L V10"], correct: 0 },
  { question: "The 'Holy Trinity' of hybrid hypercars (mid-2010s)?", choices: ["LaFerrari, P1, 918 Spyder", "F40, Diablo, Carrera GT", "Veyron, Chiron, Centenario", "Aventador, 458, F-Type"], correct: 0 },
  { question: "Aston Martin Valkyrie was developed with?", choices: ["Red Bull Racing/Adrian Newey", "Mercedes AMG", "Ferrari", "McLaren"], correct: 0 },
  { question: "Mercedes-AMG One borrows engine from?", choices: ["F1 power unit", "GT3", "Le Mans LMP1", "DTM"], correct: 0 },
  { question: "Lamborghini Aventador engine?", choices: ["6.5L V12 NA", "5.2L V10", "4.0L V8 turbo", "5.5L V12"], correct: 0 },
  { question: "Ferrari 250 GTO was made from?", choices: ["1962-1964 (39 made)", "1965-1968", "1958-1962", "1960-1965"], correct: 0 },
  { question: "Most expensive car ever sold at auction (as of 2022)?", choices: ["Mercedes-Benz 300 SLR Uhlenhaut Coupe ($142M)", "Ferrari 250 GTO", "Bugatti Royale", "Ford GT40"], correct: 0 },
  { question: "Rimac Nevera (Croatia) is what type of supercar?", choices: ["All-electric hyper-EV", "V12 hybrid", "Twin-turbo V8", "Hydrogen fuel cell"], correct: 0 },
  { question: "Lotus Evija is also?", choices: ["All-electric hypercar", "V8 hybrid", "Mid-engine V12", "Turbocharged V6"], correct: 0 },
  { question: "Ford GT (2017) engine?", choices: ["3.5L EcoBoost twin-turbo V6", "5.4L V8", "4.0L V8 turbo", "6.2L V8"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SupercarsQuizSettings): SupercarsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SupercarsQuizState, action: SupercarsQuizAction): SupercarsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SupercarsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
