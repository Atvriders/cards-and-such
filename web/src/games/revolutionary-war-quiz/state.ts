import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RevolutionaryWarQuizSettings { questions: "10" | "20" | "30"; }
export interface RevolutionaryWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RevolutionaryWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Declaration of Independence was adopted in?",
    "choices": [
      "1774",
      "1775",
      "1776",
      "1777"
    ],
    "correct": 2
  },
  {
    "question": "Who commanded the Continental Army?",
    "choices": [
      "John Adams",
      "George Washington",
      "Benjamin Franklin",
      "Thomas Jefferson"
    ],
    "correct": 1
  },
  {
    "question": "The British surrender at Yorktown occurred in?",
    "choices": [
      "1779",
      "1780",
      "1781",
      "1783"
    ],
    "correct": 2
  },
  {
    "question": "Who wrote 'Common Sense'?",
    "choices": [
      "Thomas Paine",
      "Patrick Henry",
      "John Hancock",
      "Samuel Adams"
    ],
    "correct": 0
  },
  {
    "question": "Which French general aided the Americans?",
    "choices": [
      "Napoleon",
      "Lafayette",
      "Ney",
      "Soult"
    ],
    "correct": 1
  },
  {
    "question": "The first major American victory was at?",
    "choices": [
      "Lexington",
      "Saratoga",
      "Trenton",
      "Bunker Hill"
    ],
    "correct": 1
  },
  {
    "question": "Treaty of Paris (1783) was signed with?",
    "choices": [
      "France",
      "Spain",
      "Britain",
      "Netherlands"
    ],
    "correct": 2
  },
  {
    "question": "Paul Revere is famous for his?",
    "choices": [
      "Speech",
      "Midnight ride",
      "Naval victory",
      "Cannon fire"
    ],
    "correct": 1
  },
  {
    "question": "Battle of Bunker Hill actually fought on?",
    "choices": [
      "Bunker Hill",
      "Breed's Hill",
      "Long Island",
      "Dorchester Heights"
    ],
    "correct": 1
  },
  {
    "question": "Which war preceded the Revolution?",
    "choices": [
      "War of 1812",
      "French and Indian War",
      "Spanish-American War",
      "Civil War"
    ],
    "correct": 1
  },
  {
    "question": "Hessian troops fought for?",
    "choices": [
      "Patriots",
      "Loyalists/British",
      "France",
      "Spain"
    ],
    "correct": 1
  },
  {
    "question": "Benedict Arnold is famous for?",
    "choices": [
      "Heroism",
      "Treason",
      "Diplomacy",
      "Authorship"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RevolutionaryWarQuizSettings): RevolutionaryWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RevolutionaryWarQuizState, action: RevolutionaryWarQuizAction): RevolutionaryWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RevolutionaryWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
