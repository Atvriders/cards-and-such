import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GoStopSettings { questions: "10"; }
export interface GoStopState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GoStopAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Go-Stop uses what deck?", choices: ["Hanafuda", "Hwatu", "Trump", "Kabufuda"], correct: 1 },
  { question: "The basic Go-Stop scoring threshold is usually?", choices: ["3 points", "5 points", "7 points", "10 points"], correct: 2 },
  { question: "Calling 'Go' means the player?", choices: ["Stops and locks score", "Continues playing for more points", "Skips next turn", "Doubles the pot only"], correct: 1 },
  { question: "Calling 'Stop' means the player?", choices: ["Continues for double", "Locks in the score and wins the round", "Forfeits", "Discards all"], correct: 1 },
  { question: "After calling 'Go', the player's score grows but?", choices: ["Cards are doubled", "Risk of opponent overtaking grows", "Score caps at 7", "Dealing changes"], correct: 1 },
  { question: "Hwatu cards are usually made of?", choices: ["Paper", "Plastic", "Wood", "Bone"], correct: 1 },
  { question: "Go-Stop is most commonly played by?", choices: ["2–3 players", "4 players", "5 players", "6+ players"], correct: 0 },
  { question: "A 'Bbing' card is a special?", choices: ["Bonus card", "Penalty card", "Wild card", "Joker bonus card"], correct: 3 },
  { question: "A 'Pi' card category functions like Hanafuda's?", choices: ["Hikari", "Tane", "Tan", "Kasu"], correct: 3 },
  { question: "Saying 'Go' three times triples the?", choices: ["Hand size", "Score multiplier", "Discard count", "Time limit"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: GoStopSettings): GoStopState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GoStopState, action: GoStopAction): GoStopState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GoStopState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
