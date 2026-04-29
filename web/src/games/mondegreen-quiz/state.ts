import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MondegreenQuizSettings { questions: "8" | "10" | "12"; }
export interface MondegreenQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MondegreenQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "'Hold me closer, Tony Danza' is from?",
    "choices": [
      "Tiny Dancer",
      "Tony Manor",
      "Donny Tony",
      "Holding Tony"
    ],
    "correct": 0
  },
  {
    "question": "'There's a bathroom on the right' is from?",
    "choices": [
      "Bad Moon Rising",
      "Hotel California",
      "Country Roads",
      "Free Bird"
    ],
    "correct": 0
  },
  {
    "question": "'Excuse me while I kiss this guy' is from?",
    "choices": [
      "Purple Haze",
      "Kiss My Sky",
      "Excuse Me",
      "Blue Sky"
    ],
    "correct": 0
  },
  {
    "question": "'Sweet dreams are made of cheese' is from?",
    "choices": [
      "Sweet Dreams",
      "Cheesy Dreams",
      "Sweet Cream",
      "Made of Cheese"
    ],
    "correct": 0
  },
  {
    "question": "'I led the pigeons to the flag' is from?",
    "choices": [
      "Pledge of Allegiance",
      "The Pigeon Song",
      "Flag Day",
      "Pigeons & Flags"
    ],
    "correct": 0
  },
  {
    "question": "'The ants are my friends' is from?",
    "choices": [
      "Blowin' in the Wind",
      "Ant Friends",
      "Friends Ant",
      "The Ant Song"
    ],
    "correct": 0
  },
  {
    "question": "'The girl with kaleidoscope eyes' lyric line — actual song?",
    "choices": [
      "Lucy in the Sky with Diamonds",
      "Kaleidoscope Girl",
      "Eye of the Tiger",
      "Sky Eyes"
    ],
    "correct": 0
  },
  {
    "question": "'Olive, the other reindeer' from?",
    "choices": [
      "Rudolph the Red-Nosed Reindeer",
      "Olive the Tree",
      "Other Reindeer",
      "Tree Olive"
    ],
    "correct": 0
  },
  {
    "question": "'Round John Virgin' is from?",
    "choices": [
      "Silent Night",
      "Round Round",
      "John Virgin",
      "Holy Night"
    ],
    "correct": 0
  },
  {
    "question": "'Dancing Queen, feel the beat from the tangerine' is from?",
    "choices": [
      "Dancing Queen",
      "Tangerine Dream",
      "Queen Tangerine",
      "Beat Tangerine"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MondegreenQuizSettings): MondegreenQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MondegreenQuizState, action: MondegreenQuizAction): MondegreenQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MondegreenQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
