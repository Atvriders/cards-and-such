import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FluxxBaseQuizSettings { questions: "10"; }
export interface FluxxBaseQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FluxxBaseQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Fluxx was created by?",
    "choices": [
      "Andrew Looney",
      "Reiner Knizia",
      "Klaus Teuber",
      "Eric Lang"
    ],
    "correct": 0
  },
  {
    "question": "Fluxx is published by?",
    "choices": [
      "Looney Labs",
      "Hasbro",
      "Mattel",
      "Z-Man"
    ],
    "correct": 0
  },
  {
    "question": "Fluxx's starting rule is always?",
    "choices": [
      "Draw 1, Play 1",
      "Draw 5",
      "No draw",
      "Skip first"
    ],
    "correct": 0
  },
  {
    "question": "Card types in classic Fluxx include?",
    "choices": [
      "New Rule, Goal, Keeper, Action",
      "Land, Spell, Creature, Sorcery",
      "Trump, Suit, Court, Joker",
      "Crew, Captain, Ship, Port"
    ],
    "correct": 0
  },
  {
    "question": "Creeper cards were introduced to?",
    "choices": [
      "Block winning until removed",
      "Reset deck",
      "Add a goal",
      "Skip turns"
    ],
    "correct": 0
  },
  {
    "question": "Fluxx debuted in?",
    "choices": [
      "1997",
      "1880s",
      "2010s",
      "2020s"
    ],
    "correct": 0
  },
  {
    "question": "The win condition is?",
    "choices": [
      "Whatever the current Goal card says",
      "Most cards",
      "Highest score",
      "Last sitting"
    ],
    "correct": 0
  },
  {
    "question": "Themed Fluxx editions include?",
    "choices": [
      "Star, Zombie, Pirate, Cthulhu, Monty Python",
      "Bird, Cat, Dog only",
      "Auction edition only",
      "Solo only"
    ],
    "correct": 0
  },
  {
    "question": "Fluxx's tone is?",
    "choices": [
      "Light, chaotic, family party",
      "Heavy strategy",
      "Solo grind",
      "Adult horror"
    ],
    "correct": 0
  },
  {
    "question": "Recommended players?",
    "choices": [
      "2 to 6",
      "Solo only",
      "20 minimum",
      "Always 4"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: FluxxBaseQuizSettings): FluxxBaseQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FluxxBaseQuizState, action: FluxxBaseQuizAction): FluxxBaseQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FluxxBaseQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
