import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PhysicsDiscoveriesQuizSettings { questions: "10" | "20" | "30"; }
export interface PhysicsDiscoveriesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PhysicsDiscoveriesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Theory of general relativity was formulated by?",
    "choices": [
      "Newton",
      "Einstein",
      "Bohr",
      "Planck"
    ],
    "correct": 1
  },
  {
    "question": "Einstein published general relativity in?",
    "choices": [
      "1905",
      "1915",
      "1925",
      "1935"
    ],
    "correct": 1
  },
  {
    "question": "Law of universal gravitation by?",
    "choices": [
      "Galileo",
      "Newton",
      "Kepler",
      "Einstein"
    ],
    "correct": 1
  },
  {
    "question": "Discovered the electron?",
    "choices": [
      "Thomson",
      "Rutherford",
      "Bohr",
      "Dalton"
    ],
    "correct": 0
  },
  {
    "question": "Nucleus of the atom discovered by?",
    "choices": [
      "Thomson",
      "Rutherford",
      "Bohr",
      "Chadwick"
    ],
    "correct": 1
  },
  {
    "question": "Neutron was discovered by?",
    "choices": [
      "Rutherford",
      "Chadwick",
      "Fermi",
      "Bohr"
    ],
    "correct": 1
  },
  {
    "question": "Quantum theory was founded by?",
    "choices": [
      "Einstein",
      "Planck",
      "Bohr",
      "Schrodinger"
    ],
    "correct": 1
  },
  {
    "question": "Uncertainty principle is associated with?",
    "choices": [
      "Bohr",
      "Heisenberg",
      "Pauli",
      "Dirac"
    ],
    "correct": 1
  },
  {
    "question": "Speed of light is approximately?",
    "choices": [
      "3x10^6 m/s",
      "3x10^8 m/s",
      "3x10^10 m/s",
      "3x10^4 m/s"
    ],
    "correct": 1
  },
  {
    "question": "Discovered radioactivity?",
    "choices": [
      "Curie",
      "Becquerel",
      "Rutherford",
      "Roentgen"
    ],
    "correct": 1
  },
  {
    "question": "First nuclear chain reaction led by?",
    "choices": [
      "Oppenheimer",
      "Fermi",
      "Bohr",
      "Einstein"
    ],
    "correct": 1
  },
  {
    "question": "Higgs boson was confirmed at CERN in?",
    "choices": [
      "2002",
      "2012",
      "2022",
      "1992"
    ],
    "correct": 1
  },
  {
    "question": "Maxwell unified electricity and?",
    "choices": [
      "Gravity",
      "Magnetism",
      "Heat",
      "Sound"
    ],
    "correct": 1
  },
  {
    "question": "Faraday discovered electromagnetic?",
    "choices": [
      "Conduction",
      "Induction",
      "Resistance",
      "Capacitance"
    ],
    "correct": 1
  },
  {
    "question": "Schrodinger is famous for an equation in?",
    "choices": [
      "Optics",
      "Quantum mechanics",
      "Thermodynamics",
      "Relativity"
    ],
    "correct": 1
  },
  {
    "question": "Photoelectric effect explained by?",
    "choices": [
      "Newton",
      "Einstein",
      "Bohr",
      "Maxwell"
    ],
    "correct": 1
  },
  {
    "question": "Discovered laws of planetary motion?",
    "choices": [
      "Copernicus",
      "Kepler",
      "Galileo",
      "Newton"
    ],
    "correct": 1
  },
  {
    "question": "Heliocentric model was proposed by?",
    "choices": [
      "Ptolemy",
      "Copernicus",
      "Galileo",
      "Kepler"
    ],
    "correct": 1
  },
  {
    "question": "Pendulum was studied by?",
    "choices": [
      "Galileo",
      "Newton",
      "Hooke",
      "Pascal"
    ],
    "correct": 0
  },
  {
    "question": "E=mc^2 expresses equivalence of?",
    "choices": [
      "Force and motion",
      "Mass and energy",
      "Charge and field",
      "Heat and work"
    ],
    "correct": 1
  },
  {
    "question": "First atomic bomb tested in?",
    "choices": [
      "1935",
      "1945",
      "1955",
      "1965"
    ],
    "correct": 1
  },
  {
    "question": "Father of modern cosmology?",
    "choices": [
      "Hubble",
      "Einstein",
      "Lemaitre",
      "Hawking"
    ],
    "correct": 2
  },
  {
    "question": "Big Bang evidence: cosmic microwave background found in?",
    "choices": [
      "1945",
      "1965",
      "1985",
      "2005"
    ],
    "correct": 1
  },
  {
    "question": "Discovered superconductivity?",
    "choices": [
      "Onnes",
      "Bardeen",
      "Cooper",
      "Curie"
    ],
    "correct": 0
  },
  {
    "question": "Discovered law of buoyancy?",
    "choices": [
      "Newton",
      "Archimedes",
      "Galileo",
      "Pascal"
    ],
    "correct": 1
  },
  {
    "question": "Pascal's law concerns?",
    "choices": [
      "Gases",
      "Fluids pressure",
      "Magnetism",
      "Light"
    ],
    "correct": 1
  },
  {
    "question": "Discovered law of conservation of mass?",
    "choices": [
      "Lavoisier",
      "Newton",
      "Dalton",
      "Boyle"
    ],
    "correct": 0
  },
  {
    "question": "Tesla pioneered which current system?",
    "choices": [
      "DC",
      "AC",
      "HVDC",
      "Pulsed"
    ],
    "correct": 1
  },
  {
    "question": "Boyle's law relates pressure and?",
    "choices": [
      "Temperature",
      "Volume",
      "Mass",
      "Density"
    ],
    "correct": 1
  },
  {
    "question": "Newton's Principia was published in?",
    "choices": [
      "1687",
      "1787",
      "1587",
      "1487"
    ],
    "correct": 0
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
