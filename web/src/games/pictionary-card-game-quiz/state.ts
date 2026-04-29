import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PictionaryCardGameQuizSettings { questions: "10"; }
export interface PictionaryCardGameQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PictionaryCardGameQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Pictionary Card Game travels well because it has no what?",
    "choices": [
      "Cards",
      "Pencils",
      "Board",
      "Timer"
    ],
    "correct": 2
  },
  {
    "question": "Pictionary Card Game players use which to draw?",
    "choices": [
      "Sand timers and paper",
      "Phones",
      "Just gestures",
      "Flashcards only"
    ],
    "correct": 0
  },
  {
    "question": "In compact Pictionary, who guesses?",
    "choices": [
      "Solo player",
      "Team mates",
      "The judge",
      "Everyone but the drawer"
    ],
    "correct": 1
  },
  {
    "question": "Pictionary Card was sized to be?",
    "choices": [
      "A board game box",
      "A pocket card pack",
      "Floor sized",
      "App only"
    ],
    "correct": 1
  },
  {
    "question": "How many Pictionary categories appear on most cards?",
    "choices": [
      "Three",
      "Four",
      "Five",
      "Six"
    ],
    "correct": 2
  },
  {
    "question": "Most Pictionary card games include sand timers of how long?",
    "choices": [
      "15 seconds",
      "60 seconds",
      "3 minutes",
      "5 minutes"
    ],
    "correct": 1
  },
  {
    "question": "The 'AP' category in Pictionary stands for?",
    "choices": [
      "All Play",
      "Answer Please",
      "Animal Person",
      "Action Pose"
    ],
    "correct": 0
  },
  {
    "question": "Compact Pictionary is best with how many players?",
    "choices": [
      "Exactly 2",
      "3 to 6",
      "10 only",
      "20+"
    ],
    "correct": 1
  },
  {
    "question": "The drawer is forbidden from which?",
    "choices": [
      "Speaking",
      "Drawing letters",
      "Both A and B",
      "Erasing"
    ],
    "correct": 2
  },
  {
    "question": "Pictionary Card Game emphasizes which feel?",
    "choices": [
      "Slow strategic",
      "Fast and travel-friendly",
      "Roleplaying",
      "Memory matching"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PictionaryCardGameQuizSettings): PictionaryCardGameQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PictionaryCardGameQuizState, action: PictionaryCardGameQuizAction): PictionaryCardGameQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PictionaryCardGameQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
