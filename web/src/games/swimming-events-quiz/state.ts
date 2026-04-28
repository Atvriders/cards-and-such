import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SwimmingEventsQuizSettings { questions: "10" | "20"; }
export interface SwimmingEventsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SwimmingEventsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many strokes are competed in individual events?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "Which is NOT a competitive swimming stroke?", choices: ["Freestyle", "Butterfly", "Sidestroke", "Breaststroke"], correct: 2 },
  { question: "What stroke is technically 'whatever you want' in races?", choices: ["Freestyle", "Butterfly", "Backstroke", "Breaststroke"], correct: 0 },
  { question: "How long is an Olympic swimming pool?", choices: ["25m", "33m", "50m", "100m"], correct: 2 },
  { question: "How many lanes in an Olympic pool?", choices: ["6", "8", "10", "12"], correct: 1 },
  { question: "Which medley order is used in IM races?", choices: ["Free, back, breast, fly", "Fly, back, breast, free", "Back, breast, fly, free", "Breast, free, fly, back"], correct: 1 },
  { question: "Which stroke is the slowest?", choices: ["Freestyle", "Backstroke", "Breaststroke", "Butterfly"], correct: 2 },
  { question: "How long is the longest Olympic pool race?", choices: ["800m", "1500m", "10km open water", "5km"], correct: 2 },
  { question: "Who has the most Olympic swimming gold medals?", choices: ["Ian Thorpe", "Mark Spitz", "Michael Phelps", "Caeleb Dressel"], correct: 2 },
  { question: "How many Olympic gold medals has Michael Phelps won?", choices: ["18", "23", "28", "35"], correct: 1 },
  { question: "What is the typical depth of an Olympic pool?", choices: ["1m", "2m", "3m+", "5m"], correct: 2 },
  { question: "Which stroke requires both hands to touch the wall on turn?", choices: ["Freestyle", "Backstroke", "Breaststroke (and butterfly)", "All four"], correct: 2 },
  { question: "How many swimmers in a relay event?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "What is the shortest individual Olympic swim?", choices: ["50m", "100m", "200m", "400m"], correct: 0 },
  { question: "Which female swimmer dominated the 1990s with multiple golds?", choices: ["Janet Evans", "Krisztina Egerszegi", "Inge de Bruijn", "Kornelia Ender"], correct: 1 },
  { question: "Which stroke originated as a butterfly arms with breast kick?", choices: ["Butterfly", "Backstroke", "Crawl", "Sidestroke"], correct: 0 },
  { question: "What year were full-body tech suits banned?", choices: ["2008", "2010", "2012", "2014"], correct: 1 },
  { question: "How many turns in a 200m freestyle in long course?", choices: ["1", "2", "3", "4"], correct: 2 },
  { question: "Which is the fastest stroke?", choices: ["Backstroke", "Freestyle", "Butterfly", "Breaststroke"], correct: 1 },
  { question: "How many strokes in a Medley Relay?", choices: ["3", "4", "5", "6"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SwimmingEventsQuizSettings): SwimmingEventsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SwimmingEventsQuizState, action: SwimmingEventsQuizAction): SwimmingEventsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SwimmingEventsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
