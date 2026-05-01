import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface PuzzleMindQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PuzzleMindQuizSettings { questions: "10" | "20"; }
export interface PuzzleMindQuizState { questions: PuzzleMindQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PuzzleMindQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: PuzzleMindQuizQuestion[] = [
  { question: "Next in sequence: 1, 1, 2, 3, 5, 8, ?", choices: ["11","12","13","14"], correct: 2 },
  { question: "Next in sequence: 2, 4, 8, 16, ?", choices: ["24","28","32","36"], correct: 2 },
  { question: "Next in sequence: 1, 4, 9, 16, ?", choices: ["20","23","25","30"], correct: 2 },
  { question: "Next prime after 13?", choices: ["14","15","17","19"], correct: 2 },
  { question: "Next in sequence: 3, 6, 12, 24, ?", choices: ["36","42","48","54"], correct: 2 },
  { question: "Tower of Hanoi with n disks needs how many moves?", choices: ["n","n²","2^n − 1","n!"], correct: 2 },
  { question: "Tower of Hanoi with 3 disks?", choices: ["5","6","7","8"], correct: 2 },
  { question: "Monty Hall: switch doors gives win probability?", choices: ["1/3","1/2","2/3","3/4"], correct: 2 },
  { question: "River crossing classic involves a wolf, goat, and?", choices: ["Lion","Cabbage","Hen","Sheep"], correct: 1 },
  { question: "How many moves on a knight from any square?", choices: ["Up to 4","Up to 6","Up to 8","Up to 10"], correct: 2 },
  { question: "In Sudoku, each row contains digits 1-9?", choices: ["With repeats","Exactly once","Some missing","Sums to 50"], correct: 1 },
  { question: "Bridge crossing puzzle key strategy: send the?", choices: ["Slowest first","Fastest two together as torchbearers","Two slowest together","Random order"], correct: 2 },
  { question: "Pigeonhole principle: n+1 pigeons into n holes implies?", choices: ["Some hole empty","Some hole has ≥2","Equal distribution","No conclusion"], correct: 1 },
  { question: "Knight's tour on an 8×8 board visits every square?", choices: ["Once","Twice","Never completes","Half"], correct: 0 },
  { question: "Eight queens problem asks for?", choices: ["Max queens attacking","Non-attacking placement","Min moves","Color pattern"], correct: 1 },
  { question: "Number of solutions to 8 queens (distinct)?", choices: ["12","48","92","100"], correct: 2 },
  { question: "Rubik's cube has how many possible states?", choices: ["~10⁹","~10¹⁹","~4.3×10¹⁹","Infinite"], correct: 2 },
  { question: "God's number for 3×3 Rubik's cube?", choices: ["15","20","25","43"], correct: 1 },
  { question: "In '3 hats' puzzle, deduction relies on?", choices: ["Coin flips","Other players' silence","Random guess","Voting"], correct: 1 },
  { question: "100 prisoners and boxes problem optimal strategy uses?", choices: ["Random","Cycle following","Voting","Bribing"], correct: 1 },
  { question: "Zeno's paradox involves?", choices: ["Infinite series","Prime gaps","Modular arithmetic","Topology"], correct: 0 },
  { question: "The 'Two Generals' problem is about?", choices: ["Cryptography","Reliable communication over unreliable channel","Sorting","Graph coloring"], correct: 1 },
  { question: "Birthday paradox: ~50% match in a group of about?", choices: ["7","15","23","50"], correct: 2 },
  { question: "Four-color theorem says any planar map needs at most?", choices: ["3","4","5","6"], correct: 1 },
  { question: "Halting problem is?", choices: ["Solvable","Undecidable","Trivial","NP-complete"], correct: 1 },
  { question: "Traveling salesman problem is in complexity class?", choices: ["P","NP-hard","Decidable only","Constant time"], correct: 1 },
  { question: "Next in sequence: 1, 11, 21, 1211, 111221, ?", choices: ["13112221","312211","123321","221112"], correct: 0 },
  { question: "Next in: 2, 3, 5, 7, 11, 13, ?", choices: ["14","15","16","17"], correct: 3 },
  { question: "If A=1, B=2,…, what's CAB?", choices: ["123","312","321","213"], correct: 1 },
  { question: "In a 4×4 magic square (1-16), the magic sum is?", choices: ["30","32","34","36"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PuzzleMindQuizSettings): PuzzleMindQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PuzzleMindQuizState, action: PuzzleMindQuizAction): PuzzleMindQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PuzzleMindQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
