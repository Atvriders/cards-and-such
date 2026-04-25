import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface CapitalsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type CapitalsQuizAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" };
export interface CapitalsQuizSettings { questions: "10"|"20" }
const ALL_QUESTIONS: QuizQuestion[] = [
  { question:"What is the capital of Australia?", choices:["Sydney","Melbourne","Canberra","Brisbane"], correct:2 },
  { question:"What is the capital of Brazil?", choices:["Rio de Janeiro","São Paulo","Salvador","Brasília"], correct:3 },
  { question:"What is the capital of Canada?", choices:["Toronto","Vancouver","Ottawa","Montreal"], correct:2 },
  { question:"What is the capital of Japan?", choices:["Osaka","Kyoto","Hiroshima","Tokyo"], correct:3 },
  { question:"What is the capital of South Africa?", choices:["Cape Town","Johannesburg","Pretoria","Durban"], correct:2 },
  { question:"What is the capital of Germany?", choices:["Munich","Hamburg","Frankfurt","Berlin"], correct:3 },
  { question:"What is the capital of India?", choices:["Mumbai","New Delhi","Kolkata","Chennai"], correct:1 },
  { question:"What is the capital of Mexico?", choices:["Guadalajara","Monterrey","Mexico City","Puebla"], correct:2 },
  { question:"What is the capital of Egypt?", choices:["Alexandria","Luxor","Giza","Cairo"], correct:3 },
  { question:"What is the capital of Argentina?", choices:["Córdoba","Rosario","Buenos Aires","Mendoza"], correct:2 },
  { question:"What is the capital of Russia?", choices:["St. Petersburg","Kazan","Novosibirsk","Moscow"], correct:3 },
  { question:"What is the capital of Nigeria?", choices:["Lagos","Kano","Ibadan","Abuja"], correct:3 },
  { question:"What is the capital of Turkey?", choices:["Istanbul","Izmir","Bursa","Ankara"], correct:3 },
  { question:"What is the capital of Indonesia?", choices:["Surabaya","Bandung","Medan","Jakarta"], correct:3 },
  { question:"What is the capital of South Korea?", choices:["Busan","Incheon","Daegu","Seoul"], correct:3 },
  { question:"What is the capital of Spain?", choices:["Barcelona","Seville","Valencia","Madrid"], correct:3 },
  { question:"What is the capital of Netherlands?", choices:["Rotterdam","Utrecht","The Hague","Amsterdam"], correct:3 },
  { question:"What is the capital of New Zealand?", choices:["Auckland","Christchurch","Dunedin","Wellington"], correct:3 },
  { question:"What is the capital of Pakistan?", choices:["Karachi","Lahore","Rawalpindi","Islamabad"], correct:3 },
  { question:"What is the capital of Switzerland?", choices:["Zurich","Geneva","Lausanne","Bern"], correct:3 },
];
function shuffle<T>(arr: T[], rng: ()=>number): T[] { const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CapitalsQuizSettings): CapitalsQuizState {
  const rng=mulberry32(seed);const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const indexed=q.choices.map((c,i)=>({c,i}));const sh=shuffle(indexed,rng);const newCorrect=sh.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:sh.map(x=>x.c) as [string,string,string,string],correct:newCorrect};});
  return { questions, currentIndex:0, selected:null, submitted:false, score:0, correctCount:0, phase:"playing" };
}
export function reducer(state: CapitalsQuizState, action: CapitalsQuizAction): CapitalsQuizState {
  if(state.phase==="done") return state;
  switch(action.type){
    case "select": return state.submitted?state:{...state,selected:action.choice};
    case "submit": {if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;return{...state,submitted:true,score:state.score+(ok?100:0),correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "next": {const next=state.currentIndex+1;if(next>=state.questions.length)return{...state,phase:"done"};return{...state,currentIndex:next,selected:null,submitted:false,phase:"playing"};}
    default: return state;
  }
}
export function isTerminal(state: CapitalsQuizState): { score:number }|null { return state.phase==="done"?{score:state.score}:null; }
