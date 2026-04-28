import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SubmarinesQuizSettings { questions: "10" | "20" | "30"; }
export interface SubmarinesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SubmarinesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "First nuclear sub?", choices: ["Skipjack", "Nautilus", "Ohio", "Trident"], correct: 1 },
  { question: "USS Nautilus launched in?", choices: ["1948", "1954", "1962", "1970"], correct: 1 },
  { question: "Ohio-class subs primarily carry?", choices: ["SSN role", "SSBN missiles", "Cargo", "UUVs"], correct: 1 },
  { question: "Virginia-class are?", choices: ["SSN", "SSBN", "SSGN", "Diesel"], correct: 0 },
  { question: "Typhoon-class is the?", choices: ["Smallest", "Largest sub", "Fastest", "Newest"], correct: 1 },
  { question: "Soviet Akula NATO name?", choices: ["Akula", "Schuka-B", "Bars", "Sierra"], correct: 0 },
  { question: "Diesel-electric subs use AIP from?", choices: ["1980s", "1990s", "2000s", "2010s"], correct: 1 },
  { question: "Submarine \"snorkel\" was popularized by?", choices: ["Royal Navy", "Kriegsmarine", "U.S.", "Italy"], correct: 1 },
  { question: "Type VII U-boat was?", choices: ["Smallest", "Workhorse", "Largest", "Cargo"], correct: 1 },
  { question: "Wolfpack tactics used in?", choices: ["WWI", "WWII", "Cold War", "Gulf"], correct: 1 },
  { question: "Hyman Rickover known as?", choices: ["Sub captain", "Father of nuclear navy", "Engineer", "Spy"], correct: 1 },
  { question: "Crush depth is reached?", choices: ["Quickly", "Test depth + safety margin", "Just below", "Above test"], correct: 1 },
  { question: "Hull is \"double\" or \"single\"?", choices: ["Single only", "Both designs exist", "Triple", "Modular"], correct: 1 },
  { question: "Sonar has two types?", choices: ["Active/passive", "Wide/narrow", "Hot/cold", "Old/new"], correct: 0 },
  { question: "Periscope replaced by?", choices: ["Photonics mast", "Radar", "Drone", "None"], correct: 0 },
  { question: "Trident missile is a?", choices: ["Cruise", "SLBM", "ICBM", "SAM"], correct: 1 },
  { question: "Tomahawk in subs is launched from?", choices: ["Torpedo tube/VLS", "Top hatch", "Side", "Stern"], correct: 0 },
  { question: "Soviet \"Alfa\" is famous for?", choices: ["Quietness", "Speed/depth", "Size", "Cost"], correct: 1 },
  { question: "HMS Astute is class?", choices: ["Astute", "Trafalgar", "Vanguard", "Swiftsure"], correct: 0 },
  { question: "Indian SSBN class?", choices: ["Arihant", "Akula", "Ming", "Yuan"], correct: 0 },
  { question: "Chinese SSBN class?", choices: ["Type 092 Xia", "094 Jin", "096", "Han"], correct: 1 },
  { question: "North Korean SLBM platform?", choices: ["Sinpo", "Romeo", "Yono", "All listed"], correct: 3 },
  { question: "Air-Independent Propulsion uses?", choices: ["Stirling/fuel cell", "Diesel", "Steam", "Battery"], correct: 0 },
  { question: "Lithium-ion subs first by?", choices: ["U.S.", "Japan", "Russia", "China"], correct: 1 },
  { question: "USS Thresher tragedy in?", choices: ["1955", "1963", "1972", "1984"], correct: 1 },
  { question: "Kursk tragedy in?", choices: ["1995", "2000", "2005", "2010"], correct: 1 },
  { question: "Nemo from Verne sailed?", choices: ["Nautilus", "Triton", "Hunley", "Kursk"], correct: 0 },
  { question: "Hunley was first sub to?", choices: ["Submerge", "Sink a warship", "Use AIP", "Run nuclear"], correct: 1 },
  { question: "Beluga AGSS-569 was?", choices: ["Acoustic test", "Cargo", "Mini", "Spy"], correct: 0 },
  { question: "Submarine at WWII Atlantic chokepoint?", choices: ["Bay of Biscay", "GIUK", "SoH", "Strait of Malacca"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SubmarinesQuizSettings): SubmarinesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SubmarinesQuizState, action: SubmarinesQuizAction): SubmarinesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SubmarinesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
