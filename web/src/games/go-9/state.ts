import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Go9Settings { questions: "10"; }
export interface Go9State { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Go9Action = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Go (9x9) board has how many intersections?",
    "choices": [
      "81",
      "361",
      "169",
      "25"
    ],
    "correct": 0
  },
  {
    "question": "Compared to 19x19, 9x9 games are",
    "choices": [
      "Shorter and more tactical",
      "Longer",
      "Identical length",
      "Endless"
    ],
    "correct": 0
  },
  {
    "question": "Win condition?",
    "choices": [
      "Higher territory + captures at game's end",
      "Checkmate",
      "First to capture five stones",
      "Race across board"
    ],
    "correct": 0
  },
  {
    "question": "Standard 9x9 komi for white?",
    "choices": [
      "About 5.5 to 7",
      "0",
      "20",
      "100"
    ],
    "correct": 0
  },
  {
    "question": "Pass moves are",
    "choices": [
      "Allowed and end the game when both pass consecutively",
      "Forbidden",
      "Only on move 1",
      "Mandatory move 50"
    ],
    "correct": 0
  },
  {
    "question": "Captures occur when",
    "choices": [
      "A stone or group has zero liberties",
      "A stone is alone",
      "Two stones touch",
      "Three diagonals form"
    ],
    "correct": 0
  },
  {
    "question": "Suicide rule?",
    "choices": [
      "Self-capture is forbidden in most rule sets",
      "Always allowed",
      "Only on edges",
      "Only black may"
    ],
    "correct": 0
  },
  {
    "question": "Ko rule?",
    "choices": [
      "Prevents immediate recapture creating infinite loops",
      "Allows free recapture",
      "Restricts only edges",
      "Skips three turns"
    ],
    "correct": 0
  },
  {
    "question": "9x9 Go is recommended for",
    "choices": [
      "Beginners and quick games",
      "Only experts",
      "Tournament-only play",
      "Computer programs only"
    ],
    "correct": 0
  },
  {
    "question": "Standard piece colors?",
    "choices": [
      "Black and white stones",
      "Red and blue",
      "Green and yellow",
      "Multi-colored"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Go9Settings): Go9State {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Go9State, action: Go9Action): Go9State {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Go9State): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
