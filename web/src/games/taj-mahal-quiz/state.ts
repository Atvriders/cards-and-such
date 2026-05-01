import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TajMahalQuizSettings { questions: "10" | "20"; }
export interface TajMahalQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TajMahalQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Country of the Taj Mahal?", choices: ["Pakistan", "India", "Bangladesh", "Iran"], correct: 1 },
  { question: "City of the Taj Mahal?", choices: ["Delhi", "Agra", "Jaipur", "Lahore"], correct: 1 },
  { question: "Mughal emperor who built it?", choices: ["Akbar", "Shah Jahan", "Aurangzeb", "Babur"], correct: 1 },
  { question: "Built in memory of?", choices: ["His mother", "His wife Mumtaz Mahal", "His daughter", "His advisor"], correct: 1 },
  { question: "Approximate year completed?", choices: ["1543", "1653", "1753", "1853"], correct: 1 },
  { question: "Years of construction (approx)?", choices: ["~5", "~12", "~20", "~50"], correct: 2 },
  { question: "Main material of the Taj Mahal?", choices: ["Sandstone", "White marble", "Granite", "Limestone"], correct: 1 },
  { question: "Marble was sourced from?", choices: ["Makrana, Rajasthan", "Italy", "Persia", "Burma"], correct: 0 },
  { question: "Architectural style?", choices: ["Mughal", "Greek", "Roman", "Gothic"], correct: 0 },
  { question: "Number of minarets surrounding the tomb?", choices: ["1", "2", "4", "8"], correct: 2 },
  { question: "Minarets lean slightly outward to?", choices: ["Aesthetic", "Protect tomb in earthquake", "Wind", "Optical illusion"], correct: 1 },
  { question: "River next to the Taj Mahal?", choices: ["Ganges", "Yamuna", "Indus", "Brahmaputra"], correct: 1 },
  { question: "Inside the Taj Mahal lies?", choices: ["Empty hall", "Cenotaphs of Mumtaz and Shah Jahan", "Throne", "Library"], correct: 1 },
  { question: "Who was buried last in the Taj Mahal?", choices: ["Mumtaz Mahal", "Shah Jahan", "Akbar", "Aurangzeb"], correct: 1 },
  { question: "Inlay technique used (Italian-derived term)?", choices: ["Pietra Dura", "Mosaic", "Fresco", "Cloisonn\u00e9"], correct: 0 },
  { question: "Calligraphy on the walls is from?", choices: ["Bible", "Quran", "Vedas", "Granth"], correct: 1 },
  { question: "Designer often credited?", choices: ["Ustad Ahmad Lahauri", "Sinan", "Bernini", "Wren"], correct: 0 },
  { question: "UNESCO World Heritage year?", choices: ["1983", "1993", "2003", "2013"], correct: 0 },
  { question: "Number of workers employed (estimate)?", choices: ["~1,000", "~5,000", "~20,000", "~100,000"], correct: 2 },
  { question: "Garden style of the Taj?", choices: ["Persian charbagh", "English", "Japanese", "Italian"], correct: 0 },
  { question: "Reflecting pool runs along which axis?", choices: ["North-south", "East-west", "Diagonal", "No pool"], correct: 0 },
  { question: "Color of marble appears to change with?", choices: ["Wind", "Light/time of day", "Temperature", "Visitors"], correct: 1 },
  { question: "How many gemstones inlaid (approx)?", choices: ["~200", "~28", "~28 types", "~1 million"], correct: 2 },
  { question: "Aurangzeb's relation to Shah Jahan?", choices: ["Father", "Son", "Brother", "Cousin"], correct: 1 },
  { question: "Shah Jahan was imprisoned at?", choices: ["Red Fort, Delhi", "Agra Fort", "Lahore Fort", "Fatehpur Sikri"], correct: 1 },
  { question: "WWII air-raid camouflage of the Taj used?", choices: ["Paint", "Bamboo scaffold", "Smoke", "Leaves"], correct: 1 },
  { question: "Major preservation threat today?", choices: ["Air pollution", "Termites", "Lava", "Tsunami"], correct: 0 },
  { question: "Annual visitors (approx)?", choices: ["~50,000", "~700,000", "~7 million", "~50 million"], correct: 2 },
  { question: "Taj Mahal is what kind of building?", choices: ["Palace", "Mausoleum", "Mosque", "Fort"], correct: 1 },
  { question: "It is one of the New 7 Wonders since?", choices: ["1990", "2000", "2007", "2015"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TajMahalQuizSettings): TajMahalQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TajMahalQuizState, action: TajMahalQuizAction): TajMahalQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TajMahalQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
