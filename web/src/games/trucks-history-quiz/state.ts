import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrucksHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface TrucksHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrucksHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Ford Model TT introduced in?", choices: ["1908", "1917", "1925", "1930"], correct: 1 },
  { question: "Ford F-Series launched in?", choices: ["1932", "1948", "1955", "1965"], correct: 1 },
  { question: "Chevrolet half-ton pickup current name?", choices: ["Silverado", "Tundra", "Ram", "Sierra"], correct: 0 },
  { question: "Dodge Ram became its own brand in?", choices: ["2004", "2009", "2012", "2015"], correct: 1 },
  { question: "Peterbilt is based in?", choices: ["Texas", "California", "Oregon", "Tennessee"], correct: 0 },
  { question: "Kenworth nicknamed?", choices: ["Bulldog", "Kenny", "Pete", "Mac"], correct: 1 },
  { question: "Mack Trucks logo is a?", choices: ["Lion", "Bulldog", "Eagle", "Bear"], correct: 1 },
  { question: "Freightliner is owned by?", choices: ["Volvo", "Daimler", "PACCAR", "Ford"], correct: 1 },
  { question: "Volvo VNL is a?", choices: ["Pickup", "Sleeper truck", "Bus", "SUV"], correct: 1 },
  { question: "Cummins is famous for?", choices: ["Gas engines", "Diesel engines", "Tires", "Brakes"], correct: 1 },
  { question: "\"Optimus Prime\" from Transformers was a?", choices: ["Peterbilt 379", "Kenworth W900", "Mack RD", "Freightliner"], correct: 0 },
  { question: "Chevy C/K era ran approximately?", choices: ["1960–1999", "1948–1980", "1973–2002", "1980–2010"], correct: 0 },
  { question: "Ford Super Duty introduced in?", choices: ["1995", "1999", "2002", "2007"], correct: 1 },
  { question: "Toyota Hilux is famous for?", choices: ["Reliability", "Speed", "Luxury", "Off-road racing only"], correct: 0 },
  { question: "Dodge D-series pickups were sold until?", choices: ["1989", "1993", "2000", "1980"], correct: 0 },
  { question: "Studebaker pickup era ended in?", choices: ["1955", "1964", "1972", "1980"], correct: 1 },
  { question: "International Harvester Scout was a?", choices: ["Pickup", "SUV", "Bus", "Semi"], correct: 1 },
  { question: "Ford Lightning was a high-performance?", choices: ["F-150", "F-250", "Ranger", "Super Duty"], correct: 0 },
  { question: "First diesel pickup mass-marketed in U.S.?", choices: ["Cummins Ram", "Ford 6.9 IDI", "Olds Diesel", "Chevy 6.2"], correct: 1 },
  { question: "Chevrolet Avalanche was a?", choices: ["Pickup-SUV hybrid", "Crew bus", "Box van", "Tractor"], correct: 0 },
  { question: "Ford Ranger returned to U.S. in?", choices: ["2017", "2019", "2021", "2015"], correct: 1 },
  { question: "Dodge Power Wagon dates from?", choices: ["1936", "1946", "1956", "1966"], correct: 1 },
  { question: "CB radio peaked in?", choices: ["1960s", "1970s", "1980s", "1990s"], correct: 1 },
  { question: "\"10-4 good buddy\" comes from?", choices: ["Aviation", "Trucking", "Police", "Military"], correct: 1 },
  { question: "DAF trucks come from?", choices: ["UK", "Germany", "Netherlands", "Sweden"], correct: 2 },
  { question: "Tata trucks come from?", choices: ["China", "India", "Korea", "Japan"], correct: 1 },
  { question: "Hino is a subsidiary of?", choices: ["Honda", "Toyota", "Nissan", "Isuzu"], correct: 1 },
  { question: "Iveco is based in?", choices: ["Italy", "Spain", "France", "Germany"], correct: 0 },
  { question: "Tesla Semi unveiled in?", choices: ["2016", "2017", "2019", "2021"], correct: 1 },
  { question: "Largest pickup market in the world?", choices: ["Canada", "U.S.", "China", "Australia"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TrucksHistoryQuizSettings): TrucksHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrucksHistoryQuizState, action: TrucksHistoryQuizAction): TrucksHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrucksHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
