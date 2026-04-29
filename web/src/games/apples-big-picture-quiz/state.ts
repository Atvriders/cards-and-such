import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ApplesBigPictureQuizSettings { questions: "10"; }
export interface ApplesBigPictureQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ApplesBigPictureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Apples to Apples Big Picture replaces what?",
    "choices": [
      "Adjectives with images",
      "Nouns with images",
      "Both with images",
      "Words with songs"
    ],
    "correct": 1
  },
  {
    "question": "Big Picture players judge based on?",
    "choices": [
      "Best matching image to adjective",
      "Random draw",
      "Bidding",
      "Vote count alone"
    ],
    "correct": 0
  },
  {
    "question": "Big Picture cards are best described as?",
    "choices": [
      "Photos and illustrations",
      "Plain text",
      "Numbers",
      "Music samples"
    ],
    "correct": 0
  },
  {
    "question": "Big Picture suits which players best?",
    "choices": [
      "Visual learners",
      "Math majors",
      "Babies",
      "Pros only"
    ],
    "correct": 0
  },
  {
    "question": "Big Picture is sized for how many players?",
    "choices": [
      "1",
      "2 only",
      "4 to 10",
      "30+"
    ],
    "correct": 2
  },
  {
    "question": "Big Picture rotation rules match?",
    "choices": [
      "Original rules",
      "Solo only",
      "Auction only",
      "Drafting"
    ],
    "correct": 0
  },
  {
    "question": "Apples to Apples publisher is?",
    "choices": [
      "Mattel",
      "Hasbro",
      "Ravensburger",
      "Mattel/Out of the Box originally"
    ],
    "correct": 3
  },
  {
    "question": "Big Picture rounds can be?",
    "choices": [
      "Quick or extended like base",
      "Five minutes minimum",
      "All night",
      "Always 30 seconds"
    ],
    "correct": 0
  },
  {
    "question": "Big Picture emphasizes?",
    "choices": [
      "Visual interpretation",
      "Memorization",
      "Math",
      "Speed"
    ],
    "correct": 0
  },
  {
    "question": "Players compare images to what kind of card?",
    "choices": [
      "Green apple adjective",
      "Yellow apple",
      "Red apple",
      "Black apple"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ApplesBigPictureQuizSettings): ApplesBigPictureQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ApplesBigPictureQuizState, action: ApplesBigPictureQuizAction): ApplesBigPictureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ApplesBigPictureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
