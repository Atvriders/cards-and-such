import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ManBookerQuizSettings { questions: "10" | "20"; }
export interface ManBookerQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ManBookerQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Booker Prize launched in?",
    "choices": [
      "1959",
      "1969",
      "1979",
      "1989"
    ],
    "correct": 1
  },
  {
    "question": "Country of origin?",
    "choices": [
      "UK",
      "Ireland",
      "Both UK & Ireland (eligibility)",
      "Australia"
    ],
    "correct": 0
  },
  {
    "question": "Salman Rushdie's Booker novel?",
    "choices": [
      "Midnight's Children",
      "Shame",
      "The Satanic Verses",
      "Fury"
    ],
    "correct": 0
  },
  {
    "question": "Author of 'Wolf Hall'?",
    "choices": [
      "Hilary Mantel",
      "Margaret Atwood",
      "Pat Barker",
      "A.S. Byatt"
    ],
    "correct": 0
  },
  {
    "question": "Hilary Mantel's two Booker wins were for?",
    "choices": [
      "Wolf Hall + Bring Up the Bodies",
      "Wolf Hall + The Mirror & the Light",
      "Bring Up the Bodies + Mirror",
      "Beyond Black + Wolf Hall"
    ],
    "correct": 0
  },
  {
    "question": "Bernardine Evaristo's joint-2019 Booker novel?",
    "choices": [
      "Girl, Woman, Other",
      "Mr Loverman",
      "Lara",
      "Hello Mum"
    ],
    "correct": 0
  },
  {
    "question": "Year Atwood/Evaristo shared Booker?",
    "choices": [
      "2018",
      "2019",
      "2020",
      "2021"
    ],
    "correct": 1
  },
  {
    "question": "Atwood's joint-2019 winning book?",
    "choices": [
      "The Testaments",
      "Hag-Seed",
      "Alias Grace",
      "Cat's Eye"
    ],
    "correct": 0
  },
  {
    "question": "International Booker is for?",
    "choices": [
      "Translated fiction",
      "Children's books",
      "Nonfiction",
      "Drama"
    ],
    "correct": 0
  },
  {
    "question": "First non-Commonwealth winners eligible from?",
    "choices": [
      "2000",
      "2014",
      "2018",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "Ian McEwan's Booker novel?",
    "choices": [
      "Atonement",
      "Amsterdam",
      "Saturday",
      "On Chesil Beach"
    ],
    "correct": 1
  },
  {
    "question": "Penelope Lively's Booker novel?",
    "choices": [
      "Moon Tiger",
      "City of the Mind",
      "Heat Wave",
      "Family Album"
    ],
    "correct": 0
  },
  {
    "question": "J.M. Coetzee's Booker double came with?",
    "choices": [
      "Disgrace + The Master of Petersburg",
      "Disgrace + Life & Times of Michael K",
      "Foe + Disgrace",
      "Slow Man + Disgrace"
    ],
    "correct": 1
  },
  {
    "question": "Booker prize money (current)?",
    "choices": [
      "£10k",
      "£25k",
      "£50k",
      "£100k"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ManBookerQuizSettings): ManBookerQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ManBookerQuizState, action: ManBookerQuizAction): ManBookerQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ManBookerQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
