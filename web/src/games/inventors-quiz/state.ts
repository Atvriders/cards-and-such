import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface InventorsQuizSettings { questions: "10" | "20" | "30"; }
export interface InventorsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type InventorsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Telephone inventor?", choices: ["Edison", "Bell", "Tesla", "Marconi"], correct: 1 },
  { question: "Light bulb commercialized by?", choices: ["Edison", "Tesla", "Bell", "Westinghouse"], correct: 0 },
  { question: "Wireless telegraphy pioneer?", choices: ["Edison", "Tesla", "Bell", "Marconi"], correct: 3 },
  { question: "AC current championed by?", choices: ["Edison", "Tesla", "Faraday", "Volta"], correct: 1 },
  { question: "Wright Brothers first flew at?", choices: ["Kitty Hawk", "Dayton", "Cape Cod", "Roanoke"], correct: 0 },
  { question: "First powered flight year?", choices: ["1899", "1903", "1908", "1912"], correct: 1 },
  { question: "Cotton gin inventor?", choices: ["Whitney", "Fulton", "Howe", "McCormick"], correct: 0 },
  { question: "Steamboat pioneer?", choices: ["Whitney", "Fulton", "Howe", "Bell"], correct: 1 },
  { question: "Sewing machine inventor?", choices: ["Singer", "Howe", "Whitney", "Fulton"], correct: 1 },
  { question: "Mechanical reaper inventor?", choices: ["McCormick", "Deere", "Whitney", "Fulton"], correct: 0 },
  { question: "Steel plow inventor?", choices: ["McCormick", "Deere", "Carnegie", "Whitney"], correct: 1 },
  { question: "Father of modern chemistry?", choices: ["Lavoisier", "Boyle", "Dalton", "Mendeleev"], correct: 0 },
  { question: "Periodic table creator?", choices: ["Lavoisier", "Mendeleev", "Curie", "Bohr"], correct: 1 },
  { question: "Penicillin discoverer?", choices: ["Pasteur", "Fleming", "Salk", "Koch"], correct: 1 },
  { question: "Polio vaccine inventor?", choices: ["Salk", "Pasteur", "Sabin", "Fleming"], correct: 0 },
  { question: "Pasteurization is named for?", choices: ["Pasteur", "Koch", "Lister", "Fleming"], correct: 0 },
  { question: "TV pioneer (US)?", choices: ["Farnsworth", "Baird", "Marconi", "Tesla"], correct: 0 },
  { question: "TV pioneer (UK)?", choices: ["Farnsworth", "Baird", "Marconi", "Tesla"], correct: 1 },
  { question: "Telegraph code creator?", choices: ["Bell", "Morse", "Edison", "Tesla"], correct: 1 },
  { question: "Dynamite inventor?", choices: ["Nobel", "Edison", "Diesel", "Krupp"], correct: 0 },
  { question: "Diesel engine inventor?", choices: ["Otto", "Diesel", "Benz", "Daimler"], correct: 1 },
  { question: "Automobile pioneer (Germany)?", choices: ["Benz", "Ford", "Daimler", "Porsche"], correct: 0 },
  { question: "Assembly-line car maker?", choices: ["Ford", "Benz", "Olds", "Chrysler"], correct: 0 },
  { question: "First programmer (Ada)?", choices: ["Babbage", "Lovelace", "Hopper", "Turing"], correct: 1 },
  { question: "Father of computing?", choices: ["Babbage", "Lovelace", "Turing", "von Neumann"], correct: 0 },
  { question: "COBOL pioneer?", choices: ["Hopper", "Lovelace", "Knuth", "Backus"], correct: 0 },
  { question: "World Wide Web inventor?", choices: ["Berners-Lee", "Cerf", "Kahn", "Gates"], correct: 0 },
  { question: "Bifocals inventor?", choices: ["Franklin", "Jefferson", "Edison", "Bell"], correct: 0 },
  { question: "Vulcanized rubber?", choices: ["Goodyear", "Firestone", "Edison", "Dunlop"], correct: 0 },
  { question: "Phonograph inventor?", choices: ["Edison", "Bell", "Berliner", "Tesla"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: InventorsQuizSettings): InventorsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: InventorsQuizState, action: InventorsQuizAction): InventorsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: InventorsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
