import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SilentLetterQuizSettings { questions: "8" | "10" | "12"; }
export interface SilentLetterQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SilentLetterQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
{
  "question": "Which letter is silent in 'knife'?",
  "choices": [
    "k",
    "n",
    "i",
    "f"
  ],
  "correct": 0
},
{
  "question": "Which letter is silent in 'lamb'?",
  "choices": [
    "l",
    "a",
    "m",
    "b"
  ],
  "correct": 3
},
{
  "question": "Which letter is silent in 'wrist'?",
  "choices": [
    "w",
    "r",
    "i",
    "s"
  ],
  "correct": 0
},
{
  "question": "Which letter is silent in 'gnome'?",
  "choices": [
    "g",
    "n",
    "o",
    "e"
  ],
  "correct": 0
},
{
  "question": "Which letter is silent in 'thumb'?",
  "choices": [
    "t",
    "h",
    "u",
    "b"
  ],
  "correct": 3
},
{
  "question": "Which letter is silent in 'island'?",
  "choices": [
    "i",
    "s",
    "l",
    "d"
  ],
  "correct": 1
},
{
  "question": "Which letter is silent in 'honest'?",
  "choices": [
    "h",
    "o",
    "n",
    "t"
  ],
  "correct": 0
},
{
  "question": "Which letter is silent in 'know'?",
  "choices": [
    "k",
    "n",
    "o",
    "w"
  ],
  "correct": 0
},
{
  "question": "Which letter is silent in 'wrong'?",
  "choices": [
    "w",
    "r",
    "n",
    "g"
  ],
  "correct": 0
},
{
  "question": "Which letter is silent in 'climb'?",
  "choices": [
    "c",
    "l",
    "m",
    "b"
  ],
  "correct": 3
},
{
  "question": "Which letter is silent in 'doubt'?",
  "choices": [
    "d",
    "o",
    "b",
    "t"
  ],
  "correct": 2
},
{
  "question": "Which letter is silent in 'comb'?",
  "choices": [
    "c",
    "o",
    "m",
    "b"
  ],
  "correct": 3
},
{
  "question": "Which letter is silent in 'castle'?",
  "choices": [
    "c",
    "s",
    "t",
    "l"
  ],
  "correct": 2
},
{
  "question": "Which letter is silent in 'listen'?",
  "choices": [
    "l",
    "s",
    "t",
    "n"
  ],
  "correct": 2
},
{
  "question": "Which letter is silent in 'whistle'?",
  "choices": [
    "w",
    "h",
    "t",
    "l"
  ],
  "correct": 2
},
{
  "question": "Which letter is silent in 'sword'?",
  "choices": [
    "s",
    "w",
    "o",
    "d"
  ],
  "correct": 1
},
{
  "question": "Which letter is silent in 'pneumonia'?",
  "choices": [
    "p",
    "n",
    "u",
    "m"
  ],
  "correct": 0
},
{
  "question": "Which letter is silent in 'psychology'?",
  "choices": [
    "p",
    "s",
    "y",
    "c"
  ],
  "correct": 0
},
{
  "question": "Which letter is silent in 'autumn'?",
  "choices": [
    "a",
    "t",
    "m",
    "n"
  ],
  "correct": 3
},
{
  "question": "Which letter is silent in 'hour'?",
  "choices": [
    "h",
    "o",
    "u",
    "r"
  ],
  "correct": 0
},
{
  "question": "Which letter is silent in 'rhyme'?",
  "choices": [
    "r",
    "h",
    "y",
    "m"
  ],
  "correct": 1
},
{
  "question": "Which letter is silent in 'ghost'?",
  "choices": [
    "g",
    "h",
    "o",
    "t"
  ],
  "correct": 1
},
{
  "question": "Which letter is silent in 'wreck'?",
  "choices": [
    "w",
    "r",
    "e",
    "k"
  ],
  "correct": 0
},
{
  "question": "Which letter is silent in 'numb'?",
  "choices": [
    "n",
    "u",
    "m",
    "b"
  ],
  "correct": 3
},
{
  "question": "Which letter is silent in 'sign'?",
  "choices": [
    "s",
    "i",
    "g",
    "n"
  ],
  "correct": 2
},
{
  "question": "Which letter is silent in 'design'?",
  "choices": [
    "d",
    "s",
    "g",
    "n"
  ],
  "correct": 2
},
{
  "question": "Which letter is silent in 'often' (commonly)?",
  "choices": [
    "o",
    "f",
    "t",
    "n"
  ],
  "correct": 2
},
{
  "question": "Which letter is silent in 'salmon'?",
  "choices": [
    "s",
    "a",
    "l",
    "m"
  ],
  "correct": 2
},
{
  "question": "Which letter is silent in 'aisle'?",
  "choices": [
    "a",
    "i",
    "s",
    "l"
  ],
  "correct": 2
},
{
  "question": "Which letter is silent in 'kneel'?",
  "choices": [
    "k",
    "n",
    "e",
    "l"
  ],
  "correct": 0
}
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SilentLetterQuizSettings): SilentLetterQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SilentLetterQuizState, action: SilentLetterQuizAction): SilentLetterQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SilentLetterQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
