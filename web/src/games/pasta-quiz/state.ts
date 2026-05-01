import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PastaQuizSettings { questions: "10" | "20"; }
export interface PastaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PastaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What country is pasta most associated with?", choices: ["Italy","China","Greece","France"], correct: 0 },
  { question: "What's spaghetti?", choices: ["Long thin pasta","Short tube","Flat ribbon","Stuffed"], correct: 0 },
  { question: "What's penne?", choices: ["Tube cut diagonally","Long","Stuffed","Flat"], correct: 0 },
  { question: "What's farfalle?", choices: ["Bow-tie shape","Long","Tube","Stuffed"], correct: 0 },
  { question: "What's fusilli?", choices: ["Spiral/corkscrew","Tube","Flat","Long"], correct: 0 },
  { question: "What's rigatoni?", choices: ["Ridged tube pasta","Smooth","Flat","Long"], correct: 0 },
  { question: "What's fettuccine?", choices: ["Flat ribbon","Round long","Tube","Stuffed"], correct: 0 },
  { question: "What's linguine?", choices: ["Flat narrow noodle","Round","Tube","Stuffed"], correct: 0 },
  { question: "What's lasagna?", choices: ["Wide flat sheets","Stuffed","Tube","Long"], correct: 0 },
  { question: "What's ravioli?", choices: ["Stuffed pasta squares","Just stuffed","Both","Just stuffed shape"], correct: 2 },
  { question: "What's tortellini?", choices: ["Stuffed ring-shaped pasta","Just stuffed","Both","Different shape"], correct: 2 },
  { question: "What's gnocchi?", choices: ["Potato dumplings (sometimes flour)","Just dumplings","Both","Just gnocchi"], correct: 2 },
  { question: "What's orzo?", choices: ["Rice-shaped pasta","Just orzo","Both","Just rice"], correct: 2 },
  { question: "What's bucatini?", choices: ["Hollow long pasta","Solid round","Both","Just bucatini"], correct: 2 },
  { question: "What's pappardelle?", choices: ["Wide ribbons","Narrow","Both","Just wide"], correct: 2 },
  { question: "What's tagliatelle?", choices: ["Long flat ribbons","Wide","Both","Narrow ribbons"], correct: 2 },
  { question: "What's al dente?", choices: ["Cooked but firm","Just cooked","Both","Soft"], correct: 2 },
  { question: "What's the typical sauce for spaghetti carbonara?", choices: ["Egg, cheese, guanciale, pepper","Just egg","Both","Cream-based"], correct: 2 },
  { question: "What region is carbonara from?", choices: ["Lazio (Rome)","Just Rome","Both","Sicily"], correct: 2 },
  { question: "What's cacio e pepe?", choices: ["Cheese and pepper","Just cheese","Both","Just spicy"], correct: 2 },
  { question: "What cheese is in cacio e pepe?", choices: ["Pecorino Romano","Just pecorino","Both","Parmesan"], correct: 2 },
  { question: "What's amatriciana?", choices: ["Tomato, guanciale, pecorino","Just tomato","Both","Just sauce"], correct: 2 },
  { question: "What's pesto from?", choices: ["Genoa, Liguria","Just Italy","Both","Just region"], correct: 2 },
  { question: "What's in classic pesto?", choices: ["Basil, garlic, pine nuts, olive oil, pecorino/parmesan","Just basil","Both","Multiple ingredients"], correct: 2 },
  { question: "What's bolognese?", choices: ["Meat ragu sauce from Bologna","Just meat","Both","Just sauce"], correct: 2 },
  { question: "What pasta traditionally pairs with bolognese in Italy?", choices: ["Tagliatelle (not spaghetti)","Spaghetti","Both used","Just tagliatelle"], correct: 2 },
  { question: "What's mac and cheese (Italian roots)?", choices: ["Pasta with cheese sauce","Just American","Both","Modern dish"], correct: 2 },
  { question: "What durum wheat product is most pasta?", choices: ["Semolina","Just semolina","Both","Whole wheat"], correct: 2 },
  { question: "What's fresh pasta vs dried?", choices: ["Fresh has eggs (often), shorter cook","Dry has long shelf life","Both","Different uses"], correct: 2 },
  { question: "What's the best way to season pasta water?", choices: ["Salty like the sea","Just salt","Both","Lots of salt"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PastaQuizSettings): PastaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PastaQuizState, action: PastaQuizAction): PastaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PastaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
