import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PenteSettings { questions: "10"; }
export interface PenteState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PenteAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Pente is a Western adaptation of",
    "choices": [
      "Ninuki-Renju (Japanese five-in-a-row with captures)",
      "Go",
      "Chess",
      "Mahjong"
    ],
    "correct": 0
  },
  {
    "question": "Pente was created by",
    "choices": [
      "Gary Gabrel in 1977",
      "Lewis Carroll",
      "Sid Sackson",
      "Marcel Duchamp"
    ],
    "correct": 0
  },
  {
    "question": "Standard board size?",
    "choices": [
      "19x19",
      "15x15",
      "9x9",
      "8x8"
    ],
    "correct": 0
  },
  {
    "question": "Win conditions?",
    "choices": [
      "Five-in-a-row OR five pair-captures",
      "Five-in-a-row only",
      "Capture first stone",
      "Surround opponent"
    ],
    "correct": 0
  },
  {
    "question": "A capture occurs when",
    "choices": [
      "Two adjacent enemy stones are flanked by your stones",
      "Three stones touch",
      "An enemy is alone",
      "A king-row forms"
    ],
    "correct": 0
  },
  {
    "question": "First-move rule?",
    "choices": [
      "Center placement required",
      "Anywhere",
      "Edges only",
      "Diagonals only"
    ],
    "correct": 0
  },
  {
    "question": "Pente was originally branded as",
    "choices": [
      "A boxed paper-board game from Hasbro",
      "A card game",
      "A digital app",
      "A puzzle"
    ],
    "correct": 0
  },
  {
    "question": "Pente differs from Renju primarily in",
    "choices": [
      "The capture mechanic and lack of forbidden moves",
      "Board size",
      "Number of stones",
      "Win condition only"
    ],
    "correct": 0
  },
  {
    "question": "Strategically, captures often used to",
    "choices": [
      "Break opponent's developing lines",
      "End game in five turns",
      "Force a stalemate",
      "Skip turns"
    ],
    "correct": 0
  },
  {
    "question": "Pente has variants like",
    "choices": [
      "Keryo-Pente, Pro-Pente, etc",
      "No variants",
      "Only one version",
      "Only digital"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PenteSettings): PenteState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PenteState, action: PenteAction): PenteState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PenteState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
