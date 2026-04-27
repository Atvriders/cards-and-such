import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen30sQuizSettings { questions: "10" | "15"; }
export interface Nineteen30sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen30sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who was elected U.S. President in 1932?",
    "choices": [
      "Hoover",
      "Coolidge",
      "Franklin D. Roosevelt",
      "Truman"
    ],
    "correct": 2
  },
  {
    "question": "What was FDR's economic recovery program called?",
    "choices": [
      "The Big Push",
      "Fair Deal",
      "New Deal",
      "Square Deal"
    ],
    "correct": 2
  },
  {
    "question": "The Dust Bowl mainly hit which U.S. region?",
    "choices": [
      "New England",
      "Pacific Northwest",
      "Great Plains",
      "Florida"
    ],
    "correct": 2
  },
  {
    "question": "Who became Chancellor of Germany in 1933?",
    "choices": [
      "Stalin",
      "Mussolini",
      "Hitler",
      "Franco"
    ],
    "correct": 2
  },
  {
    "question": "Amelia Earhart disappeared in what year?",
    "choices": [
      "1932",
      "1935",
      "1937",
      "1939"
    ],
    "correct": 2
  },
  {
    "question": "What 1930 sci-fi-epic novel by Aldous Huxley imagined a dystopia? (Hint: published 1932)",
    "choices": [
      "1984",
      "Brave New World",
      "We",
      "Animal Farm"
    ],
    "correct": 1
  },
  {
    "question": "The Empire State Building opened in what year?",
    "choices": [
      "1929",
      "1931",
      "1934",
      "1937"
    ],
    "correct": 1
  },
  {
    "question": "Which Steinbeck novel followed Okies fleeing the Dust Bowl?",
    "choices": [
      "East of Eden",
      "Of Mice and Men",
      "The Grapes of Wrath",
      "Cannery Row"
    ],
    "correct": 2
  },
  {
    "question": "What 1933 movie featured a giant ape on the Empire State Building?",
    "choices": [
      "Mighty Joe Young",
      "Son of Kong",
      "King Kong",
      "Tarzan"
    ],
    "correct": 2
  },
  {
    "question": "Which 1939 film premiered with a famous line: 'Frankly, my dear...'?",
    "choices": [
      "Wizard of Oz",
      "Gone with the Wind",
      "Stagecoach",
      "Wuthering Heights"
    ],
    "correct": 1
  },
  {
    "question": "Joe Louis was famous in what sport in the 1930s?",
    "choices": [
      "Baseball",
      "Football",
      "Boxing",
      "Tennis"
    ],
    "correct": 2
  },
  {
    "question": "The Hindenburg disaster occurred in what year?",
    "choices": [
      "1933",
      "1935",
      "1937",
      "1939"
    ],
    "correct": 2
  },
  {
    "question": "Which dance was popular along with swing music in the late 1930s?",
    "choices": [
      "Charleston",
      "Lindy Hop",
      "Twist",
      "Polka"
    ],
    "correct": 1
  },
  {
    "question": "Prohibition was repealed by which amendment in 1933?",
    "choices": [
      "20th",
      "21st",
      "22nd",
      "23rd"
    ],
    "correct": 1
  },
  {
    "question": "Shirley Temple was a famous 1930s star at what age range?",
    "choices": [
      "Adult",
      "Teenager",
      "Child",
      "Senior"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen30sQuizSettings): Nineteen30sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen30sQuizState, action: Nineteen30sQuizAction): Nineteen30sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen30sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
