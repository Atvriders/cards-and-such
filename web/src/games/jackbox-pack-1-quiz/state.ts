import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface JackboxPack1QuizSettings { questions: "10"; }
export interface JackboxPack1QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type JackboxPack1QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Jackbox Party Pack 1 includes which famous bluffer?",
    "choices": [
      "Fibbage XL",
      "Quiplash",
      "Drawful 2",
      "Patently Stupid"
    ],
    "correct": 0
  },
  {
    "question": "Pack 1 includes which drawing game?",
    "choices": [
      "Drawful (1)",
      "Tee K.O.",
      "Champ'd Up",
      "Roomerang"
    ],
    "correct": 0
  },
  {
    "question": "Pack 1's word association game is?",
    "choices": [
      "Word Spud",
      "Blather Round",
      "Talking Points",
      "Job Job"
    ],
    "correct": 0
  },
  {
    "question": "Pack 1 was released in which year?",
    "choices": [
      "2014",
      "2016",
      "2018",
      "2020"
    ],
    "correct": 0
  },
  {
    "question": "Pack 1's developer is?",
    "choices": [
      "Jackbox Games",
      "Mattel",
      "Hasbro",
      "Asmodee"
    ],
    "correct": 0
  },
  {
    "question": "Pack 1 supports up to how many players?",
    "choices": [
      "4",
      "8",
      "100",
      "Varies by game"
    ],
    "correct": 3
  },
  {
    "question": "Pack 1's 'Lie Swatter' challenges players to?",
    "choices": [
      "Spot fake facts fast",
      "Throw cards",
      "Bid",
      "Auction"
    ],
    "correct": 0
  },
  {
    "question": "Pack 1 expanded the JB You Don't Know Jack via which entry?",
    "choices": [
      "You Don't Know Jack 2015",
      "Big Brain Battle",
      "Trivia Murder Party",
      "Quiplash 3"
    ],
    "correct": 0
  },
  {
    "question": "Pack 1's audience join URL is?",
    "choices": [
      "jackbox.tv",
      "playjackbox.com",
      "jackbox.io",
      "jbgames.tv"
    ],
    "correct": 0
  },
  {
    "question": "Pack 1 is best with which group?",
    "choices": [
      "Party players",
      "Solo only",
      "Wargames only",
      "Toddlers"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: JackboxPack1QuizSettings): JackboxPack1QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: JackboxPack1QuizState, action: JackboxPack1QuizAction): JackboxPack1QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: JackboxPack1QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
