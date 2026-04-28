import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GrungeEraQuizSettings { questions: "10" | "20" | "30"; }
export interface GrungeEraQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GrungeEraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Nirvana's 'Nevermind' came out in?",
    "choices": [
      "1989",
      "1991",
      "1993",
      "1995"
    ],
    "correct": 1
  },
  {
    "question": "Kurt Cobain's band was?",
    "choices": [
      "Pearl Jam",
      "Soundgarden",
      "Nirvana",
      "Alice in Chains"
    ],
    "correct": 2
  },
  {
    "question": "Grunge originated in?",
    "choices": [
      "Portland",
      "Seattle",
      "San Francisco",
      "Vancouver"
    ],
    "correct": 1
  },
  {
    "question": "Pearl Jam frontman?",
    "choices": [
      "Kurt Cobain",
      "Eddie Vedder",
      "Chris Cornell",
      "Layne Staley"
    ],
    "correct": 1
  },
  {
    "question": "Soundgarden frontman?",
    "choices": [
      "Layne Staley",
      "Eddie Vedder",
      "Chris Cornell",
      "Scott Weiland"
    ],
    "correct": 2
  },
  {
    "question": "Alice in Chains frontman?",
    "choices": [
      "Layne Staley",
      "Chris Cornell",
      "Eddie Vedder",
      "Mark Lanegan"
    ],
    "correct": 0
  },
  {
    "question": "Iconic grunge fabric?",
    "choices": [
      "Velvet",
      "Flannel",
      "Denim",
      "Leather"
    ],
    "correct": 1
  },
  {
    "question": "'Smells Like Teen Spirit' is from?",
    "choices": [
      "In Utero",
      "Bleach",
      "Nevermind",
      "Incesticide"
    ],
    "correct": 2
  },
  {
    "question": "Stone Temple Pilots frontman?",
    "choices": [
      "Eddie Vedder",
      "Scott Weiland",
      "Layne Staley",
      "Kurt Cobain"
    ],
    "correct": 1
  },
  {
    "question": "Kurt Cobain died in?",
    "choices": [
      "1991",
      "1992",
      "1994",
      "1996"
    ],
    "correct": 2
  },
  {
    "question": "Pearl Jam's debut album?",
    "choices": [
      "Vs.",
      "Ten",
      "Vitalogy",
      "No Code"
    ],
    "correct": 1
  },
  {
    "question": "Sub Pop is a?",
    "choices": [
      "Soda",
      "Record label",
      "Magazine",
      "Movie"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GrungeEraQuizSettings): GrungeEraQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GrungeEraQuizState, action: GrungeEraQuizAction): GrungeEraQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GrungeEraQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
