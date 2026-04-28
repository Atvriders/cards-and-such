import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SupercarsQuizSettings { questions: "10" | "20" | "30"; }
export interface SupercarsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SupercarsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Lamborghini Miura debuted in?", choices: ["1962", "1966", "1971", "1974"], correct: 1 },
  { question: "Ferrari F40 was built to celebrate?", choices: ["25 years", "30 years", "40 years", "50 years"], correct: 2 },
  { question: "McLaren F1 had how many seats?", choices: ["2", "3", "4", "1"], correct: 1 },
  { question: "Bugatti Veyron top speed (mph)?", choices: ["230", "253", "268", "300"], correct: 1 },
  { question: "Porsche 959 famously won which rally?", choices: ["Monte Carlo", "Paris-Dakar", "Safari", "RAC"], correct: 1 },
  { question: "Pagani Zonda was named after a?", choices: ["Wind", "River", "City", "Mountain"], correct: 0 },
  { question: "Lamborghini Diablo successor was?", choices: ["Murcielago", "Aventador", "Countach", "Gallardo"], correct: 0 },
  { question: "Ferrari Enzo was named after?", choices: ["Designer", "Founder", "Driver", "Engineer"], correct: 1 },
  { question: "Koenigsegg is based in?", choices: ["Norway", "Sweden", "Denmark", "Finland"], correct: 1 },
  { question: "McLaren P1 has what powertrain?", choices: ["V12", "V8 turbo + electric", "W16", "V10"], correct: 1 },
  { question: "Lamborghini Aventador uses what engine?", choices: ["V8", "V10", "V12", "V16"], correct: 2 },
  { question: "Porsche Carrera GT used a V?", choices: ["8", "10", "12", "16"], correct: 1 },
  { question: "Ferrari LaFerrari hybrid uses?", choices: ["V8", "V10", "V12", "V12 + KERS"], correct: 3 },
  { question: "Bugatti Chiron is built in?", choices: ["Italy", "France", "Germany", "Belgium"], correct: 1 },
  { question: "Pagani Huayra is named after?", choices: ["River", "God of wind", "Volcano", "Sea"], correct: 1 },
  { question: "Lamborghini Countach designer?", choices: ["Pininfarina", "Gandini (Bertone)", "Giugiaro", "Zagato"], correct: 1 },
  { question: "Ferrari 250 GTO production?", choices: ["10", "39", "100", "250"], correct: 1 },
  { question: "McLaren Senna pays tribute to?", choices: ["A founder", "A designer", "A driver", "A track"], correct: 2 },
  { question: "Lamborghini Sián is the brand first?", choices: ["EV", "Hybrid", "V8", "Diesel"], correct: 1 },
  { question: "Bugatti EB110 was launched in?", choices: ["1991", "1995", "1999", "2001"], correct: 0 },
  { question: "Aston Martin Valkyrie is co-engineered with?", choices: ["Williams", "Red Bull", "Mercedes", "McLaren"], correct: 1 },
  { question: "Ferrari F50 used what engine?", choices: ["Twin-turbo V8", "NA V12", "V10", "Hybrid V8"], correct: 1 },
  { question: "Lexus LFA produces what sound famously?", choices: ["V12 wail", "V10 banshee", "V8 burble", "I6 hiss"], correct: 1 },
  { question: "Tesla Roadster (2nd gen) advertised 0-60 (s)?", choices: ["1.9", "2.5", "3.0", "4.0"], correct: 0 },
  { question: "Rimac is from?", choices: ["Slovenia", "Croatia", "Hungary", "Czechia"], correct: 1 },
  { question: "Ferrari 288 GTO precedes which legend?", choices: ["F40", "F50", "Enzo", "LaFerrari"], correct: 0 },
  { question: "McLaren 720S produces (hp)?", choices: ["600", "710", "720", "800"], correct: 2 },
  { question: "Porsche 918 Spyder is a hybrid using?", choices: ["I4", "V6", "V8", "V10"], correct: 2 },
  { question: "Lamborghini Veneno was based on?", choices: ["Murcielago", "Aventador", "Diablo", "Countach"], correct: 1 },
  { question: "Hennessey Venom F5 targets top speed (mph)?", choices: ["260", "280", "311", "350"], correct: 2 },
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
