import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StandoffPickQuizSettings { questions: "10"; }
export interface StandoffPickQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StandoffPickQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The five-weapon RPS variant added Spock and?",
    "choices": [
      "Lizard",
      "Bird",
      "Tiger",
      "Banana"
    ],
    "correct": 0
  },
  {
    "question": "Rock-Paper-Scissors-Lizard-Spock was popularised by?",
    "choices": [
      "The Big Bang Theory (TV)",
      "Star Trek",
      "Doctor Who",
      "Lost"
    ],
    "correct": 0
  },
  {
    "question": "In standard RPS, paper beats?",
    "choices": [
      "Rock",
      "Scissors",
      "Spock",
      "Lizard"
    ],
    "correct": 0
  },
  {
    "question": "Scissors lose to?",
    "choices": [
      "Rock",
      "Paper",
      "Lizard",
      "Spock"
    ],
    "correct": 0
  },
  {
    "question": "A 'Mexican standoff' refers to?",
    "choices": [
      "A confrontation where no party can win without losing",
      "A duel at noon",
      "A boxing match",
      "A poker hand"
    ],
    "correct": 0
  },
  {
    "question": "RPSLS was invented by?",
    "choices": [
      "Sam Kass and Karen Bryla",
      "Reiner Knizia",
      "Klaus Teuber",
      "Eric Lang"
    ],
    "correct": 0
  },
  {
    "question": "Lizard poisons?",
    "choices": [
      "Spock",
      "Rock",
      "Scissors",
      "Paper"
    ],
    "correct": 0
  },
  {
    "question": "Spock vaporizes?",
    "choices": [
      "Rock",
      "Paper",
      "Lizard",
      "Scissors"
    ],
    "correct": 0
  },
  {
    "question": "Competitive RPS world championships exist run by?",
    "choices": [
      "The World RPS Society",
      "FIFA",
      "NBA",
      "ATP"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Quick decisive bluffing fun",
      "Heavy strategy",
      "Solo logic",
      "Auction"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: StandoffPickQuizSettings): StandoffPickQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StandoffPickQuizState, action: StandoffPickQuizAction): StandoffPickQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StandoffPickQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
