import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KentuckyDerbyQuizSettings { questions: "10" | "20" | "30"; }
export interface KentuckyDerbyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KentuckyDerbyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Kentucky Derby is held at?",
    "choices": [
      "Belmont",
      "Churchill Downs",
      "Pimlico",
      "Saratoga"
    ],
    "correct": 1
  },
  {
    "question": "Derby distance is?",
    "choices": [
      "1 mile",
      "1 1/4 miles",
      "1 1/2 miles",
      "2 miles"
    ],
    "correct": 1
  },
  {
    "question": "Triple Crown is Derby plus?",
    "choices": [
      "Travers, Belmont",
      "Preakness, Travers",
      "Preakness, Belmont",
      "Belmont, Breeders Cup"
    ],
    "correct": 2
  },
  {
    "question": "Secretariat won Derby in?",
    "choices": [
      "1971",
      "1973",
      "1975",
      "1977"
    ],
    "correct": 1
  },
  {
    "question": "American Pharoah won TC in?",
    "choices": [
      "2013",
      "2014",
      "2015",
      "2016"
    ],
    "correct": 2
  },
  {
    "question": "How many TC winners are there?",
    "choices": [
      "11",
      "13",
      "15",
      "17"
    ],
    "correct": 1
  },
  {
    "question": "Justify won TC in?",
    "choices": [
      "2017",
      "2018",
      "2019",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "Most Derby wins by a jockey?",
    "choices": [
      "Eddie Arcaro",
      "Bill Hartack",
      "Both A and B (5)",
      "Calvin Borel"
    ],
    "correct": 2
  },
  {
    "question": "Kentucky Derby drink?",
    "choices": [
      "Old Fashioned",
      "Mint Julep",
      "Margarita",
      "Bloody Mary"
    ],
    "correct": 1
  },
  {
    "question": "Derby first run in?",
    "choices": [
      "1875",
      "1900",
      "1920",
      "1936"
    ],
    "correct": 0
  },
  {
    "question": "Run for the ___?",
    "choices": [
      "Cash",
      "Roses",
      "Ribbons",
      "Glory"
    ],
    "correct": 1
  },
  {
    "question": "Most exciting ___ in sports?",
    "choices": [
      "Hour",
      "Hour and minutes",
      "Two minutes",
      "Half hour"
    ],
    "correct": 2
  },
  {
    "question": "Mine That Bird won Derby (50-1) in?",
    "choices": [
      "2007",
      "2009",
      "2011",
      "2013"
    ],
    "correct": 1
  },
  {
    "question": "Derby blanket is made of?",
    "choices": [
      "Lilies",
      "Roses",
      "Daisies",
      "Carnations"
    ],
    "correct": 1
  },
  {
    "question": "Derby happens first Saturday in?",
    "choices": [
      "April",
      "May",
      "June",
      "July"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KentuckyDerbyQuizSettings): KentuckyDerbyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KentuckyDerbyQuizState, action: KentuckyDerbyQuizAction): KentuckyDerbyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KentuckyDerbyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
