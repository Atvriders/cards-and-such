import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AirlineBrandsQuizSettings { questions: "10" | "20" | "30"; }
export interface AirlineBrandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AirlineBrandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Delta Airlines is based in?", choices: ["Chicago", "Atlanta", "Dallas", "Denver"], correct: 1 },
  { question: "American Airlines' main hub?", choices: ["Chicago O'Hare", "Dallas/Fort Worth", "JFK", "LAX"], correct: 1 },
  { question: "United's primary hub?", choices: ["Atlanta", "Chicago", "Houston", "Newark"], correct: 1 },
  { question: "Lufthansa is the flag carrier of?", choices: ["Germany", "Austria", "Switzerland", "Netherlands"], correct: 0 },
  { question: "Air France is from?", choices: ["Spain", "France", "Italy", "Belgium"], correct: 1 },
  { question: "British Airways hub?", choices: ["Manchester", "London Heathrow", "London Gatwick", "London Stansted"], correct: 1 },
  { question: "Emirates is based in?", choices: ["Doha", "Dubai", "Abu Dhabi", "Riyadh"], correct: 1 },
  { question: "Qatar Airways hub?", choices: ["Dubai", "Doha", "Manama", "Riyadh"], correct: 1 },
  { question: "Singapore Airlines' hub?", choices: ["Kuala Lumpur", "Bangkok", "Singapore Changi", "Hong Kong"], correct: 2 },
  { question: "Cathay Pacific is from?", choices: ["Singapore", "Hong Kong", "Taiwan", "Macau"], correct: 1 },
  { question: "Qantas is the flag carrier of?", choices: ["New Zealand", "Australia", "Indonesia", "Fiji"], correct: 1 },
  { question: "Air New Zealand's hub?", choices: ["Wellington", "Auckland", "Christchurch", "Sydney"], correct: 1 },
  { question: "JAL stands for?", choices: ["Japan Air Lines", "Joint Asia Lines", "Jet Asia Limited", "Japanese Aero Lines"], correct: 0 },
  { question: "Pan Am ceased operations in?", choices: ["1981", "1991", "2001", "2011"], correct: 1 },
  { question: "TWA was acquired by?", choices: ["Delta", "United", "American", "Continental"], correct: 2 },
  { question: "KLM is from?", choices: ["Belgium", "Netherlands", "Norway", "Denmark"], correct: 1 },
  { question: "SAS serves which region?", choices: ["Eastern Europe", "Scandinavia", "Iberia", "Balkans"], correct: 1 },
  { question: "Iberia is the flag carrier of?", choices: ["Italy", "Spain", "Portugal", "Greece"], correct: 1 },
  { question: "Alitalia was the flag carrier of?", choices: ["Italy", "Greece", "Albania", "Cyprus"], correct: 0 },
  { question: "Ryanair is based in?", choices: ["UK", "Ireland", "France", "Spain"], correct: 1 },
  { question: "easyJet hub?", choices: ["Heathrow", "Luton", "Stansted", "Gatwick"], correct: 1 },
  { question: "Southwest Airlines is famous for?", choices: ["Long-haul", "Low-cost domestic", "Cargo", "Charter only"], correct: 1 },
  { question: "JetBlue's hub?", choices: ["Atlanta", "JFK", "LAX", "Miami"], correct: 1 },
  { question: "Spirit Airlines is known for?", choices: ["Luxury", "Ultra low-cost", "Cargo", "Long haul only"], correct: 1 },
  { question: "Air India is from?", choices: ["Pakistan", "India", "Bangladesh", "Sri Lanka"], correct: 1 },
  { question: "Aeroflot is from?", choices: ["Belarus", "Russia", "Ukraine", "Kazakhstan"], correct: 1 },
  { question: "Ethiopian Airlines' hub?", choices: ["Nairobi", "Addis Ababa", "Cairo", "Lagos"], correct: 1 },
  { question: "Korean Air is from?", choices: ["North Korea", "South Korea", "Japan", "China"], correct: 1 },
  { question: "China Southern hub?", choices: ["Beijing", "Guangzhou", "Shanghai", "Chengdu"], correct: 1 },
  { question: "Concorde was operated by BA and?", choices: ["Lufthansa", "Air France", "Iberia", "Alitalia"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AirlineBrandsQuizSettings): AirlineBrandsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AirlineBrandsQuizState, action: AirlineBrandsQuizAction): AirlineBrandsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AirlineBrandsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
