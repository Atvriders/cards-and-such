import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GirlGroupsQuizSettings { questions: "10" | "20" | "30"; }
export interface GirlGroupsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GirlGroupsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Spice Girls formed in?",
    "choices": [
      "1991",
      "1994",
      "1996",
      "1998"
    ],
    "correct": 1
  },
  {
    "question": "'Wannabe' is by?",
    "choices": [
      "Spice Girls",
      "TLC",
      "Destiny's Child",
      "All Saints"
    ],
    "correct": 0
  },
  {
    "question": "Destiny's Child lead singer?",
    "choices": [
      "Beyonce",
      "Kelly",
      "Michelle",
      "Letoya"
    ],
    "correct": 0
  },
  {
    "question": "TLC stands for?",
    "choices": [
      "Tionne Lisa Crystal",
      "T-Boz Left Eye Chilli",
      "Three Loud Cats",
      "T Lopes Crew"
    ],
    "correct": 1
  },
  {
    "question": "Supremes lead singer?",
    "choices": [
      "Aretha Franklin",
      "Diana Ross",
      "Florence Ballard",
      "Mary Wilson"
    ],
    "correct": 1
  },
  {
    "question": "Sugababes are from?",
    "choices": [
      "UK",
      "USA",
      "Australia",
      "Canada"
    ],
    "correct": 0
  },
  {
    "question": "BLACKPINK is from?",
    "choices": [
      "Japan",
      "South Korea",
      "Thailand",
      "China"
    ],
    "correct": 1
  },
  {
    "question": "Pussycat Dolls' lead?",
    "choices": [
      "Ashley",
      "Nicole",
      "Jessica",
      "Kimberly"
    ],
    "correct": 1
  },
  {
    "question": "Bananarama's heyday was?",
    "choices": [
      "1970s",
      "1980s",
      "1990s",
      "2000s"
    ],
    "correct": 1
  },
  {
    "question": "'No Scrubs' is by?",
    "choices": [
      "Destiny's Child",
      "TLC",
      "En Vogue",
      "Salt-N-Pepa"
    ],
    "correct": 1
  },
  {
    "question": "Salt-N-Pepa is from?",
    "choices": [
      "LA",
      "NYC",
      "Chicago",
      "Detroit"
    ],
    "correct": 1
  },
  {
    "question": "Little Mix won?",
    "choices": [
      "X Factor UK",
      "American Idol",
      "The Voice",
      "BGT"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GirlGroupsQuizSettings): GirlGroupsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GirlGroupsQuizState, action: GirlGroupsQuizAction): GirlGroupsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GirlGroupsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
