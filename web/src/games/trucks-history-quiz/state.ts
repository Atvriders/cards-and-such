import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrucksHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface TrucksHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrucksHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What year did Ford introduce the F-Series?", choices: ["1948", "1953", "1942", "1955"], correct: 0 },
  { question: "Ford F-Series has been America's best-selling truck for how long?", choices: ["Over 40 years", "20 years", "10 years", "5 years"], correct: 0 },
  { question: "Chevy Silverado replaced which previous nameplate?", choices: ["C/K series", "S-10", "Apache", "Cheyenne"], correct: 0 },
  { question: "When was the original Chevrolet Suburban launched?", choices: ["1935", "1945", "1925", "1950"], correct: 0 },
  { question: "Suburban is the longest-running nameplate of any?", choices: ["Production passenger vehicle nameplate", "Truck only", "SUV only", "Sedan only"], correct: 0 },
  { question: "Dodge introduced the Ram name in?", choices: ["1981", "1971", "1965", "1990"], correct: 0 },
  { question: "Ram became its own brand (separate from Dodge) in?", choices: ["2009", "2005", "2012", "2015"], correct: 0 },
  { question: "What is the most powerful diesel pickup engine offered (HD)?", choices: ["Cummins 6.7 / Powerstroke 6.7 / Duramax 6.6 (varies year)", "Cummins 5.9", "Ford Lima diesel", "Duramax 7.0"], correct: 0 },
  { question: "Cummins 5.9 turbodiesel debuted in Ram trucks in?", choices: ["1989", "1985", "1995", "1998"], correct: 0 },
  { question: "Toyota Hilux is famously?", choices: ["Indestructible (Top Gear tested)", "Luxury truck", "Sports truck", "Electric"], correct: 0 },
  { question: "Tundra is Toyota's full-size pickup since?", choices: ["1999 (2000 MY)", "1995", "2005", "2010"], correct: 0 },
  { question: "Nissan Titan launched in?", choices: ["2003 (2004 MY)", "1998", "2008", "2010"], correct: 0 },
  { question: "What is a 'duallie' truck?", choices: ["Dual rear wheels (4 wheels back axle)", "Twin engine", "Two-bed", "Two-cab"], correct: 0 },
  { question: "Ford Super Duty was introduced in?", choices: ["1999", "1995", "2003", "1990"], correct: 0 },
  { question: "What is the 'Big Three' truck makers in the U.S.?", choices: ["Ford, GM (Chevy/GMC), Ram", "Ford, Toyota, Chevy", "Chevy, Ram, Nissan", "Ford, Honda, Chevy"], correct: 0 },
  { question: "Ford Ranger compact pickup was discontinued (US) in?", choices: ["2011 (returned 2019)", "2008", "2015", "2005"], correct: 0 },
  { question: "Chevy Colorado/GMC Canyon are?", choices: ["Mid-size pickups", "Full-size", "Compact", "Heavy-duty"], correct: 0 },
  { question: "Cybertruck is made by?", choices: ["Tesla", "Rivian", "Lucid", "Ford"], correct: 0 },
  { question: "Cybertruck deliveries began in?", choices: ["2023", "2021", "2025", "2020"], correct: 0 },
  { question: "Rivian's first truck is the?", choices: ["R1T", "R1S", "RT1", "Rivian Pickup"], correct: 0 },
  { question: "Ford F-150 Lightning (electric) launched in?", choices: ["2022", "2020", "2024", "2018"], correct: 0 },
  { question: "GMC Hummer EV (truck) launched in?", choices: ["2021", "2019", "2023", "2018"], correct: 0 },
  { question: "What is the name of GM's HD truck diesel?", choices: ["Duramax", "Cummins", "Powerstroke", "Detroit"], correct: 0 },
  { question: "Duramax is built jointly with?", choices: ["Isuzu", "Cummins", "Toyota", "VM Motori"], correct: 0 },
  { question: "What is a 'tractor' in commercial trucking?", choices: ["Semi-truck (cab pulling trailer)", "Farm tractor", "Forklift", "Bulldozer"], correct: 0 },
  { question: "Peterbilt was founded in?", choices: ["1939", "1925", "1950", "1945"], correct: 0 },
  { question: "Kenworth is owned by?", choices: ["PACCAR", "Daimler", "Volvo", "Navistar"], correct: 0 },
  { question: "Mack Trucks bulldog logo dates from?", choices: ["WWI era", "WWII era", "1900s", "1960s"], correct: 0 },
  { question: "Freightliner is owned by?", choices: ["Daimler Truck", "Volvo", "PACCAR", "Navistar"], correct: 0 },
  { question: "What does 'GVWR' stand for on trucks?", choices: ["Gross Vehicle Weight Rating", "Gross Variable Weight Range", "General Vehicle Weight Reference", "Gear Vehicle Wear Rating"], correct: 0 },
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
