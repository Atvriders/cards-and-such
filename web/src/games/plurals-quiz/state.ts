import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PluralsQuizSettings { questions: "8" | "10" | "12"; }
export interface PluralsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PluralsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Plural of 'cactus'?",
    "choices": [
      "cactuses",
      "cacti",
      "cactus",
      "cactusi"
    ],
    "correct": 1
  },
  {
    "question": "Plural of 'ox'?",
    "choices": [
      "oxes",
      "ox",
      "oxen",
      "oxi"
    ],
    "correct": 2
  },
  {
    "question": "Plural of 'fungus'?",
    "choices": [
      "funguses",
      "fungi",
      "fungus",
      "fungis"
    ],
    "correct": 1
  },
  {
    "question": "Plural of 'datum'?",
    "choices": [
      "datums",
      "data",
      "datas",
      "dati"
    ],
    "correct": 1
  },
  {
    "question": "Plural of 'crisis'?",
    "choices": [
      "crises",
      "crisises",
      "crisis",
      "crisisi"
    ],
    "correct": 0
  },
  {
    "question": "Plural of 'analysis'?",
    "choices": [
      "analysises",
      "analyses",
      "analysis",
      "analyse"
    ],
    "correct": 1
  },
  {
    "question": "Plural of 'phenomenon'?",
    "choices": [
      "phenomena",
      "phenomenons",
      "phenomenon",
      "phenomenis"
    ],
    "correct": 0
  },
  {
    "question": "Plural of 'criterion'?",
    "choices": [
      "criterias",
      "criteria",
      "criterions",
      "criterion"
    ],
    "correct": 1
  },
  {
    "question": "Plural of 'index'?",
    "choices": [
      "indexes or indices",
      "indexs",
      "index",
      "indici"
    ],
    "correct": 0
  },
  {
    "question": "Plural of 'medium' (as in art)?",
    "choices": [
      "mediums",
      "media",
      "medium",
      "medias"
    ],
    "correct": 1
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PluralsQuizSettings): PluralsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PluralsQuizState, action: PluralsQuizAction): PluralsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PluralsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
