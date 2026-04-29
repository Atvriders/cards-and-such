import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LigrettoKidsQuizSettings { questions: "10"; }
export interface LigrettoKidsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LigrettoKidsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Ligretto is published by?",
    "choices": [
      "Schmidt Spiele",
      "Hasbro",
      "Days of Wonder",
      "Z-Man"
    ],
    "correct": 0
  },
  {
    "question": "Ligretto Kids art uses?",
    "choices": [
      "Animal pictures instead of numbers",
      "Numbers only",
      "Trump cards",
      "Solo cards"
    ],
    "correct": 0
  },
  {
    "question": "Players play simultaneously, racing to?",
    "choices": [
      "Empty their personal Ligretto pile",
      "Highest hand score",
      "Trick-take",
      "Bid"
    ],
    "correct": 0
  },
  {
    "question": "Ligretto cards are played onto?",
    "choices": [
      "Shared center piles by sequence",
      "Solo piles only",
      "Suit piles",
      "No piles"
    ],
    "correct": 0
  },
  {
    "question": "Recommended ages for Ligretto Kids?",
    "choices": [
      "About 4 and up",
      "Adults only",
      "16+",
      "Under 1"
    ],
    "correct": 0
  },
  {
    "question": "Cards can be played simultaneously which makes Ligretto?",
    "choices": [
      "A simultaneous turnless speed race",
      "Strict turn-based",
      "Auction",
      "Trick-taking"
    ],
    "correct": 0
  },
  {
    "question": "When a player empties pile they?",
    "choices": [
      "Yell 'Ligretto!' to end the round",
      "Skip turn",
      "Refill",
      "Lose"
    ],
    "correct": 0
  },
  {
    "question": "Each color/set in Ligretto base?",
    "choices": [
      "Has cards 1–10 in 4 colors",
      "Suits only",
      "Trump",
      "5 of each"
    ],
    "correct": 0
  },
  {
    "question": "Ligretto's English-language US cousin is?",
    "choices": [
      "Dutch Blitz",
      "UNO",
      "Skip-Bo",
      "Phase 10"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Frantic family fun",
      "Slow strategy",
      "Solo logic",
      "Auction"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: LigrettoKidsQuizSettings): LigrettoKidsQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LigrettoKidsQuizState, action: LigrettoKidsQuizAction): LigrettoKidsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LigrettoKidsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
