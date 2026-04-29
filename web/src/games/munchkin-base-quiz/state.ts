import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MunchkinBaseQuizSettings { questions: "10"; }
export interface MunchkinBaseQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MunchkinBaseQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Munchkin was designed by?",
    "choices": [
      "Steve Jackson",
      "Reiner Knizia",
      "Klaus Teuber",
      "Eric Lang"
    ],
    "correct": 0
  },
  {
    "question": "Munchkin is illustrated mainly by?",
    "choices": [
      "John Kovalic",
      "Mike Mignola",
      "Gary Gianni",
      "Wayne Reynolds"
    ],
    "correct": 0
  },
  {
    "question": "First to reach which level wins?",
    "choices": [
      "Level 10",
      "Level 5",
      "Level 20",
      "Level 100"
    ],
    "correct": 0
  },
  {
    "question": "Munchkin's two card decks are?",
    "choices": [
      "Door and Treasure",
      "Spell and Land",
      "Crew and Captain",
      "Trump and Suit"
    ],
    "correct": 0
  },
  {
    "question": "Munchkin debuted in?",
    "choices": [
      "2001",
      "1880s",
      "2020s",
      "1950s"
    ],
    "correct": 0
  },
  {
    "question": "Munchkin satirizes?",
    "choices": [
      "Dungeons & Dragons-style RPGs",
      "Boxing matches",
      "Stock markets",
      "Naval combat"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count?",
    "choices": [
      "3 to 6",
      "Solo only",
      "20 minimum",
      "Exactly 2"
    ],
    "correct": 0
  },
  {
    "question": "Munchkin themed editions include?",
    "choices": [
      "Zombies, Cthulhu, Space, Bites, Apocalypse",
      "Just one",
      "Cooking only",
      "Solo only"
    ],
    "correct": 0
  },
  {
    "question": "Game length is roughly?",
    "choices": [
      "About an hour",
      "Several days",
      "Under 1 second",
      "10 hours"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Cheeky backstabbing humour",
      "Heavy strategy",
      "Educational",
      "Calm reflection"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MunchkinBaseQuizSettings): MunchkinBaseQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MunchkinBaseQuizState, action: MunchkinBaseQuizAction): MunchkinBaseQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MunchkinBaseQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
