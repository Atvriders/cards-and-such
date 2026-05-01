import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DeepSeaQuizSettings { questions: "10" | "20" | "30"; }
export interface DeepSeaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DeepSeaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Deepest known point of ocean?", choices: ["Mariana Trench", "Tonga Trench", "Java Trench", "Puerto Rico Trench"], correct: 0 },
  { question: "Approx depth of Challenger Deep?", choices: ["~6,000 m", "~8,000 m", "~10,935 m", "~15,000 m"], correct: 2 },
  { question: "Mariana Trench is in which ocean?", choices: ["Atlantic", "Pacific", "Indian", "Arctic"], correct: 1 },
  { question: "Earliest manned dive to Challenger Deep (1960)?", choices: ["Trieste", "Alvin", "Nautile", "Limiting Factor"], correct: 0 },
  { question: "Pilots of 1960 Trieste dive?", choices: ["Piccard & Walsh", "Cousteau & Beebe", "Cameron & Walsh", "Earle & Beebe"], correct: 0 },
  { question: "Director who solo-dove to Challenger Deep in 2012?", choices: ["Spielberg", "Cameron", "Bigelow", "Nolan"], correct: 1 },
  { question: "Pressure at the deepest ocean is roughly?", choices: ["~10x surface", "~100x", "~1,000x", "~16,000 psi"], correct: 3 },
  { question: "Photic zone is the?", choices: ["Sunlit upper ocean", "Pitch black", "Hot vents", "Surface foam"], correct: 0 },
  { question: "Aphotic zone begins around?", choices: ["~50 m", "~200 m", "~1,000 m", "~4,000 m"], correct: 1 },
  { question: "Bioluminescence is common in?", choices: ["Tropical reefs", "Deep sea", "Polar lakes", "Mangroves"], correct: 1 },
  { question: "Deep-sea anglerfish lure is?", choices: ["Bioluminescent", "Magnetic", "Acidic", "Electric"], correct: 0 },
  { question: "Hydrothermal vents discovered in?", choices: ["1850s", "1977", "2001", "2020"], correct: 1 },
  { question: "Vent ecosystems use which energy?", choices: ["Photosynthesis", "Chemosynthesis", "Tidal", "Wind"], correct: 1 },
  { question: "Vent tube worms host?", choices: ["Algae", "Bacteria", "Zooplankton", "Krill"], correct: 1 },
  { question: "Giant squid live mostly in?", choices: ["Coral reefs", "Deep sea", "Estuaries", "Lakes"], correct: 1 },
  { question: "Cousteau invented (with Gagnan) the?", choices: ["Aqua-Lung", "Sonar", "Submarine", "Bathysphere"], correct: 0 },
  { question: "Beebe & Barton's 1934 vehicle was the?", choices: ["Bathysphere", "Bathyscaphe", "Submarine", "Snorkel"], correct: 0 },
  { question: "HOV Alvin is operated by?", choices: ["WHOI", "NOAA", "JAMSTEC", "IFREMER"], correct: 0 },
  { question: "Famous shipwreck explored by Alvin?", choices: ["Titanic", "Andrea Doria", "Lusitania", "Bismarck"], correct: 0 },
  { question: "Year Titanic wreck found?", choices: ["1965", "1985", "2005", "2020"], correct: 1 },
  { question: "Discoverer of Titanic wreck?", choices: ["Ballard", "Cousteau", "Cameron", "Earle"], correct: 0 },
  { question: "Mid-ocean ridge total length?", choices: ["~10,000 km", "~65,000 km", "~100,000 km", "~200,000 km"], correct: 1 },
  { question: "Average ocean depth?", choices: ["~500 m", "~3,700 m", "~7,000 m", "~10,000 m"], correct: 1 },
  { question: "How much of the ocean is mapped in detail (approx)?", choices: ["100%", "~20%", "~25%", "~50%"], correct: 1 },
  { question: "Deep-sea pressure at 1,000 m approx?", choices: ["~10 atm", "~50 atm", "~100 atm", "~500 atm"], correct: 2 },
  { question: "What is the abyssal plain?", choices: ["Coral garden", "Flat deep ocean floor", "Trench", "Reef"], correct: 1 },
  { question: "Most species in deep sea are?", choices: ["Discovered", "Undiscovered", "Mammals", "Fish only"], correct: 1 },
  { question: "Deepest fish observed (~8,300 m+)?", choices: ["Hagfish", "Snailfish", "Tuna", "Eel"], correct: 1 },
  { question: "Submersible Deepsea Challenger reached?", choices: ["Mariana Trench", "Tonga", "Puerto Rico", "Java"], correct: 0 },
  { question: "Marine snow is?", choices: ["Real snow", "Falling organic particles", "Salt crystals", "Plankton ice"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DeepSeaQuizSettings): DeepSeaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DeepSeaQuizState, action: DeepSeaQuizAction): DeepSeaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DeepSeaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
