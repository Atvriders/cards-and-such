import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LoadedQuestionsQuizSettings { questions: "10"; }
export interface LoadedQuestionsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LoadedQuestionsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Loaded Questions has players answer how?",
    "choices": [
      "Secretly, then guesser matches",
      "Loud and proud",
      "On a board only",
      "By dice"
    ],
    "correct": 0
  },
  {
    "question": "The guesser tries to identify?",
    "choices": [
      "Who said which answer",
      "Total score",
      "Drawing",
      "Music"
    ],
    "correct": 0
  },
  {
    "question": "Loaded Questions was published by?",
    "choices": [
      "All Things Equal",
      "Hasbro",
      "Mattel",
      "USAopoly"
    ],
    "correct": 0
  },
  {
    "question": "Loaded Questions categories include?",
    "choices": [
      "Hypothetical, personal, no right answer",
      "Math",
      "Map facts",
      "Sports stats"
    ],
    "correct": 0
  },
  {
    "question": "Loaded Questions plays with how many?",
    "choices": [
      "1",
      "Just 2",
      "3-6 usually",
      "30+"
    ],
    "correct": 2
  },
  {
    "question": "The original game year is approx?",
    "choices": [
      "1997",
      "2003",
      "2010",
      "2018"
    ],
    "correct": 0
  },
  {
    "question": "On the Go variant emphasizes?",
    "choices": [
      "Travel-friendly card-only play",
      "Online only",
      "App only",
      "Board-heavy play"
    ],
    "correct": 0
  },
  {
    "question": "Loaded Questions points are scored when?",
    "choices": [
      "Guesser matches answers correctly",
      "Random draw",
      "Highest dice",
      "Most cards"
    ],
    "correct": 0
  },
  {
    "question": "Players take turns being?",
    "choices": [
      "The guesser",
      "The judge",
      "The dealer",
      "The audience only"
    ],
    "correct": 0
  },
  {
    "question": "The fun comes mostly from?",
    "choices": [
      "Quirky honest answers",
      "Tactical depth",
      "Bluff betting",
      "Drawing"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: LoadedQuestionsQuizSettings): LoadedQuestionsQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LoadedQuestionsQuizState, action: LoadedQuestionsQuizAction): LoadedQuestionsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LoadedQuestionsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
