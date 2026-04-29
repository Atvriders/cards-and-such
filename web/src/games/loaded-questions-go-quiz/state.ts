import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LoadedQuestionsGoQuizSettings { questions: "10"; }
export interface LoadedQuestionsGoQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LoadedQuestionsGoQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Loaded Questions On The Go's main format is?",
    "choices": [
      "A compact card-only travel deck",
      "Big board only",
      "App-based only",
      "Booklet"
    ],
    "correct": 0
  },
  {
    "question": "Players answer a question and then?",
    "choices": [
      "The asker matches answers to authors",
      "Score by points only",
      "Roll a die",
      "Race"
    ],
    "correct": 0
  },
  {
    "question": "The original Loaded Questions used a?",
    "choices": [
      "Track-style board to score",
      "Standard 52 deck",
      "Tiles",
      "No track"
    ],
    "correct": 0
  },
  {
    "question": "Loaded Questions is published by?",
    "choices": [
      "All Things Equal (Spin Master later)",
      "Hasbro",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "Recommended players for travel edition?",
    "choices": [
      "About 3 to 6",
      "Solo only",
      "Exactly 2",
      "12 minimum"
    ],
    "correct": 0
  },
  {
    "question": "Card categories include?",
    "choices": [
      "Personal, Hypothetical, No-Brainers, etc.",
      "Suit cards only",
      "Trump only",
      "Crew cards"
    ],
    "correct": 0
  },
  {
    "question": "An asker scores when?",
    "choices": [
      "They correctly match answers to friends",
      "They have most chips",
      "Drawing aces",
      "Auction wins"
    ],
    "correct": 0
  },
  {
    "question": "Loaded Questions' mood is?",
    "choices": [
      "Friendly social party",
      "Tense strategy",
      "Solo logic",
      "Auction tactics"
    ],
    "correct": 0
  },
  {
    "question": "Travel edition advantage is?",
    "choices": [
      "Portability for road trips and gatherings",
      "Bigger pieces",
      "Higher price",
      "Online only"
    ],
    "correct": 0
  },
  {
    "question": "Loaded Questions debuted in?",
    "choices": [
      "The 1990s",
      "1880s",
      "2010s",
      "2050s"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: LoadedQuestionsGoQuizSettings): LoadedQuestionsGoQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LoadedQuestionsGoQuizState, action: LoadedQuestionsGoQuizAction): LoadedQuestionsGoQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LoadedQuestionsGoQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
