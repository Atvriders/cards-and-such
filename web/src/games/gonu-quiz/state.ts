import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GonuSettings { questions: "10"; }
export interface GonuState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GonuAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Gonu is from which country?", choices: ["Japan", "China", "Korea", "Vietnam"], correct: 2 },
  { question: "Gonu is best characterised as a?", choices: ["Card game", "Asymmetric abstract", "Dice race", "Solitaire"], correct: 1 },
  { question: "The two sides in tigers-vs-goats Gonu are?", choices: ["Predators and prey", "Kings and pawns", "Light and dark", "Red and yellow"], correct: 0 },
  { question: "Predators win by?", choices: ["Capturing/eating goats", "Reaching opposite side", "Filling board", "Most points"], correct: 0 },
  { question: "Goats win by?", choices: ["Capturing tigers", "Immobilizing tigers", "Reaching home", "Last move"], correct: 1 },
  { question: "Capture in Gonu is by?", choices: ["Sandwich", "Jumping over a goat", "Surround", "Any direction"], correct: 1 },
  { question: "The board for Gonu is most often?", choices: ["Round", "A small grid with diagonals", "Hex", "Cubic"], correct: 1 },
  { question: "Gonu is part of which global game family?", choices: ["Mancala", "Tafl", "Tigers-and-goats", "Tafl"], correct: 2 },
  { question: "A similar Nepali game is?", choices: ["Bagh-Chal", "Catur", "Senet", "Bul"], correct: 0 },
  { question: "Gonu emphasizes?", choices: ["Asymmetric tactics", "Pure luck", "Card draw", "Bidding"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: GonuSettings): GonuState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GonuState, action: GonuAction): GonuState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GonuState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
