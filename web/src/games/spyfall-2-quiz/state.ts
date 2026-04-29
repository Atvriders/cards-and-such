import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Spyfall2QuizSettings { questions: "10"; }
export interface Spyfall2QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Spyfall2QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Spyfall 2 differs from Spyfall 1 by?",
    "choices": [
      "Supporting more players and adding a second spy",
      "Removing locations",
      "Solo play",
      "No timer"
    ],
    "correct": 0
  },
  {
    "question": "Spyfall 2 supports up to how many players?",
    "choices": [
      "12",
      "4",
      "20",
      "30"
    ],
    "correct": 0
  },
  {
    "question": "The non-spy players know?",
    "choices": [
      "The shared secret location",
      "Nothing",
      "Each other's roles only",
      "The spy's identity"
    ],
    "correct": 0
  },
  {
    "question": "Spies win by?",
    "choices": [
      "Guessing the location or surviving",
      "Earning the most chips",
      "Drawing aces",
      "Reaching the centre"
    ],
    "correct": 0
  },
  {
    "question": "Each round's timer is typically?",
    "choices": [
      "About 8 minutes",
      "30 seconds",
      "An hour",
      "No limit"
    ],
    "correct": 0
  },
  {
    "question": "Players ask?",
    "choices": [
      "Each other questions about the location",
      "The judge for hints",
      "Random trivia",
      "About hand sizes"
    ],
    "correct": 0
  },
  {
    "question": "Spyfall 2 was designed by?",
    "choices": [
      "Alexandr Ushan",
      "Reiner Knizia",
      "Eric Lang",
      "Vlaada Chvátil"
    ],
    "correct": 0
  },
  {
    "question": "Vote a spy by?",
    "choices": [
      "Unanimous accusation pause-vote",
      "Majority show of hands",
      "Secret coin",
      "Auction"
    ],
    "correct": 0
  },
  {
    "question": "Spyfall 2 publisher is?",
    "choices": [
      "Cryptozoic / Hobby World",
      "Mattel",
      "Ravensburger",
      "Pegasus only"
    ],
    "correct": 0
  },
  {
    "question": "Number of locations roughly?",
    "choices": [
      "About 30 in the base",
      "Three",
      "200",
      "Five"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Spyfall2QuizSettings): Spyfall2QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Spyfall2QuizState, action: Spyfall2QuizAction): Spyfall2QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Spyfall2QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
