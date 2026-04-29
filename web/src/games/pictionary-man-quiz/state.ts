import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PictionaryManQuizSettings { questions: "10"; }
export interface PictionaryManQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PictionaryManQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Pictionary Man uses what novel drawing surface?",
    "choices": [
      "A whiteboard",
      "A 3D mannequin",
      "Sand tray",
      "Glow board"
    ],
    "correct": 1
  },
  {
    "question": "Pictionary Man's mannequin can be?",
    "choices": [
      "Posed",
      "Eaten",
      "Bounced",
      "Magnetized"
    ],
    "correct": 0
  },
  {
    "question": "Pictionary Man was branded as what kind of figure?",
    "choices": [
      "Ken doll",
      "Articulated drawing dummy",
      "Soft plush",
      "Action figure"
    ],
    "correct": 1
  },
  {
    "question": "The Pictionary Man timer is typically?",
    "choices": [
      "10 seconds",
      "Standard 60 seconds",
      "Five minutes",
      "No timer"
    ],
    "correct": 1
  },
  {
    "question": "Pictionary Man is recommended for what age?",
    "choices": [
      "3+",
      "6+",
      "10+",
      "21+"
    ],
    "correct": 2
  },
  {
    "question": "Pictionary Man relies on poses plus?",
    "choices": [
      "Sound effects",
      "Drawing on mannequin",
      "Buzzers",
      "Tongue twisters"
    ],
    "correct": 1
  },
  {
    "question": "Pictionary Man box generally contains how many cards?",
    "choices": [
      "~50",
      "~150",
      "~500+",
      "None"
    ],
    "correct": 2
  },
  {
    "question": "The Pictionary Man mannequin includes which feature?",
    "choices": [
      "Hat that lights up",
      "Posable arms and legs",
      "Spinning torso wheel",
      "Magnetic shoes"
    ],
    "correct": 1
  },
  {
    "question": "Pictionary Man emphasizes guessing what?",
    "choices": [
      "Songs",
      "Movies/People/Phrases",
      "Math",
      "Weather"
    ],
    "correct": 1
  },
  {
    "question": "Compared to base Pictionary, Pictionary Man adds?",
    "choices": [
      "Less art skill needed",
      "More art skill",
      "Fewer players",
      "A board"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PictionaryManQuizSettings): PictionaryManQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PictionaryManQuizState, action: PictionaryManQuizAction): PictionaryManQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PictionaryManQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
