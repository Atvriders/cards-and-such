import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChemistryLabQuizSettings { questions: "10" | "20" | "30"; }
export interface ChemistryLabQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChemistryLabQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the chemical symbol for gold?", choices: ["Go", "Gd", "Au", "Ag"], correct: 2 },
  { question: "What is the chemical symbol for silver?", choices: ["Si", "Sv", "Ag", "Au"], correct: 2 },
  { question: "Water's chemical formula is?", choices: ["H2O", "HO2", "H2O2", "OH2"], correct: 0 },
  { question: "What is the most abundant gas in Earth's atmosphere?", choices: ["Oxygen", "Nitrogen", "Carbon dioxide", "Argon"], correct: 1 },
  { question: "What is the lightest element?", choices: ["Helium", "Hydrogen", "Lithium", "Carbon"], correct: 1 },
  { question: "What is the pH of pure water?", choices: ["0", "5", "7", "14"], correct: 2 },
  { question: "Who developed the modern periodic table?", choices: ["Bohr", "Mendeleev", "Curie", "Faraday"], correct: 1 },
  { question: "What is the symbol for sodium?", choices: ["So", "Sd", "Na", "Sn"], correct: 2 },
  { question: "How many protons does carbon have?", choices: ["4", "6", "8", "12"], correct: 1 },
  { question: "What is the atomic number of oxygen?", choices: ["6", "8", "10", "16"], correct: 1 },
  { question: "Which gas do plants absorb for photosynthesis?", choices: ["Oxygen", "Carbon dioxide", "Nitrogen", "Methane"], correct: 1 },
  { question: "What is NaCl?", choices: ["Baking soda", "Table salt", "Bleach", "Ammonia"], correct: 1 },
  { question: "Avogadro's number is approximately?", choices: ["3.14e10", "6.02e23", "1.6e-19", "9.8e9"], correct: 1 },
  { question: "Which acid is found in vinegar?", choices: ["Citric", "Acetic", "Sulfuric", "Hydrochloric"], correct: 1 },
  { question: "Which scientist discovered radioactivity?", choices: ["Marie Curie", "Henri Becquerel", "Ernest Rutherford", "Niels Bohr"], correct: 1 },
  { question: "What is the hardest natural substance?", choices: ["Quartz", "Diamond", "Steel", "Granite"], correct: 1 },
  { question: "What is H2SO4?", choices: ["Hydrochloric acid", "Sulfuric acid", "Nitric acid", "Acetic acid"], correct: 1 },
  { question: "Noble gases include?", choices: ["Hydrogen", "Helium", "Oxygen", "Nitrogen"], correct: 1 },
  { question: "What state of matter is plasma?", choices: ["Solid", "Liquid", "Gas", "Ionized gas"], correct: 3 },
  { question: "Which element has atomic number 1?", choices: ["Helium", "Hydrogen", "Oxygen", "Carbon"], correct: 1 },
  { question: "What is CO2?", choices: ["Carbon monoxide", "Carbon dioxide", "Methane", "Ozone"], correct: 1 },
  { question: "What is rust chemically?", choices: ["Iron oxide", "Copper sulfide", "Aluminum oxide", "Silver sulfide"], correct: 0 },
  { question: "Which scientist proposed the atomic theory in 1803?", choices: ["Dalton", "Thomson", "Rutherford", "Bohr"], correct: 0 },
  { question: "How many elements are in the modern periodic table (approx)?", choices: ["92", "118", "150", "200"], correct: 1 },
  { question: "What charge does an electron carry?", choices: ["Positive", "Negative", "Neutral", "Variable"], correct: 1 },
  { question: "Which ion makes a solution basic?", choices: ["H+", "OH-", "Na+", "Cl-"], correct: 1 },
  { question: "What is the formula for ammonia?", choices: ["NH3", "NO2", "N2O", "HNO3"], correct: 0 },
  { question: "Which subatomic particle has no charge?", choices: ["Proton", "Neutron", "Electron", "Positron"], correct: 1 },
  { question: "Which gas is essential for combustion?", choices: ["Nitrogen", "Oxygen", "Argon", "Helium"], correct: 1 },
  { question: "Which element is the main component of stars?", choices: ["Hydrogen", "Helium", "Iron", "Carbon"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChemistryLabQuizSettings): ChemistryLabQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChemistryLabQuizState, action: ChemistryLabQuizAction): ChemistryLabQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChemistryLabQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
