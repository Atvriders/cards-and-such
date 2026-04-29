import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GuessWhoCardQuizSettings { questions: "10"; }
export interface GuessWhoCardQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GuessWhoCardQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Guess Who? Card Game is by?",
    "choices": [
      "Hasbro / Winning Moves card edition",
      "Mattel only",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "Each player picks a?",
    "choices": [
      "Mystery character card",
      "Suit card",
      "Number tile",
      "Land card"
    ],
    "correct": 0
  },
  {
    "question": "Typical player count is?",
    "choices": [
      "2",
      "4",
      "6",
      "10"
    ],
    "correct": 0
  },
  {
    "question": "Players ask questions about?",
    "choices": [
      "Visible feature traits like hair colour",
      "Numerical hand size",
      "Trump suit",
      "Round count"
    ],
    "correct": 0
  },
  {
    "question": "Cards are eliminated by?",
    "choices": [
      "Flipping ones that don't match the answer",
      "Folding",
      "Discarding to deck",
      "Tucking"
    ],
    "correct": 0
  },
  {
    "question": "The classic boxed version uses?",
    "choices": [
      "Plastic flip-up panels",
      "Flat tiles only",
      "App",
      "Spinner"
    ],
    "correct": 0
  },
  {
    "question": "First to correctly identify wins by?",
    "choices": [
      "Naming opponent's character first",
      "Highest score",
      "Most cards",
      "Rolling double"
    ],
    "correct": 0
  },
  {
    "question": "The card edition's key benefit is?",
    "choices": [
      "Compact and travel-friendly",
      "More characters always",
      "Cooperative play",
      "Deck-building"
    ],
    "correct": 0
  },
  {
    "question": "Guess Who? originally launched in?",
    "choices": [
      "1979 (Milton Bradley)",
      "1920s",
      "2010s",
      "1990s only"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Light family deduction",
      "Heavy war-gaming",
      "Solo logic",
      "Adult bluffing"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: GuessWhoCardQuizSettings): GuessWhoCardQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GuessWhoCardQuizState, action: GuessWhoCardQuizAction): GuessWhoCardQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GuessWhoCardQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
