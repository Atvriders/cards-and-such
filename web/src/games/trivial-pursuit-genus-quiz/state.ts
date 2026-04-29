import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrivialPursuitGenusQuizSettings { questions: "10"; }
export interface TrivialPursuitGenusQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrivialPursuitGenusQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Trivial Pursuit was created by which two journalists?",
    "choices": [
      "Haney and Abbott",
      "Haney and Werner",
      "Allen and Werner",
      "Haney and Werner Jr"
    ],
    "correct": 1
  },
  {
    "question": "Trivial Pursuit was first marketed in what year?",
    "choices": [
      "1978",
      "1981",
      "1986",
      "1992"
    ],
    "correct": 1
  },
  {
    "question": "How many wedge categories are in Trivial Pursuit Genus?",
    "choices": [
      "Four",
      "Five",
      "Six",
      "Seven"
    ],
    "correct": 2
  },
  {
    "question": "Trivial Pursuit Genus uses pie pieces of which colors include?",
    "choices": [
      "Yellow=History",
      "Yellow=Science",
      "Yellow=Sports",
      "Yellow=Geography"
    ],
    "correct": 0
  },
  {
    "question": "In Genus, blue is which category?",
    "choices": [
      "Geography",
      "History",
      "Science",
      "Sports"
    ],
    "correct": 0
  },
  {
    "question": "In Genus, brown is which category?",
    "choices": [
      "Arts and Literature",
      "Sports",
      "Geography",
      "History"
    ],
    "correct": 0
  },
  {
    "question": "Trivial Pursuit was first published by?",
    "choices": [
      "Horn Abbott Ltd",
      "Hasbro",
      "Parker Brothers",
      "Selchow & Righter"
    ],
    "correct": 0
  },
  {
    "question": "To win Trivial Pursuit you must reach what?",
    "choices": [
      "Center hub with all wedges",
      "Corner finish",
      "100 points",
      "Full deck collected"
    ],
    "correct": 0
  },
  {
    "question": "Trivial Pursuit's nickname during peak fame was?",
    "choices": [
      "Yuppie pastime",
      "Picnic game",
      "Casino game",
      "Bingo lite"
    ],
    "correct": 0
  },
  {
    "question": "In standard Genus, sport's color is?",
    "choices": [
      "Orange",
      "Blue",
      "Yellow",
      "Green"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TrivialPursuitGenusQuizSettings): TrivialPursuitGenusQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrivialPursuitGenusQuizState, action: TrivialPursuitGenusQuizAction): TrivialPursuitGenusQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrivialPursuitGenusQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
