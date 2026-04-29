import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ExplodingKittensQuizSettings { questions: "10"; }
export interface ExplodingKittensQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ExplodingKittensQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Exploding Kittens was co-created by?",
    "choices": [
      "Matthew Inman of The Oatmeal with Elan Lee",
      "Reiner Knizia",
      "Klaus Teuber",
      "Mike Selinker only"
    ],
    "correct": 0
  },
  {
    "question": "Exploding Kittens funded on Kickstarter to record?",
    "choices": [
      "Most backers ever for any project at the time",
      "Smallest pledge",
      "Longest delay",
      "Lowest goal"
    ],
    "correct": 0
  },
  {
    "question": "The 'Defuse' card?",
    "choices": [
      "Saves you from an Exploding Kitten when drawn",
      "Wins game",
      "Draws three cards",
      "Skips next turn only"
    ],
    "correct": 0
  },
  {
    "question": "Players are eliminated by?",
    "choices": [
      "Drawing an Exploding Kitten without defuse",
      "Running out of points",
      "Losing all coins",
      "Failing trivia"
    ],
    "correct": 0
  },
  {
    "question": "Exploding Kittens supports up to?",
    "choices": [
      "About 5 players (more in NSFW Combo)",
      "20",
      "12 base",
      "100"
    ],
    "correct": 0
  },
  {
    "question": "The 'See the Future' card lets you?",
    "choices": [
      "Peek at the top three deck cards",
      "Take any card",
      "Defuse a kitten",
      "Reset deck"
    ],
    "correct": 0
  },
  {
    "question": "The 'Skip' card?",
    "choices": [
      "Ends your turn without drawing",
      "Gives extra cards",
      "Reverses turn order",
      "Steals a card"
    ],
    "correct": 0
  },
  {
    "question": "Beyond cats, expansions include?",
    "choices": [
      "Imploding and Streaking Kittens",
      "Dragons & Dungeons only",
      "Knights only",
      "None"
    ],
    "correct": 0
  },
  {
    "question": "An NSFW edition exists for?",
    "choices": [
      "Adult-themed art and humour",
      "Solo play only",
      "Children only",
      "Cooperative play"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Lighthearted absurd humour",
      "Heavy strategy",
      "Educational",
      "Quiet reflection"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ExplodingKittensQuizSettings): ExplodingKittensQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ExplodingKittensQuizState, action: ExplodingKittensQuizAction): ExplodingKittensQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ExplodingKittensQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
