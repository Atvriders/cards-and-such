import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TappleLettersQuizSettings { questions: "10"; }
export interface TappleLettersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TappleLettersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Tapple is published by?",
    "choices": [
      "USAopoly / The Op",
      "Hasbro",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "The Tapple wheel has how many letter buttons?",
    "choices": [
      "20 (no Q, U, V, X, Y, Z)",
      "26",
      "10",
      "5"
    ],
    "correct": 0
  },
  {
    "question": "Each turn the active player has roughly?",
    "choices": [
      "10 seconds to name and press",
      "30 seconds",
      "5 seconds",
      "60 seconds"
    ],
    "correct": 0
  },
  {
    "question": "Players are eliminated when?",
    "choices": [
      "They fail to name a word in time",
      "They run out of cards",
      "They lose all points",
      "They roll a 1"
    ],
    "correct": 0
  },
  {
    "question": "Tapple was designed by?",
    "choices": [
      "Elliott Rudell",
      "Reiner Knizia",
      "Klaus Teuber",
      "Eric Lang"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count?",
    "choices": [
      "2 to 8 (or 10)",
      "Solo only",
      "20 minimum",
      "Always 4"
    ],
    "correct": 0
  },
  {
    "question": "Recommended ages?",
    "choices": [
      "8 and up",
      "Adults only",
      "21+",
      "Under 1"
    ],
    "correct": 0
  },
  {
    "question": "Tapple debuted in?",
    "choices": [
      "2014",
      "1880s",
      "2050",
      "1950s"
    ],
    "correct": 0
  },
  {
    "question": "Tapple won what kind of awards?",
    "choices": [
      "Toy of the Year style honors",
      "Oscar",
      "Grammy",
      "Tony"
    ],
    "correct": 0
  },
  {
    "question": "Game tone?",
    "choices": [
      "Quick word-burst social",
      "Heavy strategy",
      "Educational only",
      "Adult horror"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TappleLettersQuizSettings): TappleLettersQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TappleLettersQuizState, action: TappleLettersQuizAction): TappleLettersQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TappleLettersQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
