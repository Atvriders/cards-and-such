import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ThingAboutThingsQuizSettings { questions: "10"; }
export interface ThingAboutThingsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ThingAboutThingsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Thing About Things asks players to do what?",
    "choices": [
      "Describe an item with random adjectives",
      "Race numbers",
      "Trade tokens",
      "Battle"
    ],
    "correct": 0
  },
  {
    "question": "Players draw which kind of card to describe?",
    "choices": [
      "Adjective card",
      "Action card",
      "Map card",
      "Trump card"
    ],
    "correct": 0
  },
  {
    "question": "Other players guess what?",
    "choices": [
      "The item being described",
      "The drawer",
      "A song",
      "Math sums"
    ],
    "correct": 0
  },
  {
    "question": "The Thing About Things plays in which time range?",
    "choices": [
      "1 hour",
      "Quick rounds <30 min",
      "All day",
      "10 days"
    ],
    "correct": 1
  },
  {
    "question": "Players win rounds by?",
    "choices": [
      "Correct guesses",
      "Trump cards",
      "Bid auctions",
      "Dancing"
    ],
    "correct": 0
  },
  {
    "question": "It is best with how many players?",
    "choices": [
      "Solo",
      "Just 2",
      "3-8 commonly",
      "20+"
    ],
    "correct": 2
  },
  {
    "question": "Cards typically include nouns and?",
    "choices": [
      "Random adjectives that warp tone",
      "Math operators",
      "Map tiles",
      "Coins"
    ],
    "correct": 0
  },
  {
    "question": "Tone and humor come from?",
    "choices": [
      "Mismatched describer-adjectives",
      "Dice rolls",
      "Time pressure",
      "Drawing"
    ],
    "correct": 0
  },
  {
    "question": "This is similar in feel to?",
    "choices": [
      "Tic-tac-toe",
      "Apples to Apples",
      "Chess",
      "Risk"
    ],
    "correct": 1
  },
  {
    "question": "It is enjoyed mostly for?",
    "choices": [
      "Funny improv descriptions",
      "Math optimizing",
      "Memory tricks",
      "Combat"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ThingAboutThingsQuizSettings): ThingAboutThingsQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ThingAboutThingsQuizState, action: ThingAboutThingsQuizAction): ThingAboutThingsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ThingAboutThingsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
