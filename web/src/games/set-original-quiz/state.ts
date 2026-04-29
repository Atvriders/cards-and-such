import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SetOriginalQuizSettings { questions: "10"; }
export interface SetOriginalQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SetOriginalQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "A SET deck contains how many cards?",
    "choices": [
      "81",
      "52",
      "100",
      "78"
    ],
    "correct": 0
  },
  {
    "question": "SET cards vary in how many traits?",
    "choices": [
      "4 (number, color, shape, shading)",
      "2",
      "3",
      "5"
    ],
    "correct": 0
  },
  {
    "question": "A valid SET requires every trait to be?",
    "choices": [
      "All same OR all different across the 3 cards",
      "All same only",
      "All different only",
      "Random"
    ],
    "correct": 0
  },
  {
    "question": "SET was invented by?",
    "choices": [
      "Marsha Falco",
      "Reiner Knizia",
      "Klaus Teuber",
      "Eric Lang"
    ],
    "correct": 0
  },
  {
    "question": "SET was first published in?",
    "choices": [
      "1991",
      "1880s",
      "2010s",
      "2050s"
    ],
    "correct": 0
  },
  {
    "question": "The shapes on cards are?",
    "choices": [
      "Diamond, oval, squiggle",
      "Star, sun, moon",
      "Circle, square, triangle",
      "Heart, club, spade"
    ],
    "correct": 0
  },
  {
    "question": "A 'cap' in SET refers to?",
    "choices": [
      "Maximum cardinal set with no SET (max 20 in 4D)",
      "Highest score",
      "Trump suit",
      "Stack height"
    ],
    "correct": 0
  },
  {
    "question": "A typical layout shows?",
    "choices": [
      "A 3×4 array of 12 cards face-up",
      "A row of 5 cards",
      "One card",
      "10×10 grid"
    ],
    "correct": 0
  },
  {
    "question": "If no SET exists in 12 cards, dealer adds?",
    "choices": [
      "3 more cards (extending to 15)",
      "10 more",
      "Just 1",
      "Reshuffles"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Pure visual logic and pattern racing",
      "Auction",
      "Trick-taking",
      "Roll-and-write"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SetOriginalQuizSettings): SetOriginalQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SetOriginalQuizState, action: SetOriginalQuizAction): SetOriginalQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SetOriginalQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
