import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TheThingAboutThingsQuizSettings { questions: "10"; }
export interface TheThingAboutThingsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TheThingAboutThingsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Thing About Things asks players to describe a thing using a?",
    "choices": [
      "Single drawn adjective card",
      "Color name",
      "Number",
      "Shape"
    ],
    "correct": 0
  },
  {
    "question": "Players score by?",
    "choices": [
      "Judge picking favourite description",
      "Memorising cards",
      "Highest die roll",
      "First to slap"
    ],
    "correct": 0
  },
  {
    "question": "The card types are typically?",
    "choices": [
      "Things and Adjectives",
      "Lands and Spells",
      "Numbers and Suits",
      "Crew and Captain"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count is roughly?",
    "choices": [
      "About 3 to 8",
      "Solo only",
      "Exactly 2",
      "20 minimum"
    ],
    "correct": 0
  },
  {
    "question": "The judging method is?",
    "choices": [
      "A rotating judge each round",
      "Always the same person",
      "By dice",
      "By coin flip"
    ],
    "correct": 0
  },
  {
    "question": "The Thing About Things' tone is?",
    "choices": [
      "Improvised humour and storytelling",
      "Heavy strategy",
      "Educational",
      "Pure puzzle"
    ],
    "correct": 0
  },
  {
    "question": "It is best described as a?",
    "choices": [
      "Party storytelling card game",
      "Trick-taking card game",
      "Roll-and-write",
      "Auction"
    ],
    "correct": 0
  },
  {
    "question": "Round length is typically?",
    "choices": [
      "A few minutes",
      "An hour",
      "Half a day",
      "Five seconds"
    ],
    "correct": 0
  },
  {
    "question": "Cards include adjectives like?",
    "choices": [
      "Sad, romantic, judgmental, etc.",
      "Numerical only",
      "Suits only",
      "Trump and trick"
    ],
    "correct": 0
  },
  {
    "question": "The game encourages?",
    "choices": [
      "Quick creative storytelling",
      "Memorising routes",
      "Building structures",
      "Mental math"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TheThingAboutThingsQuizSettings): TheThingAboutThingsQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TheThingAboutThingsQuizState, action: TheThingAboutThingsQuizAction): TheThingAboutThingsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TheThingAboutThingsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
