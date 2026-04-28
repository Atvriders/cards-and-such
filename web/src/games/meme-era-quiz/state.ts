import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MemeEraQuizSettings { questions: "10" | "20" | "30"; }
export interface MemeEraQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MemeEraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "'All your base are belong to us' came from?",
    "choices": [
      "Movie",
      "Video game",
      "Show",
      "Comic"
    ],
    "correct": 1
  },
  {
    "question": "Doge meme features which dog breed?",
    "choices": [
      "Husky",
      "Shiba Inu",
      "Akita",
      "Corgi"
    ],
    "correct": 1
  },
  {
    "question": "'Rickrolling' uses song?",
    "choices": [
      "Take On Me",
      "Never Gonna Give You Up",
      "Sweet Caroline",
      "Hey Jude"
    ],
    "correct": 1
  },
  {
    "question": "Grumpy Cat's real name was?",
    "choices": [
      "Tarzan",
      "Tardar Sauce",
      "Garfield",
      "Felix"
    ],
    "correct": 1
  },
  {
    "question": "Reddit was founded in?",
    "choices": [
      "2003",
      "2005",
      "2007",
      "2009"
    ],
    "correct": 1
  },
  {
    "question": "Pepe the Frog originated as?",
    "choices": [
      "Cartoon",
      "Comic",
      "Stamp",
      "Photo"
    ],
    "correct": 1
  },
  {
    "question": "Distracted Boyfriend is a?",
    "choices": [
      "Painting",
      "Stock photo",
      "Movie clip",
      "TV scene"
    ],
    "correct": 1
  },
  {
    "question": "Chuck Norris jokes peaked in?",
    "choices": [
      "2004",
      "2007",
      "2010",
      "2014"
    ],
    "correct": 1
  },
  {
    "question": "'Loss' originated as a?",
    "choices": [
      "Webcomic",
      "Movie",
      "Song",
      "Meme"
    ],
    "correct": 0
  },
  {
    "question": "Numa Numa song was by?",
    "choices": [
      "O-Zone",
      "ABBA",
      "Aqua",
      "Eiffel 65"
    ],
    "correct": 0
  },
  {
    "question": "'Friday' was by?",
    "choices": [
      "Justin Bieber",
      "Rebecca Black",
      "Soulja Boy",
      "Will Smith"
    ],
    "correct": 1
  },
  {
    "question": "Kony 2012 was?",
    "choices": [
      "Game",
      "Movie",
      "Viral video",
      "Meme"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MemeEraQuizSettings): MemeEraQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MemeEraQuizState, action: MemeEraQuizAction): MemeEraQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MemeEraQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
