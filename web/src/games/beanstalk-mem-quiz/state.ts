import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BeanstalkMemQuizSettings { questions: "10"; }
export interface BeanstalkMemQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BeanstalkMemQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Beanstalk-style games hide cards in?",
    "choices": [
      "Stacks players must memorise",
      "Single hand only",
      "Auction",
      "No place"
    ],
    "correct": 0
  },
  {
    "question": "The famous Bohnanza family is by?",
    "choices": [
      "Uwe Rosenberg",
      "Reiner Knizia",
      "Klaus Teuber",
      "Eric Lang"
    ],
    "correct": 0
  },
  {
    "question": "Bohnanza's twist is?",
    "choices": [
      "Cannot rearrange cards in your hand",
      "Dice roll",
      "Trump suit",
      "Auction"
    ],
    "correct": 0
  },
  {
    "question": "Beanstalk-style memory rewards?",
    "choices": [
      "Recalling which bean is in which stack",
      "Speed slapping",
      "Trick-taking",
      "Negotiation"
    ],
    "correct": 0
  },
  {
    "question": "Recommended players range about?",
    "choices": [
      "2 to 5",
      "Solo",
      "20 minimum",
      "Always 4"
    ],
    "correct": 0
  },
  {
    "question": "Players score by?",
    "choices": [
      "Harvesting matching bean sets at the right time",
      "Highest die roll",
      "Auction",
      "Last sitting"
    ],
    "correct": 0
  },
  {
    "question": "Bohnanza's publisher is?",
    "choices": [
      "Lookout / Amigo / Rio Grande",
      "Hasbro",
      "Mattel",
      "WizKids"
    ],
    "correct": 0
  },
  {
    "question": "Theme of bean-stack games is?",
    "choices": [
      "Farming, planting, harvesting",
      "Space",
      "Pirates",
      "Cooking"
    ],
    "correct": 0
  },
  {
    "question": "Game length is roughly?",
    "choices": [
      "30–60 minutes",
      "All day",
      "Under 1 second",
      "10 hours"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Friendly social trading and memory",
      "Tense war",
      "Solo meditation",
      "Adult horror"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: BeanstalkMemQuizSettings): BeanstalkMemQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BeanstalkMemQuizState, action: BeanstalkMemQuizAction): BeanstalkMemQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BeanstalkMemQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
