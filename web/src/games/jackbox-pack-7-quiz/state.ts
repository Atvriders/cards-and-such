import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface JackboxPack7QuizSettings { questions: "10"; }
export interface JackboxPack7QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type JackboxPack7QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Jackbox Party Pack 7 includes which sequel quip game?",
    "choices": [
      "Quiplash 3",
      "Quiplash 1",
      "Quiplash 2",
      "Quiplash XL"
    ],
    "correct": 0
  },
  {
    "question": "Pack 7's drawing game is?",
    "choices": [
      "Champ'd Up",
      "Drawful 2",
      "Tee K.O.",
      "Roomerang"
    ],
    "correct": 0
  },
  {
    "question": "Pack 7's spectrum / clue game is?",
    "choices": [
      "Blather Round",
      "Wavelength",
      "Wits & Wagers",
      "Codenames"
    ],
    "correct": 0
  },
  {
    "question": "Pack 7 was released in?",
    "choices": [
      "2018",
      "2019",
      "2020",
      "2022"
    ],
    "correct": 2
  },
  {
    "question": "Pack 7's intro game is?",
    "choices": [
      "Talking Points",
      "Word Spud",
      "Survive the Internet",
      "Lie Swatter"
    ],
    "correct": 0
  },
  {
    "question": "Pack 7's 'Talking Points' has presenters do what?",
    "choices": [
      "Improvise from oddly chosen slides",
      "Auction stocks",
      "Sing",
      "Dance"
    ],
    "correct": 0
  },
  {
    "question": "Pack 7's 'The Devils and the Details' is?",
    "choices": [
      "Co-op chaos roommates",
      "Solo dungeon",
      "Trick taking",
      "Worker placement"
    ],
    "correct": 0
  },
  {
    "question": "Pack 7 supports up to how many in audience?",
    "choices": [
      "8",
      "16",
      "100",
      "Unlimited"
    ],
    "correct": 0
  },
  {
    "question": "Pack 7 is on which platforms?",
    "choices": [
      "Steam, consoles, mobile (TV)",
      "Browser only",
      "iOS only",
      "Switch only"
    ],
    "correct": 0
  },
  {
    "question": "Pack 7 is published by?",
    "choices": [
      "Jackbox Games",
      "Hasbro",
      "Mattel",
      "WotC"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: JackboxPack7QuizSettings): JackboxPack7QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: JackboxPack7QuizState, action: JackboxPack7QuizAction): JackboxPack7QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: JackboxPack7QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
