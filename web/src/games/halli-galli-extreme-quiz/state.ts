import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HalliGalliExtremeQuizSettings { questions: "10"; }
export interface HalliGalliExtremeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HalliGalliExtremeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Halli Galli Extreme is published by?",
    "choices": [
      "Amigo Spiele",
      "Hasbro",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "Halli Galli's signature accessory is the?",
    "choices": [
      "Bell at the centre of the table",
      "Sand timer",
      "Spinner",
      "Dice cup"
    ],
    "correct": 0
  },
  {
    "question": "The base Halli Galli rings on?",
    "choices": [
      "Exactly five fruits of one kind visible",
      "Three of a kind only",
      "Random rolls",
      "Trump suit"
    ],
    "correct": 0
  },
  {
    "question": "Halli Galli Extreme adds?",
    "choices": [
      "Tougher counting and odd/even rules",
      "Auction",
      "Solo play only",
      "Trick-taking"
    ],
    "correct": 0
  },
  {
    "question": "Halli Galli was designed by?",
    "choices": [
      "Haim Shafir",
      "Reiner Knizia",
      "Klaus Teuber",
      "Wolfgang Kramer"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count is?",
    "choices": [
      "2 to 6",
      "Solo",
      "20 minimum",
      "Always 4"
    ],
    "correct": 0
  },
  {
    "question": "Game length is roughly?",
    "choices": [
      "About 15 minutes",
      "An hour",
      "All day",
      "Under a second"
    ],
    "correct": 0
  },
  {
    "question": "Wrongly ringing the bell?",
    "choices": [
      "Costs cards as a penalty",
      "Skips your turn",
      "Wins game",
      "Adds a kitten"
    ],
    "correct": 0
  },
  {
    "question": "Recommended ages?",
    "choices": [
      "6 and up",
      "21 and up",
      "16 and up",
      "Adults only"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Fast slapping family chaos",
      "Heavy strategy",
      "Solo meditation",
      "Auction"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HalliGalliExtremeQuizSettings): HalliGalliExtremeQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HalliGalliExtremeQuizState, action: HalliGalliExtremeQuizAction): HalliGalliExtremeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HalliGalliExtremeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
