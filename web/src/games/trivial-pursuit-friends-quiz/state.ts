import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrivialPursuitFriendsQuizSettings { questions: "10"; }
export interface TrivialPursuitFriendsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrivialPursuitFriendsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Friends is set primarily in which city?",
    "choices": [
      "Boston",
      "Chicago",
      "New York",
      "Seattle"
    ],
    "correct": 2
  },
  {
    "question": "Friends ran for how many seasons?",
    "choices": [
      "8",
      "10",
      "12",
      "9"
    ],
    "correct": 1
  },
  {
    "question": "The coffee shop is called?",
    "choices": [
      "Java City",
      "Central Perk",
      "Cafe Nero",
      "Brew House"
    ],
    "correct": 1
  },
  {
    "question": "Ross's profession is?",
    "choices": [
      "Chef",
      "Paleontologist",
      "Actor",
      "Lawyer"
    ],
    "correct": 1
  },
  {
    "question": "Phoebe's twin sister is named?",
    "choices": [
      "Ursula",
      "Estelle",
      "Janice",
      "Jill"
    ],
    "correct": 0
  },
  {
    "question": "Joey's catchphrase is?",
    "choices": [
      "How you doin'?",
      "Could you be...?",
      "Smelly cat",
      "We were on a break"
    ],
    "correct": 0
  },
  {
    "question": "Chandler's job initially involves?",
    "choices": [
      "Statistical analysis and data reconfiguration",
      "Doctor",
      "Chef",
      "Teacher"
    ],
    "correct": 0
  },
  {
    "question": "Monica's brother is?",
    "choices": [
      "Joey",
      "Chandler",
      "Ross",
      "Phoebe"
    ],
    "correct": 2
  },
  {
    "question": "Rachel's daughter is named?",
    "choices": [
      "Emma",
      "Erica",
      "Ella",
      "Ellie"
    ],
    "correct": 0
  },
  {
    "question": "Friends ended in what year?",
    "choices": [
      "1998",
      "2002",
      "2004",
      "2006"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TrivialPursuitFriendsQuizSettings): TrivialPursuitFriendsQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrivialPursuitFriendsQuizState, action: TrivialPursuitFriendsQuizAction): TrivialPursuitFriendsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrivialPursuitFriendsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
