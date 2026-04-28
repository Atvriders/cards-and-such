import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PhysicsDiscoveriesQuizSettings { questions: "10" | "20" | "30"; }
export interface PhysicsDiscoveriesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PhysicsDiscoveriesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Theory of general relativity was proposed by?",
    "choices": [
      "Newton",
      "Einstein",
      "Maxwell",
      "Bohr"
    ],
    "correct": 1
  },
  {
    "question": "Year general relativity was published?",
    "choices": [
      "1905",
      "1915",
      "1925",
      "1945"
    ],
    "correct": 1
  },
  {
    "question": "Planck's discovery of energy quanta in?",
    "choices": [
      "1850",
      "1900",
      "1925",
      "1950"
    ],
    "correct": 1
  },
  {
    "question": "Discoverer of the electron?",
    "choices": [
      "Rutherford",
      "JJ Thomson",
      "Bohr",
      "Einstein"
    ],
    "correct": 1
  },
  {
    "question": "Higgs boson confirmed at?",
    "choices": [
      "Fermilab in 1998",
      "CERN in 2012",
      "BNL in 2005",
      "SLAC in 1990"
    ],
    "correct": 1
  },
  {
    "question": "Nuclear fission was discovered by?",
    "choices": [
      "Hahn and Strassmann",
      "Fermi alone",
      "Einstein",
      "Curie alone"
    ],
    "correct": 0
  },
  {
    "question": "First controlled nuclear reactor?",
    "choices": [
      "1933",
      "1942",
      "1955",
      "1965"
    ],
    "correct": 1
  },
  {
    "question": "Heisenberg is known for?",
    "choices": [
      "General relativity",
      "Uncertainty principle",
      "Photoelectric effect",
      "Kinetic theory"
    ],
    "correct": 1
  },
  {
    "question": "Maxwell's equations unify?",
    "choices": [
      "Gravity and EM",
      "Electricity and magnetism",
      "Strong and weak",
      "Mass and energy"
    ],
    "correct": 1
  },
  {
    "question": "Discoverer of the neutron?",
    "choices": [
      "Chadwick",
      "Rutherford",
      "Curie",
      "Bohr"
    ],
    "correct": 0
  },
  {
    "question": "Photoelectric effect explained by?",
    "choices": [
      "Newton",
      "Einstein",
      "Bohr",
      "Curie"
    ],
    "correct": 1
  },
  {
    "question": "Planck's constant relates energy to?",
    "choices": [
      "Mass",
      "Frequency",
      "Charge",
      "Temperature"
    ],
    "correct": 1
  },
  {
    "question": "Speed of light measured precisely by?",
    "choices": [
      "Galileo",
      "Michelson",
      "Newton",
      "Bacon"
    ],
    "correct": 1
  },
  {
    "question": "Electromagnetic induction discovered by?",
    "choices": [
      "Maxwell",
      "Faraday",
      "Ampere",
      "Volta"
    ],
    "correct": 1
  },
  {
    "question": "Big Bang theory was supported by discovery of?",
    "choices": [
      "Quasars",
      "Cosmic microwave background",
      "Dark matter",
      "Neutrinos"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PhysicsDiscoveriesQuizSettings): PhysicsDiscoveriesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PhysicsDiscoveriesQuizState, action: PhysicsDiscoveriesQuizAction): PhysicsDiscoveriesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PhysicsDiscoveriesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
