import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KoreanWarQuizSettings { questions: "10" | "20" | "30"; }
export interface KoreanWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KoreanWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Korean War began in?",
    "choices": [
      "1948",
      "1950",
      "1952",
      "1954"
    ],
    "correct": 1
  },
  {
    "question": "Which UN commander led forces?",
    "choices": [
      "Eisenhower",
      "MacArthur",
      "Patton",
      "Bradley"
    ],
    "correct": 1
  },
  {
    "question": "Inchon Landing year?",
    "choices": [
      "1950",
      "1951",
      "1952",
      "1953"
    ],
    "correct": 0
  },
  {
    "question": "Korean War armistice signed in?",
    "choices": [
      "1951",
      "1952",
      "1953",
      "1954"
    ],
    "correct": 2
  },
  {
    "question": "North Korea was supported by?",
    "choices": [
      "USA",
      "UK",
      "China",
      "France"
    ],
    "correct": 2
  },
  {
    "question": "Pusan Perimeter was a defensive?",
    "choices": [
      "Naval line",
      "Pocket",
      "Air corridor",
      "Treaty zone"
    ],
    "correct": 1
  },
  {
    "question": "38th parallel divides?",
    "choices": [
      "China and Korea",
      "North and South Korea",
      "Russia and China",
      "Korea and Japan"
    ],
    "correct": 1
  },
  {
    "question": "Who was North Korea's leader?",
    "choices": [
      "Kim Il-sung",
      "Kim Jong-il",
      "Kim Jong-un",
      "Park Chung-hee"
    ],
    "correct": 0
  },
  {
    "question": "South Korea's first president was?",
    "choices": [
      "Syngman Rhee",
      "Park Chung-hee",
      "Chun Doo-hwan",
      "Kim Dae-jung"
    ],
    "correct": 0
  },
  {
    "question": "Chosin Reservoir battle was in winter of?",
    "choices": [
      "1950",
      "1951",
      "1952",
      "1953"
    ],
    "correct": 0
  },
  {
    "question": "Truman fired which general?",
    "choices": [
      "Bradley",
      "Ridgway",
      "MacArthur",
      "Eisenhower"
    ],
    "correct": 2
  },
  {
    "question": "Korean War is sometimes called?",
    "choices": [
      "Cold conflict",
      "Forgotten War",
      "Last hot war",
      "Police action"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KoreanWarQuizSettings): KoreanWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KoreanWarQuizState, action: KoreanWarQuizAction): KoreanWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KoreanWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
