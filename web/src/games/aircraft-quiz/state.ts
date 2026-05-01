import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AircraftQuizSettings { questions: "10" | "20" | "30"; }
export interface AircraftQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AircraftQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who made the first powered, controlled airplane flight?", choices: ["Wright Brothers", "Glenn Curtiss", "Louis Bleriot", "Samuel Langley"], correct: 0 },
  { question: "What year did the Wright Brothers fly?", choices: ["1903", "1900", "1908", "1912"], correct: 0 },
  { question: "Where was the first Wright flight?", choices: ["Kitty Hawk, NC", "Dayton, OH", "Cape Canaveral", "Wright Field"], correct: 0 },
  { question: "Who was the first to fly solo across the Atlantic?", choices: ["Charles Lindbergh", "Amelia Earhart", "Howard Hughes", "Wiley Post"], correct: 0 },
  { question: "What plane did Lindbergh fly in 1927?", choices: ["Spirit of St. Louis", "Glamorous Glennis", "The Memphis Belle", "Bell X-1"], correct: 0 },
  { question: "Who first broke the sound barrier in 1947?", choices: ["Chuck Yeager", "Scott Crossfield", "Buzz Aldrin", "John Glenn"], correct: 0 },
  { question: "Yeager flew which plane to break the sound barrier?", choices: ["Bell X-1", "X-15", "F-86", "F-104"], correct: 0 },
  { question: "What was the world's first commercial jet airliner?", choices: ["de Havilland Comet (1952)", "Boeing 707", "Douglas DC-8", "Tupolev Tu-104"], correct: 0 },
  { question: "The Boeing 747 entered commercial service in?", choices: ["1970", "1965", "1975", "1980"], correct: 0 },
  { question: "What is the world's largest passenger aircraft?", choices: ["Airbus A380", "Boeing 747-8", "Boeing 777X", "Antonov An-225"], correct: 0 },
  { question: "Concorde first flew commercially in?", choices: ["1976", "1969", "1980", "1972"], correct: 0 },
  { question: "What was Concorde's typical cruise speed?", choices: ["Mach 2", "Mach 1.5", "Mach 3", "Mach 1.2"], correct: 0 },
  { question: "Concorde retired in what year?", choices: ["2003", "2000", "2005", "2008"], correct: 0 },
  { question: "What plane is nicknamed 'Mother of All Bombers' (Russian)?", choices: ["Tupolev Tu-160 (or Mother in different context: Antonov An-124)", "Tu-95 Bear", "Ilyushin Il-76", "Sukhoi Su-34"], correct: 0 },
  { question: "Who manufactures the F-22 Raptor?", choices: ["Lockheed Martin", "Boeing", "Northrop Grumman", "General Dynamics"], correct: 0 },
  { question: "The SR-71 Blackbird's max speed was?", choices: ["Over Mach 3", "Mach 2", "Mach 4", "Mach 5"], correct: 0 },
  { question: "Who built the SR-71?", choices: ["Lockheed Skunk Works", "Boeing", "Northrop", "McDonnell"], correct: 0 },
  { question: "What plane is known as the B-52?", choices: ["Stratofortress", "Stratotanker", "Stratocruiser", "Stratoliner"], correct: 0 },
  { question: "How many engines does a Boeing 777 have?", choices: ["Two", "Three", "Four", "One"], correct: 0 },
  { question: "Airbus is headquartered in?", choices: ["Toulouse, France", "Hamburg, Germany", "London, UK", "Madrid, Spain"], correct: 0 },
  { question: "Boeing was founded in?", choices: ["Seattle, Washington (1916)", "Chicago", "St. Louis", "Long Beach"], correct: 0 },
  { question: "Who was the first woman to fly solo across the Atlantic?", choices: ["Amelia Earhart (1932)", "Bessie Coleman", "Jacqueline Cochran", "Harriet Quimby"], correct: 0 },
  { question: "The Hindenburg was what type of aircraft?", choices: ["Zeppelin (rigid airship)", "Hot air balloon", "Blimp", "Glider"], correct: 0 },
  { question: "Hindenburg disaster year?", choices: ["1937", "1929", "1945", "1933"], correct: 0 },
  { question: "What is a 'Stuka' famous for?", choices: ["German WWII dive bomber (Ju 87)", "British fighter", "Russian bomber", "American transport"], correct: 0 },
  { question: "The Spitfire fighter was made by?", choices: ["Supermarine", "Hawker", "de Havilland", "Vickers"], correct: 0 },
  { question: "Who designed the Spitfire?", choices: ["R.J. Mitchell", "Sydney Camm", "Geoffrey de Havilland", "Frank Whittle"], correct: 0 },
  { question: "What is the Mustang's full name?", choices: ["P-51 Mustang", "P-47 Mustang", "P-38 Mustang", "F-86 Mustang"], correct: 0 },
  { question: "What is a 'Harrier' notable for?", choices: ["Vertical takeoff and landing (VTOL)", "Stealth", "Supersonic", "Carrier landings only"], correct: 0 },
  { question: "What is the F-35 also called?", choices: ["Lightning II", "Eagle", "Falcon", "Hornet"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AircraftQuizSettings): AircraftQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AircraftQuizState, action: AircraftQuizAction): AircraftQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AircraftQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
