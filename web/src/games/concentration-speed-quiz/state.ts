import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ConcentrationSpeedQuizSettings { questions: "10"; }
export interface ConcentrationSpeedQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ConcentrationSpeedQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Concentration is also known as?",
    "choices": [
      "Memory or Match-Up",
      "War",
      "Whist",
      "Skat"
    ],
    "correct": 0
  },
  {
    "question": "Speed Concentration adds?",
    "choices": [
      "A short timer for each turn or whole game",
      "Auction",
      "Trick-taking",
      "Bidding"
    ],
    "correct": 0
  },
  {
    "question": "Players win Concentration by?",
    "choices": [
      "Collecting the most matched pairs",
      "Highest score by points",
      "Bidding most",
      "Random draw"
    ],
    "correct": 0
  },
  {
    "question": "An incorrect flip means?",
    "choices": [
      "Tiles return face-down",
      "Lose all pairs",
      "Skip 3 turns",
      "Steal opponent pair"
    ],
    "correct": 0
  },
  {
    "question": "Recommended ages typically?",
    "choices": [
      "3 or 4 and up",
      "21 and up",
      "16 and up",
      "Adults only"
    ],
    "correct": 0
  },
  {
    "question": "Concentration's cognitive benefit is?",
    "choices": [
      "Boosts short-term spatial memory",
      "Calculus",
      "Coding",
      "Auction strategy"
    ],
    "correct": 0
  },
  {
    "question": "The classic deck size is often?",
    "choices": [
      "A 52 card deck or specialised pair deck",
      "78 tarot",
      "Spot It deck",
      "UNO"
    ],
    "correct": 0
  },
  {
    "question": "Speed timers commonly used are?",
    "choices": [
      "1–10 seconds per flip",
      "1 hour per turn",
      "Days",
      "None"
    ],
    "correct": 0
  },
  {
    "question": "Game tone for speed variant?",
    "choices": [
      "Tense, racing, family fun",
      "Slow strategy",
      "Solo meditation",
      "Adult horror"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count?",
    "choices": [
      "2 to 4",
      "Solo only",
      "20 minimum",
      "Always 6"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ConcentrationSpeedQuizSettings): ConcentrationSpeedQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ConcentrationSpeedQuizState, action: ConcentrationSpeedQuizAction): ConcentrationSpeedQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ConcentrationSpeedQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
