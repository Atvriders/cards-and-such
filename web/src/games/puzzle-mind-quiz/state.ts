import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface PuzzleMindQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PuzzleMindQuizSettings { questions: "10" | "20"; }
export interface PuzzleMindQuizState { questions: PuzzleMindQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PuzzleMindQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: PuzzleMindQuizQuestion[] = [
  { question: "What number comes next: 2, 4, 8, 16, ...?", choices: ["18","24","30","32"], correct: 3 },
  { question: "What weighs more: a pound of feathers or a pound of bricks?", choices: ["Feathers","Bricks","Same","Depends"], correct: 2 },
  { question: "You have 3 apples and take away 2. How many do you have?", choices: ["1","2","3","0"], correct: 1 },
  { question: "What number is 1/2 of 1/4 of 100?", choices: ["12.5","25","50","100"], correct: 0 },
  { question: "How many months have 28 days?", choices: ["1","2","3","12"], correct: 3 },
  { question: "A clock strikes 6 in 5 seconds. How long for 12?", choices: ["10s","11s","12s","6s"], correct: 1 },
  { question: "Which number is missing: 1, 4, 9, ?, 25?", choices: ["12","14","16","18"], correct: 2 },
  { question: "If two's company and three's a crowd, what's four and five?", choices: ["Friends","Nine","Company","Family"], correct: 1 },
  { question: "What goes up but never comes down?", choices: ["Rain","Age","A bird","A balloon"], correct: 1 },
  { question: "What word becomes shorter when 2 letters are added? (word: 'short')", choices: ["Long","Shorter","Length","Short"], correct: 1 },
  { question: "How many sides does a circle have?", choices: ["0","1","2","Infinite"], correct: 1 },
  { question: "5 + 5 + 5 + 5 = 555. Add one stroke (line) to make it true (puzzle).", choices: ["Change first 5 to 6","Change + to 4","Yes possible","Yes (cross + becomes 4)"], correct: 3 },
  { question: "Sequence: O T T F F S S ? (initials of one, two...)", choices: ["E","N","T","S"], correct: 0 },
  { question: "How many 9s between 1 and 100?", choices: ["9","10","19","20"], correct: 3 },
  { question: "You're in a race; you pass 2nd place. What place are you in?", choices: ["1st","2nd","3rd","Last"], correct: 1 },
  { question: "A man falls off a 30-story building and survives. How? (lateral)", choices: ["Net","Was on first floor","Parachute","Wind"], correct: 1 },
  { question: "What has hands but cannot clap?", choices: ["Robot","Clock","Statue","Doll"], correct: 1 },
  { question: "Sequence: 1, 11, 21, 1211, 111221, ?", choices: ["112233","312211","123321","Other"], correct: 1 },
  { question: "How do you make 7 even (without arithmetic)?", choices: ["Add 1","Remove 's' (seven)","Subtract","Divide"], correct: 1 },
  { question: "A word made of 4 letters yet 3, sometimes 9 letters but never 5 — what?", choices: ["Impossible","'What' (statement)","Five","Truth"], correct: 1 },
  { question: "Which doesn't belong: square, circle, triangle, cube?", choices: ["Square","Circle","Triangle","Cube"], correct: 3 },
  { question: "What's the next: M, T, W, T, F, ?, ?", choices: ["S, S","M, T","T, T","F, F"], correct: 0 },
  { question: "How many degrees between hour and minute hand at 3:00?", choices: ["60°","75°","90°","120°"], correct: 2 },
  { question: "You have a bat and ball costing $1.10 total; bat is $1 more than ball. Ball costs?", choices: ["$0.10","$0.05","$0.15","$0.20"], correct: 1 },
  { question: "What can travel around the world while staying in a corner?", choices: ["Wind","Postage stamp","Penny","Phone"], correct: 1 }
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
