import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SanFranciscoQuakeQuizSettings { questions: "10" | "20" | "30"; }
export interface SanFranciscoQuakeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SanFranciscoQuakeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "What year was the SF earthquake?",
    "choices": [
      "1900",
      "1903",
      "1906",
      "1910"
    ],
    "correct": 2
  },
  {
    "question": "Date of the quake?",
    "choices": [
      "April 18",
      "May 18",
      "March 18",
      "June 18"
    ],
    "correct": 0
  },
  {
    "question": "Estimated magnitude?",
    "choices": [
      "6.5",
      "7.9",
      "8.5",
      "9.0"
    ],
    "correct": 1
  },
  {
    "question": "Fault responsible?",
    "choices": [
      "Hayward",
      "San Andreas",
      "Calaveras",
      "Garlock"
    ],
    "correct": 1
  },
  {
    "question": "Major secondary disaster?",
    "choices": [
      "Tsunami",
      "Fire",
      "Flood",
      "Plague"
    ],
    "correct": 1
  },
  {
    "question": "Roughly how many died?",
    "choices": [
      "~300",
      "~3,000",
      "~30,000",
      "~300,000"
    ],
    "correct": 1
  },
  {
    "question": "Famous opera singer in SF that night?",
    "choices": [
      "Caruso",
      "Pavarotti",
      "Domingo",
      "Tucker"
    ],
    "correct": 0
  },
  {
    "question": "City home to which major university (across bay)?",
    "choices": [
      "UCLA",
      "Berkeley",
      "Stanford",
      "USC"
    ],
    "correct": 1
  },
  {
    "question": "How long did the quake last?",
    "choices": [
      "10 sec",
      "45-60 sec",
      "3 min",
      "10 min"
    ],
    "correct": 1
  },
  {
    "question": "Approx. percent of city destroyed?",
    "choices": [
      "10%",
      "30%",
      "50%",
      "80%"
    ],
    "correct": 3
  },
  {
    "question": "How many buildings destroyed?",
    "choices": [
      "~2,800",
      "~28,000",
      "~280,000",
      "~2.8 million"
    ],
    "correct": 1
  },
  {
    "question": "Mayor at the time?",
    "choices": [
      "James Phelan",
      "Eugene Schmitz",
      "James Rolph",
      "Edwin Pond"
    ],
    "correct": 1
  },
  {
    "question": "Most homeless were sheltered in?",
    "choices": [
      "Tents in Golden Gate Park",
      "Hotels",
      "Ferry building",
      "Friend's homes"
    ],
    "correct": 0
  },
  {
    "question": "Soldiers were ordered to do what to looters?",
    "choices": [
      "Arrest",
      "Shoot on sight",
      "Ignore",
      "Imprison"
    ],
    "correct": 1
  },
  {
    "question": "Famous photographer who documented the aftermath?",
    "choices": [
      "Ansel Adams",
      "Arnold Genthe",
      "Edward Weston",
      "Dorothea Lange"
    ],
    "correct": 1
  },
  {
    "question": "Quake also hit which other city severely?",
    "choices": [
      "Sacramento",
      "Oakland",
      "San Jose & Santa Rosa",
      "Los Angeles"
    ],
    "correct": 2
  },
  {
    "question": "Number of dynamite charges used to make firebreaks?",
    "choices": [
      "Few",
      "Hundreds",
      "Thousands",
      "None"
    ],
    "correct": 1
  },
  {
    "question": "Insurance damage in 1906 dollars?",
    "choices": [
      "$5M",
      "$50M",
      "$235M",
      "$1B"
    ],
    "correct": 2
  },
  {
    "question": "City's population at the time?",
    "choices": [
      "50,000",
      "100,000",
      "410,000",
      "800,000"
    ],
    "correct": 2
  },
  {
    "question": "City Hall was?",
    "choices": [
      "Saved",
      "Destroyed",
      "Untouched",
      "Collapsed before quake"
    ],
    "correct": 1
  },
  {
    "question": "In what year did the Great San Francisco Earthquake occur?",
    "choices": [
      "1898",
      "1906",
      "1912",
      "1923"
    ],
    "correct": 1
  },
  {
    "question": "On what date did it strike?",
    "choices": [
      "April 18",
      "April 22",
      "May 1",
      "May 18"
    ],
    "correct": 0
  },
  {
    "question": "Estimated magnitude (modern moment scale)?",
    "choices": [
      "6.9",
      "7.4",
      "7.9",
      "8.5"
    ],
    "correct": 2
  },
  {
    "question": "Which fault primarily ruptured?",
    "choices": [
      "Hayward",
      "Calaveras",
      "San Andreas",
      "San Jacinto"
    ],
    "correct": 2
  },
  {
    "question": "Most of the city's destruction came from?",
    "choices": [
      "Shaking",
      "Fire",
      "Tsunami",
      "Landslide"
    ],
    "correct": 1
  },
  {
    "question": "Approximately how many died?",
    "choices": [
      "~300",
      "~1,000",
      "~3,000",
      "~10,000"
    ],
    "correct": 2
  },
  {
    "question": "Mayor of SF at the time?",
    "choices": [
      "James Phelan",
      "Eugene Schmitz",
      "P.H. McCarthy",
      "James Rolph"
    ],
    "correct": 1
  },
  {
    "question": "Famous opera singer who fled the city?",
    "choices": [
      "Verdi",
      "Puccini",
      "Caruso",
      "Toscanini"
    ],
    "correct": 2
  },
  {
    "question": "How many city blocks burned?",
    "choices": [
      "~50",
      "~150",
      "~500",
      "~1,000"
    ],
    "correct": 2
  },
  {
    "question": "How many were left homeless?",
    "choices": [
      "~50,000",
      "~150,000",
      "~225,000",
      "~400,000"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SanFranciscoQuakeQuizSettings): SanFranciscoQuakeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SanFranciscoQuakeQuizState, action: SanFranciscoQuakeQuizAction): SanFranciscoQuakeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SanFranciscoQuakeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
