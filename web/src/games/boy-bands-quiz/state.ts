import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BoyBandsQuizSettings { questions: "10" | "20" | "30"; }
export interface BoyBandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BoyBandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Backstreet Boys formed in?",
    "choices": [
      "1990",
      "1993",
      "1996",
      "1998"
    ],
    "correct": 1
  },
  {
    "question": "NSYNC's lead singer became?",
    "choices": [
      "Justin Bieber",
      "Justin Timberlake",
      "Nick Lachey",
      "Joey Fatone"
    ],
    "correct": 1
  },
  {
    "question": "'I Want It That Way' is by?",
    "choices": [
      "NSYNC",
      "98 Degrees",
      "Backstreet Boys",
      "Boyz II Men"
    ],
    "correct": 2
  },
  {
    "question": "New Kids on the Block hit big in?",
    "choices": [
      "1985",
      "1989",
      "1993",
      "1996"
    ],
    "correct": 1
  },
  {
    "question": "BTS originates from?",
    "choices": [
      "Japan",
      "South Korea",
      "China",
      "Vietnam"
    ],
    "correct": 1
  },
  {
    "question": "Boyz II Men formed in?",
    "choices": [
      "LA",
      "Philly",
      "NYC",
      "Atlanta"
    ],
    "correct": 1
  },
  {
    "question": "One Direction formed on?",
    "choices": [
      "American Idol",
      "X Factor UK",
      "The Voice",
      "Britain's Got Talent"
    ],
    "correct": 1
  },
  {
    "question": "Take That hails from?",
    "choices": [
      "UK",
      "Ireland",
      "USA",
      "Canada"
    ],
    "correct": 0
  },
  {
    "question": "Jonas Brothers' youngest is?",
    "choices": [
      "Joe",
      "Kevin",
      "Nick",
      "Frankie"
    ],
    "correct": 2
  },
  {
    "question": "New Edition spawned which solo star?",
    "choices": [
      "Bobby Brown",
      "Usher",
      "Ne-Yo",
      "R. Kelly"
    ],
    "correct": 0
  },
  {
    "question": "BTS member RM stands for?",
    "choices": [
      "Rap Monster",
      "Royal Master",
      "Real Mood",
      "Run Man"
    ],
    "correct": 0
  },
  {
    "question": "98 Degrees frontman?",
    "choices": [
      "Justin Jeffre",
      "Drew Lachey",
      "Nick Lachey",
      "Jeff Timmons"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BoyBandsQuizSettings): BoyBandsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BoyBandsQuizState, action: BoyBandsQuizAction): BoyBandsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BoyBandsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
