import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PalmeDorQuizSettings { questions: "10" | "20"; }
export interface PalmeDorQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PalmeDorQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Palme d'Or replaced what name in 1955?",
    "choices": [
      "Grand Prix",
      "Lion d'Or",
      "Or de Cannes",
      "Diamant"
    ],
    "correct": 0
  },
  {
    "question": "Won 2 Palmes for I, Daniel Blake / The Wind That Shakes the Barley?",
    "choices": [
      "Ken Loach",
      "Mike Leigh",
      "Stephen Frears",
      "Andrea Arnold"
    ],
    "correct": 0
  },
  {
    "question": "Won Palme for The White Ribbon and Amour?",
    "choices": [
      "Michael Haneke",
      "Lars von Trier",
      "Roman Polanski",
      "Emir Kusturica"
    ],
    "correct": 0
  },
  {
    "question": "'Pulp Fiction' Palme year?",
    "choices": [
      "1992",
      "1994",
      "1996",
      "1998"
    ],
    "correct": 1
  },
  {
    "question": "Dardenne brothers' double Palme films?",
    "choices": [
      "Rosetta + L'Enfant",
      "L'Enfant + Two Days",
      "Rosetta + Le Fils",
      "Two Days + L'Enfant"
    ],
    "correct": 0
  },
  {
    "question": "'Apocalypse Now' shared Palme with?",
    "choices": [
      "The Tin Drum",
      "Kagemusha",
      "All That Jazz",
      "Mon Oncle d'Amerique"
    ],
    "correct": 0
  },
  {
    "question": "Fellini's 'La Dolce Vita' Palme year?",
    "choices": [
      "1958",
      "1960",
      "1962",
      "1964"
    ],
    "correct": 1
  },
  {
    "question": "First woman to solo-win Palme (1993)?",
    "choices": [
      "Lina Wertmüller",
      "Jane Campion",
      "Sofia Coppola",
      "Agnès Varda"
    ],
    "correct": 1
  },
  {
    "question": "Solo woman Palme 2021?",
    "choices": [
      "Julia Ducournau",
      "Jane Campion",
      "Justine Triet",
      "Andrea Arnold"
    ],
    "correct": 0
  },
  {
    "question": "Justine Triet's 2023 Palme film?",
    "choices": [
      "Anatomy of a Fall",
      "In Bed With Victoria",
      "Sibyl",
      "Age of Panic"
    ],
    "correct": 0
  },
  {
    "question": "'Parasite' Palme year?",
    "choices": [
      "2018",
      "2019",
      "2020",
      "2021"
    ],
    "correct": 1
  },
  {
    "question": "Polanski Palme winner film?",
    "choices": [
      "The Pianist",
      "Frantic",
      "Knife in the Water",
      "Tess"
    ],
    "correct": 0
  },
  {
    "question": "Dardenne 2nd Palme year?",
    "choices": [
      "2002",
      "2005",
      "2008",
      "2010"
    ],
    "correct": 1
  },
  {
    "question": "Triangle of Sadness director?",
    "choices": [
      "Ruben Östlund",
      "Roy Andersson",
      "Lukas Moodysson",
      "Tomas Alfredson"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PalmeDorQuizSettings): PalmeDorQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PalmeDorQuizState, action: PalmeDorQuizAction): PalmeDorQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PalmeDorQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
