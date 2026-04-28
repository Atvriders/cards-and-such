import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SubwaysQuizSettings { questions: "10" | "20" | "30"; }
export interface SubwaysQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SubwaysQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "World first underground passenger railway opened in?", choices: ["Paris 1900", "London 1863", "New York 1904", "Berlin 1902"], correct: 1 },
  { question: "NYC subway opened in?", choices: ["1898", "1904", "1916", "1925"], correct: 1 },
  { question: "Paris Métro opened in?", choices: ["1898", "1900", "1908", "1912"], correct: 1 },
  { question: "Moscow Metro opened in?", choices: ["1929", "1935", "1948", "1955"], correct: 1 },
  { question: "Tokyo Metro oldest line is?", choices: ["Marunouchi", "Ginza", "Yamanote", "Hibiya"], correct: 1 },
  { question: "Seoul subway opened first line in?", choices: ["1968", "1974", "1981", "1988"], correct: 1 },
  { question: "Beijing Subway opened in?", choices: ["1965", "1969", "1981", "1990"], correct: 1 },
  { question: "NYC subway uses what voltage (third rail)?", choices: ["450 V", "600 V", "750 V", "1500 V"], correct: 2 },
  { question: "Largest metro by length (2020s) is?", choices: ["Shanghai", "Beijing", "Moscow", "Tokyo"], correct: 0 },
  { question: "London Underground oldest line?", choices: ["Metropolitan", "Bakerloo", "Central", "District"], correct: 0 },
  { question: "Pneu sur fer (rubber-tyred metro) used in?", choices: ["Berlin", "Paris", "Madrid", "Rome"], correct: 1 },
  { question: "Stockholm metro is famous for?", choices: ["Speed", "Cave-art stations", "Wood", "Length"], correct: 1 },
  { question: "MTR is the metro of?", choices: ["Singapore", "Hong Kong", "Taipei", "Shanghai"], correct: 1 },
  { question: "Singapore MRT opened in?", choices: ["1981", "1987", "1992", "2001"], correct: 1 },
  { question: "Driverless metros first appeared notably in?", choices: ["Lille", "Paris", "Tokyo", "Singapore"], correct: 0 },
  { question: "NYC subway operator is?", choices: ["MBTA", "MTA", "PATH", "NJ Transit"], correct: 1 },
  { question: "BART (Bay Area) opened in?", choices: ["1968", "1972", "1976", "1980"], correct: 1 },
  { question: "Washington Metro opened in?", choices: ["1972", "1976", "1980", "1984"], correct: 1 },
  { question: "Mexico City Metro opened in?", choices: ["1965", "1969", "1971", "1975"], correct: 1 },
  { question: "São Paulo Metro opened in?", choices: ["1968", "1974", "1981", "1990"], correct: 1 },
  { question: "Subway gauge in NYC is?", choices: ["Standard", "Broad", "Narrow", "Mixed"], correct: 0 },
  { question: "\"Tube\" nickname comes from?", choices: ["Trains", "Tunnels", "Stations", "Color"], correct: 1 },
  { question: "Oyster card is used in?", choices: ["Paris", "London", "Tokyo", "Rome"], correct: 1 },
  { question: "Suica card is used in?", choices: ["Tokyo", "Seoul", "HK", "Beijing"], correct: 0 },
  { question: "Toronto Subway opened in?", choices: ["1948", "1954", "1960", "1966"], correct: 1 },
  { question: "Chicago \"L\" stands for?", choices: ["Local", "Loop", "Lake", "Elevated"], correct: 3 },
  { question: "Madrid Metro is operated by?", choices: ["ATAC", "RATP", "Metro de Madrid", "Renfe"], correct: 2 },
  { question: "Berlin U-Bahn opened in?", choices: ["1898", "1902", "1908", "1912"], correct: 1 },
  { question: "Athens Metro line 1 originally opened in?", choices: ["1869", "1881", "1904", "1925"], correct: 1 },
  { question: "Pyongyang Metro is famous for?", choices: ["Speed", "Depth & art", "Length", "Branches"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SubwaysQuizSettings): SubwaysQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SubwaysQuizState, action: SubwaysQuizAction): SubwaysQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SubwaysQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
