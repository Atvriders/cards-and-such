import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WorldCapitalsQuizSettings { questions: "10" | "20" | "30"; }
export interface WorldCapitalsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WorldCapitalsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Capital of France?", choices: ["Paris","Lyon","Marseille","Nice"], correct: 0 },
  { question: "Capital of Japan?", choices: ["Osaka","Kyoto","Tokyo","Sapporo"], correct: 2 },
  { question: "Capital of Brazil?", choices: ["Rio","Sao Paulo","Brasilia","Salvador"], correct: 2 },
  { question: "Capital of Australia?", choices: ["Sydney","Melbourne","Canberra","Perth"], correct: 2 },
  { question: "Capital of Egypt?", choices: ["Cairo","Alexandria","Luxor","Giza"], correct: 0 },
  { question: "Capital of Canada?", choices: ["Toronto","Ottawa","Vancouver","Montreal"], correct: 1 },
  { question: "Capital of South Korea?", choices: ["Busan","Seoul","Incheon","Daegu"], correct: 1 },
  { question: "Capital of Argentina?", choices: ["Cordoba","Rosario","Buenos Aires","Mendoza"], correct: 2 },
  { question: "Capital of India?", choices: ["Mumbai","Kolkata","New Delhi","Bangalore"], correct: 2 },
  { question: "Capital of Russia?", choices: ["St. Petersburg","Moscow","Kazan","Sochi"], correct: 1 },
  { question: "Capital of Germany?", choices: ["Munich","Berlin","Hamburg","Frankfurt"], correct: 1 },
  { question: "Capital of Spain?", choices: ["Barcelona","Seville","Madrid","Valencia"], correct: 2 },
  { question: "Capital of Italy?", choices: ["Milan","Rome","Naples","Turin"], correct: 1 },
  { question: "Capital of South Africa (administrative)?", choices: ["Johannesburg","Cape Town","Pretoria","Durban"], correct: 2 },
  { question: "Capital of Mexico?", choices: ["Guadalajara","Mexico City","Monterrey","Puebla"], correct: 1 },
  { question: "Capital of Turkey?", choices: ["Istanbul","Ankara","Izmir","Antalya"], correct: 1 },
  { question: "Capital of Thailand?", choices: ["Bangkok","Chiang Mai","Phuket","Pattaya"], correct: 0 },
  { question: "Capital of Greece?", choices: ["Thessaloniki","Athens","Patras","Heraklion"], correct: 1 },
  { question: "Capital of Norway?", choices: ["Bergen","Oslo","Stavanger","Trondheim"], correct: 1 },
  { question: "Capital of Sweden?", choices: ["Gothenburg","Stockholm","Malmo","Uppsala"], correct: 1 },
  { question: "Capital of Vietnam?", choices: ["Ho Chi Minh","Hanoi","Da Nang","Hue"], correct: 1 },
  { question: "Capital of Kenya?", choices: ["Mombasa","Nairobi","Kisumu","Eldoret"], correct: 1 },
  { question: "Capital of Nigeria?", choices: ["Lagos","Abuja","Ibadan","Kano"], correct: 1 },
  { question: "Capital of Iran?", choices: ["Isfahan","Shiraz","Tehran","Mashhad"], correct: 2 },
  { question: "Capital of Pakistan?", choices: ["Karachi","Lahore","Islamabad","Peshawar"], correct: 2 },
  { question: "Capital of Saudi Arabia?", choices: ["Mecca","Jeddah","Riyadh","Medina"], correct: 2 },
  { question: "Capital of Portugal?", choices: ["Porto","Lisbon","Faro","Coimbra"], correct: 1 },
  { question: "Capital of Netherlands?", choices: ["Rotterdam","The Hague","Amsterdam","Utrecht"], correct: 2 },
  { question: "Capital of New Zealand?", choices: ["Auckland","Wellington","Christchurch","Dunedin"], correct: 1 },
  { question: "Capital of Chile?", choices: ["Valparaiso","Santiago","Concepcion","Antofagasta"], correct: 1 },
  { question: "Capital of Peru?", choices: ["Cusco","Arequipa","Lima","Trujillo"], correct: 2 },
  { question: "Capital of Indonesia?", choices: ["Surabaya","Jakarta","Bandung","Medan"], correct: 1 },
  { question: "Capital of Philippines?", choices: ["Cebu","Davao","Manila","Quezon"], correct: 2 },
  { question: "Capital of Poland?", choices: ["Krakow","Warsaw","Gdansk","Wroclaw"], correct: 1 },
  { question: "Capital of Czech Republic?", choices: ["Brno","Prague","Ostrava","Plzen"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WorldCapitalsQuizSettings): WorldCapitalsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WorldCapitalsQuizState, action: WorldCapitalsQuizAction): WorldCapitalsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WorldCapitalsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
