import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen60sQuizSettings { questions: "10" | "15"; }
export interface Nineteen60sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen60sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who was U.S. President when assassinated in 1963?",
    "choices": [
      "Eisenhower",
      "JFK",
      "LBJ",
      "Nixon"
    ],
    "correct": 1
  },
  {
    "question": "The first man on the moon, in 1969, was?",
    "choices": [
      "Buzz Aldrin",
      "Neil Armstrong",
      "John Glenn",
      "Yuri Gagarin"
    ],
    "correct": 1
  },
  {
    "question": "Which British band released 'Sgt. Pepper's Lonely Hearts Club Band'?",
    "choices": [
      "The Rolling Stones",
      "The Beatles",
      "The Who",
      "The Kinks"
    ],
    "correct": 1
  },
  {
    "question": "The Cuban Missile Crisis occurred in?",
    "choices": [
      "1960",
      "1961",
      "1962",
      "1963"
    ],
    "correct": 2
  },
  {
    "question": "MLK's 'I Have a Dream' speech was given in?",
    "choices": [
      "1961",
      "1963",
      "1965",
      "1967"
    ],
    "correct": 1
  },
  {
    "question": "Woodstock music festival took place in?",
    "choices": [
      "1967",
      "1969",
      "1971",
      "1973"
    ],
    "correct": 1
  },
  {
    "question": "Which 1960s movement championed peace and free love?",
    "choices": [
      "Beatniks",
      "Hippies",
      "Mods",
      "Greasers"
    ],
    "correct": 1
  },
  {
    "question": "The Vietnam War escalation under which U.S. President?",
    "choices": [
      "JFK",
      "LBJ",
      "Nixon",
      "Eisenhower"
    ],
    "correct": 1
  },
  {
    "question": "Bob Dylan's 1965 album was?",
    "choices": [
      "Blonde on Blonde",
      "Highway 61 Revisited",
      "Bringing It All Back Home",
      "All of these"
    ],
    "correct": 3
  },
  {
    "question": "Star Trek (original series) premiered on TV in?",
    "choices": [
      "1964",
      "1966",
      "1968",
      "1970"
    ],
    "correct": 1
  },
  {
    "question": "Yuri Gagarin was the first man in space, in?",
    "choices": [
      "1959",
      "1961",
      "1963",
      "1965"
    ],
    "correct": 1
  },
  {
    "question": "The Civil Rights Act was signed in?",
    "choices": [
      "1962",
      "1964",
      "1966",
      "1968"
    ],
    "correct": 1
  },
  {
    "question": "Robert Kennedy was assassinated in?",
    "choices": [
      "1965",
      "1967",
      "1968",
      "1970"
    ],
    "correct": 2
  },
  {
    "question": "Which fashion model symbolized 1960s London?",
    "choices": [
      "Twiggy",
      "Jean Shrimpton",
      "Veruschka",
      "Pattie Boyd"
    ],
    "correct": 0
  },
  {
    "question": "The 1969 film 'Easy Rider' starred Peter Fonda and?",
    "choices": [
      "Jack Nicholson",
      "Dennis Hopper",
      "Robert Redford",
      "Warren Beatty"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen60sQuizSettings): Nineteen60sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen60sQuizState, action: Nineteen60sQuizAction): Nineteen60sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen60sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
