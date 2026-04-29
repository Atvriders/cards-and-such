import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MonikersSeriousQuizSettings { questions: "10"; }
export interface MonikersSeriousQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MonikersSeriousQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Monikers: Serious Nonsense is what to base Monikers?",
    "choices": [
      "A standalone replacement",
      "An expansion pack",
      "A spin-off video game",
      "An app"
    ],
    "correct": 1
  },
  {
    "question": "Monikers core mechanic is which evolving clue style?",
    "choices": [
      "Describe, gesture, one-word",
      "Auction",
      "Bluff and bet",
      "Trick taking"
    ],
    "correct": 0
  },
  {
    "question": "Round 1 in Monikers uses?",
    "choices": [
      "Free-form description",
      "One word only",
      "Gestures only",
      "Drawing"
    ],
    "correct": 0
  },
  {
    "question": "Round 2 Monikers uses?",
    "choices": [
      "One word per clue",
      "Gestures only",
      "Free description",
      "Sound effects only"
    ],
    "correct": 0
  },
  {
    "question": "Round 3 Monikers uses?",
    "choices": [
      "Gestures only",
      "One word",
      "Drawing",
      "Singing"
    ],
    "correct": 0
  },
  {
    "question": "Serious Nonsense adds what?",
    "choices": [
      "More cards/people/things",
      "An app",
      "Solo mode",
      "A board"
    ],
    "correct": 0
  },
  {
    "question": "Monikers was published by?",
    "choices": [
      "CMON",
      "Palm Court",
      "Mattel",
      "Z-Man"
    ],
    "correct": 1
  },
  {
    "question": "Monikers usually plays with how many people?",
    "choices": [
      "1",
      "2 only",
      "4-16",
      "100+"
    ],
    "correct": 2
  },
  {
    "question": "Monikers card content includes?",
    "choices": [
      "People, places, characters",
      "Just adjectives",
      "Math problems",
      "Songs"
    ],
    "correct": 0
  },
  {
    "question": "Serious Nonsense slang refers to?",
    "choices": [
      "Pop culture and oddities",
      "Numbers only",
      "States only",
      "Recipes"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MonikersSeriousQuizSettings): MonikersSeriousQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MonikersSeriousQuizState, action: MonikersSeriousQuizAction): MonikersSeriousQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MonikersSeriousQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
