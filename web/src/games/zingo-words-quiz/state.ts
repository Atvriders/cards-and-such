import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ZingoWordsQuizSettings { questions: "10"; }
export interface ZingoWordsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ZingoWordsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Zingo! Word Builder is by?",
    "choices": [
      "ThinkFun",
      "Hasbro",
      "Mattel",
      "Z-Man"
    ],
    "correct": 0
  },
  {
    "question": "The Word Builder Zinger dispenses?",
    "choices": [
      "Letter tiles",
      "Number tiles",
      "Coin tiles",
      "Dice"
    ],
    "correct": 0
  },
  {
    "question": "Players race to?",
    "choices": [
      "Spell sight words on their card",
      "Match images only",
      "Bid coins",
      "Take tricks"
    ],
    "correct": 0
  },
  {
    "question": "Recommended ages?",
    "choices": [
      "About 5 and up",
      "Adults only",
      "21+",
      "Under 1"
    ],
    "correct": 0
  },
  {
    "question": "Game's purpose is?",
    "choices": [
      "Early literacy through spelling sight-words",
      "Calculus drill",
      "Auction strategy",
      "Coding"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count is?",
    "choices": [
      "2 to 6",
      "Solo only",
      "20 minimum",
      "Always 4"
    ],
    "correct": 0
  },
  {
    "question": "Game length is roughly?",
    "choices": [
      "About 15 minutes",
      "An hour",
      "All day",
      "Under 1 second"
    ],
    "correct": 0
  },
  {
    "question": "An incorrect grab returns?",
    "choices": [
      "The tile to the dispenser",
      "Wins game",
      "Loses 3 turns",
      "Skips opponent"
    ],
    "correct": 0
  },
  {
    "question": "Sight words are?",
    "choices": [
      "High-frequency words children learn early",
      "Math equations",
      "Coding tokens",
      "Random nonsense"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Joyful, energetic, educational",
      "Tense competitive",
      "Adult horror",
      "Slow strategy"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ZingoWordsQuizSettings): ZingoWordsQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ZingoWordsQuizState, action: ZingoWordsQuizAction): ZingoWordsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ZingoWordsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
