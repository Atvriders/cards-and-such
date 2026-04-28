import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StreamingEraQuizSettings { questions: "10" | "20" | "30"; }
export interface StreamingEraQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StreamingEraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Spotify launched in?",
    "choices": [
      "2006",
      "2008",
      "2011",
      "2013"
    ],
    "correct": 1
  },
  {
    "question": "Netflix's first original?",
    "choices": [
      "Stranger Things",
      "Orange Is the New Black",
      "House of Cards",
      "Lilyhammer"
    ],
    "correct": 3
  },
  {
    "question": "'House of Cards' US debut?",
    "choices": [
      "2011",
      "2013",
      "2014",
      "2015"
    ],
    "correct": 1
  },
  {
    "question": "'Stranger Things' debuted in?",
    "choices": [
      "2014",
      "2016",
      "2018",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "Disney+ launched in?",
    "choices": [
      "2017",
      "2018",
      "2019",
      "2020"
    ],
    "correct": 2
  },
  {
    "question": "'Game of Thrones' aired on?",
    "choices": [
      "Netflix",
      "Hulu",
      "HBO",
      "Showtime"
    ],
    "correct": 2
  },
  {
    "question": "YouTube was founded in?",
    "choices": [
      "2003",
      "2005",
      "2007",
      "2009"
    ],
    "correct": 1
  },
  {
    "question": "Twitch focuses on?",
    "choices": [
      "Music",
      "Gaming",
      "News",
      "Cooking"
    ],
    "correct": 1
  },
  {
    "question": "'Tiger King' aired on?",
    "choices": [
      "Hulu",
      "Netflix",
      "Apple TV",
      "Amazon"
    ],
    "correct": 1
  },
  {
    "question": "Apple TV+ launched in?",
    "choices": [
      "2017",
      "2018",
      "2019",
      "2020"
    ],
    "correct": 2
  },
  {
    "question": "'The Mandalorian' is on?",
    "choices": [
      "Netflix",
      "Disney+",
      "HBO",
      "Apple TV+"
    ],
    "correct": 1
  },
  {
    "question": "'Squid Game' is from?",
    "choices": [
      "Japan",
      "South Korea",
      "China",
      "Thailand"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StreamingEraQuizSettings): StreamingEraQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StreamingEraQuizState, action: StreamingEraQuizAction): StreamingEraQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StreamingEraQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
