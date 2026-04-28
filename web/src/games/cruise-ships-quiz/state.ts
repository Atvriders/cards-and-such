import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CruiseShipsQuizSettings { questions: "10" | "20" | "30"; }
export interface CruiseShipsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CruiseShipsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Largest cruise line by berths?", choices: ["Carnival", "RCL", "NCL", "MSC"], correct: 0 },
  { question: "Royal Caribbean mega-ship class?", choices: ["Quantum", "Oasis", "Voyager", "Freedom"], correct: 1 },
  { question: "Wonder of the Seas length (m)?", choices: ["320", "362", "400", "420"], correct: 1 },
  { question: "Queen Mary 2 operator?", choices: ["Cunard", "P&O", "Holland America", "Princess"], correct: 0 },
  { question: "Cunard is owned by?", choices: ["Carnival", "RCL", "NCL", "MSC"], correct: 0 },
  { question: "Disney Cruise Line ship example?", choices: ["Wish", "Magic", "Wonder", "All listed"], correct: 3 },
  { question: "Norwegian Freestyle Cruising starts in?", choices: ["1990s", "2000s", "2010s", "1980s"], correct: 1 },
  { question: "MSC is based in?", choices: ["Italy", "Switzerland", "Greece", "Spain"], correct: 1 },
  { question: "Princess Cruises famous show on?", choices: ["Discovery", "HBO", "BBC", "ABC (\"Love Boat\")"], correct: 3 },
  { question: "Carnival Triumph 2013 incident known as?", choices: ["\"Poop cruise\"", "Splendor", "Sunshine", "Glory"], correct: 0 },
  { question: "Costa Concordia disaster year?", choices: ["2010", "2012", "2014", "2016"], correct: 1 },
  { question: "Largest Caribbean port for cruises?", choices: ["Cozumel", "Nassau", "St. Thomas", "PortMiami"], correct: 0 },
  { question: "Alaska cruise season runs?", choices: ["Year-round", "Summer", "Winter", "Spring"], correct: 1 },
  { question: "Mediterranean cruises peak in?", choices: ["Summer", "Winter", "Spring", "Fall"], correct: 0 },
  { question: "River cruise pioneer Viking is from?", choices: ["Norway", "Switzerland", "Denmark", "Sweden"], correct: 1 },
  { question: "American Cruise Lines focuses on?", choices: ["Caribbean", "U.S. rivers", "Alaska", "Med"], correct: 1 },
  { question: "\"Mega-ship\" generally exceeds passengers?", choices: ["1,000", "3,000", "5,000", "7,000"], correct: 1 },
  { question: "Drydocks for refurbs typically?", choices: ["Annual", "Every 2.5 years", "5", "10"], correct: 1 },
  { question: "Carnival parent IPO in?", choices: ["1972", "1987", "1990", "1995"], correct: 1 },
  { question: "Royal Caribbean was founded in?", choices: ["1958", "1968", "1978", "1988"], correct: 1 },
  { question: "Princess was founded in?", choices: ["1965", "1972", "1980", "1990"], correct: 0 },
  { question: "MSC began in containers under?", choices: ["Vroon", "Aponte", "Maersk", "MSC Group"], correct: 1 },
  { question: "Cruise ship power often is?", choices: ["Steam", "Diesel-electric/Gas turbine", "Solar", "Sail"], correct: 1 },
  { question: "LNG-fueled cruise ships came around?", choices: ["2010", "2015", "2018", "2022"], correct: 2 },
  { question: "Iconic Queen Elizabeth 2 retired in?", choices: ["2002", "2008", "2012", "2018"], correct: 1 },
  { question: "Symphony of the Seas hails from?", choices: ["Wartsila", "STX/Chantiers", "Fincantieri", "HHI"], correct: 1 },
  { question: "Oasis class shipyards are in?", choices: ["Italy", "Finland", "Korea", "France"], correct: 3 },
  { question: "Cruise capacity world peaked-back to growth?", choices: ["2010", "2014", "2019", "2023"], correct: 3 },
  { question: "Solo cabins started prominently with?", choices: ["Carnival", "NCL Studios", "RCL", "Princess"], correct: 1 },
  { question: "Cruise CEOs association is?", choices: ["CLIA", "ICCL", "IATA", "ICS"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CruiseShipsQuizSettings): CruiseShipsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CruiseShipsQuizState, action: CruiseShipsQuizAction): CruiseShipsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CruiseShipsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
