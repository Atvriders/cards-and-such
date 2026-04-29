import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ClassicCharadesQuizSettings { questions: "10"; }
export interface ClassicCharadesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ClassicCharadesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Charades dates back to which century?",
    "choices": [
      "19th",
      "18th",
      "17th",
      "16th"
    ],
    "correct": 0
  },
  {
    "question": "Charades is fundamentally a game of?",
    "choices": [
      "Word silent acting",
      "Drawing",
      "Cards",
      "Math"
    ],
    "correct": 0
  },
  {
    "question": "In classic Charades, the actor may NOT do what?",
    "choices": [
      "Speak",
      "Mime",
      "Use gestures",
      "Use facial expressions"
    ],
    "correct": 0
  },
  {
    "question": "The traditional Charades 'movie' gesture is?",
    "choices": [
      "Two hands rolling old camera crank",
      "Open book",
      "Square fingers",
      "Microphone hold"
    ],
    "correct": 0
  },
  {
    "question": "The 'book' gesture in Charades is typically?",
    "choices": [
      "Open palms together",
      "Crossed arms",
      "Hand to ear",
      "Pointing up"
    ],
    "correct": 0
  },
  {
    "question": "Touching your ear in Charades means?",
    "choices": [
      "Sounds like",
      "Movie title",
      "Person",
      "Place"
    ],
    "correct": 0
  },
  {
    "question": "Charades scores rely on?",
    "choices": [
      "Time to guess and number correct",
      "Strict art",
      "Auction bids",
      "Random rolls"
    ],
    "correct": 0
  },
  {
    "question": "Classic Charades works best with what group size?",
    "choices": [
      "Solo",
      "2 only",
      "4-20 in teams",
      "100+"
    ],
    "correct": 2
  },
  {
    "question": "In Charades, syllable count is shown by?",
    "choices": [
      "Fingers on forearm",
      "Toe taps",
      "Drawing dashes",
      "Eye blinks"
    ],
    "correct": 0
  },
  {
    "question": "'Whole title' in Charades is signaled with?",
    "choices": [
      "Sweeping hand outline",
      "Stomp",
      "Yell",
      "Closed eyes"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ClassicCharadesQuizSettings): ClassicCharadesQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ClassicCharadesQuizState, action: ClassicCharadesQuizAction): ClassicCharadesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ClassicCharadesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
