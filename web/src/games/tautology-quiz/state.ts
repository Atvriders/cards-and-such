import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TautologyQuizSettings { questions: "8" | "10" | "12"; }
export interface TautologyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TautologyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which is a tautology?",
    "choices": [
      "free gift",
      "small gift",
      "wrapped gift",
      "given gift"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "ATM machine",
      "bank machine",
      "cash machine",
      "card reader"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "PIN number",
      "PIN code",
      "secret code",
      "passcode"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "LCD display",
      "LED display",
      "OLED screen",
      "plasma display"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "HIV virus",
      "flu virus",
      "cold virus",
      "novel virus"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "added bonus",
      "yearly bonus",
      "small bonus",
      "cash bonus"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "advance planning",
      "careful planning",
      "early plan",
      "future plan"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "close proximity",
      "distant proximity",
      "near distance",
      "far range"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "end result",
      "test result",
      "final outcome",
      "score"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "unexpected surprise",
      "small surprise",
      "birthday surprise",
      "happy gift"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "past history",
      "recent history",
      "ancient history",
      "oral history"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "new innovation",
      "tech innovation",
      "small invention",
      "fresh idea"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "false pretense",
      "true pretext",
      "honest claim",
      "sincere lie"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "null and void",
      "binding contract",
      "signed deal",
      "verbal pact"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "each and every",
      "some or all",
      "few and many",
      "any or none"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "12 noon",
      "12 o'clock",
      "noon hour",
      "midday meal"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "12 midnight",
      "late night",
      "12 o'clock",
      "midnight hour"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "safe haven",
      "warm home",
      "guarded fort",
      "quiet refuge"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "frozen ice",
      "thin ice",
      "thick ice",
      "black ice"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "join together",
      "join apart",
      "split together",
      "merge apart"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "revert back",
      "go back",
      "step back",
      "look back"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "repeat again",
      "say again",
      "do over",
      "try once"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "completely finished",
      "almost done",
      "halfway through",
      "barely begun"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "totally unique",
      "rather rare",
      "fairly common",
      "quite typical"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "personal opinion",
      "shared view",
      "popular take",
      "common belief"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "true fact",
      "key fact",
      "small fact",
      "known fact"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "actual fact",
      "minor detail",
      "side note",
      "main point"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "sum total",
      "grand finale",
      "final lap",
      "last word"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "empty space",
      "open field",
      "wide road",
      "vast plain"
    ],
    "correct": 0
  },
  {
    "question": "Which is a tautology?",
    "choices": [
      "future plans",
      "past plans",
      "current plan",
      "draft plan"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TautologyQuizSettings): TautologyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TautologyQuizState, action: TautologyQuizAction): TautologyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TautologyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
