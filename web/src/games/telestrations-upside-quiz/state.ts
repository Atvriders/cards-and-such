import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TelestrationsUpsideQuizSettings { questions: "10"; }
export interface TelestrationsUpsideQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TelestrationsUpsideQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Telestrations: Upside Drawn challenges drawers to do what?",
    "choices": [
      "Draw upside down",
      "Draw with eyes closed",
      "Draw in 5 seconds",
      "Skip drawing"
    ],
    "correct": 0
  },
  {
    "question": "The 'Upside Drawn' set is which kind of expansion?",
    "choices": [
      "Bonus cards",
      "Standalone box",
      "Mini app",
      "Costume kit"
    ],
    "correct": 1
  },
  {
    "question": "Drawing upside down adds which gameplay element?",
    "choices": [
      "Slower pace",
      "More chaos and laughs",
      "Penalty rules",
      "Auction"
    ],
    "correct": 1
  },
  {
    "question": "Upside Drawn keeps which Telestrations core mechanic?",
    "choices": [
      "Sketch then guess passing",
      "Auction",
      "Trick taking",
      "Bidding"
    ],
    "correct": 0
  },
  {
    "question": "Upside Drawn recommended players?",
    "choices": [
      "1",
      "Solo only",
      "4-8",
      "20+"
    ],
    "correct": 2
  },
  {
    "question": "Upside Drawn was released by which studio?",
    "choices": [
      "The Op (USAopoly)",
      "FFG",
      "Days of Wonder",
      "Z-Man"
    ],
    "correct": 0
  },
  {
    "question": "Upside Drawn's name plays on what?",
    "choices": [
      "Underwater",
      "Inverted books/sketches",
      "Magic tricks",
      "Calligraphy"
    ],
    "correct": 1
  },
  {
    "question": "Upside Drawn is ideal for which group?",
    "choices": [
      "Kids only",
      "Family/party",
      "Solo",
      "Pros only"
    ],
    "correct": 1
  },
  {
    "question": "Sketch passing leads to results that are typically?",
    "choices": [
      "Boring",
      "Hilariously off",
      "Mathematically precise",
      "Identical"
    ],
    "correct": 1
  },
  {
    "question": "In any Telestrations game, you score points by?",
    "choices": [
      "Guessing right and being guessed right",
      "Drawing best art",
      "Voting funny",
      "Solving puzzles"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TelestrationsUpsideQuizSettings): TelestrationsUpsideQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TelestrationsUpsideQuizState, action: TelestrationsUpsideQuizAction): TelestrationsUpsideQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TelestrationsUpsideQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
