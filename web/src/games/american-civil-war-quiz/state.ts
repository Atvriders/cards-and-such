import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AmericanCivilWarQuizSettings { questions: "10" | "20" | "30"; }
export interface AmericanCivilWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AmericanCivilWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "In what year did the American Civil War begin?",
    "choices": [
      "1859",
      "1861",
      "1863",
      "1865"
    ],
    "correct": 1
  },
  {
    "question": "Who commanded the Confederate Army of Northern Virginia?",
    "choices": [
      "Stonewall Jackson",
      "P.G.T. Beauregard",
      "Robert E. Lee",
      "Jefferson Davis"
    ],
    "correct": 2
  },
  {
    "question": "The Battle of Gettysburg occurred in what month and year?",
    "choices": [
      "June 1862",
      "July 1863",
      "August 1864",
      "April 1865"
    ],
    "correct": 1
  },
  {
    "question": "Which document freed slaves in Confederate states?",
    "choices": [
      "Bill of Rights",
      "Emancipation Proclamation",
      "13th Amendment",
      "Missouri Compromise"
    ],
    "correct": 1
  },
  {
    "question": "Who was Union General-in-Chief at war's end?",
    "choices": [
      "George McClellan",
      "William Sherman",
      "Ulysses S. Grant",
      "George Meade"
    ],
    "correct": 2
  },
  {
    "question": "Where did Lee surrender to Grant?",
    "choices": [
      "Antietam",
      "Vicksburg",
      "Appomattox Court House",
      "Fort Sumter"
    ],
    "correct": 2
  },
  {
    "question": "Which battle was the Civil War's bloodiest single day?",
    "choices": [
      "Antietam",
      "Shiloh",
      "Bull Run",
      "Chancellorsville"
    ],
    "correct": 0
  },
  {
    "question": "Lincoln's famous address occurred at?",
    "choices": [
      "Antietam",
      "Vicksburg",
      "Gettysburg",
      "Atlanta"
    ],
    "correct": 2
  },
  {
    "question": "What state seceded first in 1860?",
    "choices": [
      "Virginia",
      "Georgia",
      "South Carolina",
      "Mississippi"
    ],
    "correct": 2
  },
  {
    "question": "Who was Confederate President?",
    "choices": [
      "Robert E. Lee",
      "Jefferson Davis",
      "Stonewall Jackson",
      "Alexander Stephens"
    ],
    "correct": 1
  },
  {
    "question": "Sherman's March to the Sea ended in?",
    "choices": [
      "Atlanta",
      "Charleston",
      "Savannah",
      "Richmond"
    ],
    "correct": 2
  },
  {
    "question": "The CSS Virginia (Merrimack) fought the?",
    "choices": [
      "USS Cairo",
      "USS Monitor",
      "USS Hartford",
      "USS Constitution"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AmericanCivilWarQuizSettings): AmericanCivilWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AmericanCivilWarQuizState, action: AmericanCivilWarQuizAction): AmericanCivilWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AmericanCivilWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
