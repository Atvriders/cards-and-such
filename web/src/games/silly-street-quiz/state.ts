import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SillyStreetQuizSettings { questions: "10"; }
export interface SillyStreetQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SillyStreetQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Silly Street is best described as?",
    "choices": [
      "A children's physical-challenge card game with a board",
      "A heavy euro game",
      "Solo puzzle",
      "Auction"
    ],
    "correct": 0
  },
  {
    "question": "Players advance by?",
    "choices": [
      "Successfully completing silly challenges from cards",
      "Highest die roll",
      "Trick-taking",
      "Bidding"
    ],
    "correct": 0
  },
  {
    "question": "Recommended ages are roughly?",
    "choices": [
      "4 and up",
      "16 and up",
      "30 and up",
      "Adults only"
    ],
    "correct": 0
  },
  {
    "question": "Card challenges include?",
    "choices": [
      "Acting like animals, telling jokes, dance moves",
      "Long division",
      "Memorising lists",
      "Heavy strategy"
    ],
    "correct": 0
  },
  {
    "question": "Silly Street was created by?",
    "choices": [
      "A team led by Vince Crook (Buffalo Games released widely)",
      "Klaus Teuber",
      "Reiner Knizia",
      "Eric Lang"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count is?",
    "choices": [
      "About 2 to 6",
      "Solo only",
      "12 minimum",
      "Adults exactly 2"
    ],
    "correct": 0
  },
  {
    "question": "Game length is typically?",
    "choices": [
      "About 20 minutes",
      "Several hours",
      "Under a minute",
      "All day"
    ],
    "correct": 0
  },
  {
    "question": "Silly Street's tone is?",
    "choices": [
      "Joyful, energetic, kid-friendly",
      "Tense strategy",
      "Adult horror",
      "Solo meditative"
    ],
    "correct": 0
  },
  {
    "question": "The board features?",
    "choices": [
      "A winding colorful path of spaces",
      "A hex map",
      "Solo puzzle grid",
      "Letter grid"
    ],
    "correct": 0
  },
  {
    "question": "The game is praised for?",
    "choices": [
      "Encouraging shy kids to play and move",
      "Deep strategy",
      "Solo puzzling",
      "Long sessions"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SillyStreetQuizSettings): SillyStreetQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SillyStreetQuizState, action: SillyStreetQuizAction): SillyStreetQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SillyStreetQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
