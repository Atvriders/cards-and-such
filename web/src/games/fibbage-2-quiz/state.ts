import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Fibbage2QuizSettings { questions: "10"; }
export interface Fibbage2QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Fibbage2QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Fibbage 2 is part of which Jackbox pack?",
    "choices": [
      "Jackbox 1",
      "Jackbox 2",
      "Jackbox 3",
      "Jackbox 9"
    ],
    "correct": 1
  },
  {
    "question": "Fibbage 2's twist over the original includes?",
    "choices": [
      "New questions and 'Defibrillator' lifeline",
      "App-free play",
      "Solo-only",
      "Tile board"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage games are played using?",
    "choices": [
      "Phones as controllers",
      "Pen and paper",
      "Dice",
      "A spinner"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage's bluff goal is to?",
    "choices": [
      "Trick others into picking your fake answer",
      "Find true answer first",
      "Roll high",
      "Dance"
    ],
    "correct": 0
  },
  {
    "question": "You earn points in Fibbage by?",
    "choices": [
      "Correct answer + duped opponents on your lie",
      "Loudest player",
      "Most cards",
      "Ranking high"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage 2 introduced what category feature?",
    "choices": [
      "Categories of questions",
      "Audio rounds",
      "Drawing",
      "Map mode"
    ],
    "correct": 0
  },
  {
    "question": "Jackbox publisher of Fibbage is?",
    "choices": [
      "Jackbox Games",
      "Hasbro",
      "Z-Man",
      "WizKids"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage 2 supports up to how many players?",
    "choices": [
      "3",
      "5",
      "8",
      "20"
    ],
    "correct": 2
  },
  {
    "question": "The 'Defibrillator' provides?",
    "choices": [
      "A second chance to remove a wrong answer",
      "Extra spin",
      "Free coin",
      "Music"
    ],
    "correct": 0
  },
  {
    "question": "Fibbage 2's mood is best described as?",
    "choices": [
      "Quiz bluffing party",
      "Heavy strategy",
      "Co-op story",
      "Auction"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Fibbage2QuizSettings): Fibbage2QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Fibbage2QuizState, action: Fibbage2QuizAction): Fibbage2QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Fibbage2QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
