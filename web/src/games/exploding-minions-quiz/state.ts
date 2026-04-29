import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ExplodingMinionsQuizSettings { questions: "10"; }
export interface ExplodingMinionsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ExplodingMinionsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Exploding Minions is themed around?",
    "choices": [
      "The Minions from Despicable Me",
      "Garfield",
      "Snoopy",
      "Mickey Mouse"
    ],
    "correct": 0
  },
  {
    "question": "Exploding Minions is published by?",
    "choices": [
      "Exploding Kittens Inc.",
      "Hasbro",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "Defuse cards in Minions theme become?",
    "choices": [
      "Banana cards",
      "Pizza",
      "Brains",
      "Spices"
    ],
    "correct": 0
  },
  {
    "question": "The licensing partner is?",
    "choices": [
      "Universal / Illumination",
      "Disney",
      "Warner Bros.",
      "Sony"
    ],
    "correct": 0
  },
  {
    "question": "Exploding Minions plays?",
    "choices": [
      "The same as base Exploding Kittens",
      "Cooperatively only",
      "Solo only",
      "Auction"
    ],
    "correct": 0
  },
  {
    "question": "Player count?",
    "choices": [
      "2 to 5",
      "Solo",
      "20 minimum",
      "Always 4"
    ],
    "correct": 0
  },
  {
    "question": "Game length?",
    "choices": [
      "About 15 minutes",
      "All day",
      "Under 1 second",
      "10 hours"
    ],
    "correct": 0
  },
  {
    "question": "The Minions movies were released starting?",
    "choices": [
      "2015 (spin-off film)",
      "1990",
      "2000",
      "2050"
    ],
    "correct": 0
  },
  {
    "question": "Game tone?",
    "choices": [
      "Goofy family humour",
      "Heavy strategy",
      "Educational",
      "Adult horror"
    ],
    "correct": 0
  },
  {
    "question": "It is generally?",
    "choices": [
      "A standalone deck (also mixable with EK)",
      "Expansion-only",
      "Card-add-on only",
      "App-only"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ExplodingMinionsQuizSettings): ExplodingMinionsQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ExplodingMinionsQuizState, action: ExplodingMinionsQuizAction): ExplodingMinionsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ExplodingMinionsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
