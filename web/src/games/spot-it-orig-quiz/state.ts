import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpotItOrigQuizSettings { questions: "10"; }
export interface SpotItOrigQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpotItOrigQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Every two cards in Spot It! share?",
    "choices": [
      "Exactly one matching symbol",
      "Two symbols",
      "Three",
      "None"
    ],
    "correct": 0
  },
  {
    "question": "The deck has how many cards?",
    "choices": [
      "55",
      "52",
      "78",
      "100"
    ],
    "correct": 0
  },
  {
    "question": "Each card shows how many symbols?",
    "choices": [
      "8",
      "5",
      "10",
      "15"
    ],
    "correct": 0
  },
  {
    "question": "Spot It!'s European name is?",
    "choices": [
      "Dobble",
      "Snap",
      "Match",
      "Pair"
    ],
    "correct": 0
  },
  {
    "question": "Spot It! was originally published by?",
    "choices": [
      "Play Factory / Asmodee (then Blue Orange in US)",
      "Hasbro",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "Mini-games inside Spot It! include?",
    "choices": [
      "Tower, Well, Hot Potato, Poisoned Gift, Triplet",
      "Auction",
      "Solo only",
      "Bidding"
    ],
    "correct": 0
  },
  {
    "question": "The math behind Spot It! is a?",
    "choices": [
      "Finite projective plane of order 7",
      "Magic square",
      "Sudoku grid",
      "Latin square"
    ],
    "correct": 0
  },
  {
    "question": "Spot It! debuted in?",
    "choices": [
      "2009",
      "1880s",
      "2020s",
      "1950s"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count is?",
    "choices": [
      "2 to 8",
      "Solo only",
      "20 minimum",
      "Always 4"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Quick reactions and laughter",
      "Heavy strategy",
      "Solo meditation",
      "Auction"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SpotItOrigQuizSettings): SpotItOrigQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpotItOrigQuizState, action: SpotItOrigQuizAction): SpotItOrigQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpotItOrigQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
