import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WhoonuQuizSettings { questions: "10"; }
export interface WhoonuQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WhoonuQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Whoonu was originally published by?",
    "choices": [
      "Cranium",
      "Hasbro",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "The judge each round is called?",
    "choices": [
      "The Whoonu",
      "The Captain",
      "The Director",
      "The Boss"
    ],
    "correct": 0
  },
  {
    "question": "Players play cards face-down based on?",
    "choices": [
      "What they think the Whoonu likes most",
      "Trump suit",
      "Random",
      "Hand size"
    ],
    "correct": 0
  },
  {
    "question": "Scoring rewards?",
    "choices": [
      "Cards ranked highest by the Whoonu",
      "Lowest only",
      "Random draw",
      "Memorising past picks"
    ],
    "correct": 0
  },
  {
    "question": "Cards in Whoonu represent?",
    "choices": [
      "Favourite-things items like 'pizza' or 'dolphins'",
      "Numbers only",
      "Trump cards",
      "Suit cards"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count is?",
    "choices": [
      "About 3 to 6",
      "Solo",
      "Exactly 2",
      "12 minimum"
    ],
    "correct": 0
  },
  {
    "question": "Game length is roughly?",
    "choices": [
      "20–30 minutes",
      "Under 1 minute",
      "Several hours",
      "All day"
    ],
    "correct": 0
  },
  {
    "question": "Whoonu is best described as?",
    "choices": [
      "A casual social favorites-ranking party game",
      "Heavy strategy",
      "Roll-and-write",
      "Cooperative deck builder"
    ],
    "correct": 0
  },
  {
    "question": "Whoonu rotates the judge so?",
    "choices": [
      "Everyone is the focus eventually",
      "Same player always",
      "By dice each turn",
      "By die rolls"
    ],
    "correct": 0
  },
  {
    "question": "The mood of Whoonu is?",
    "choices": [
      "Sweet, social, ice-breaker",
      "Tense",
      "Educational only",
      "Highly competitive"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: WhoonuQuizSettings): WhoonuQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WhoonuQuizState, action: WhoonuQuizAction): WhoonuQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WhoonuQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
