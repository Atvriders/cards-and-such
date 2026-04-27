import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PhysicsQuizSettings { questions: "10" | "20" | "30"; }
export interface PhysicsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PhysicsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who formulated the three laws of motion?", choices: ["Galileo", "Newton", "Einstein", "Hawking"], correct: 1 },
  { question: "What does E=mc^2 represent?", choices: ["Mass-energy equivalence", "Force equation", "Wave equation", "Gas law"], correct: 0 },
  { question: "What is the speed of light in vacuum (approx)?", choices: ["300 km/s", "300,000 km/s", "3 million km/s", "300 m/s"], correct: 1 },
  { question: "What is acceleration due to gravity on Earth (approx)?", choices: ["5 m/s^2", "9.8 m/s^2", "10 m/s^2", "12 m/s^2"], correct: 1 },
  { question: "Who proposed general relativity?", choices: ["Newton", "Einstein", "Bohr", "Maxwell"], correct: 1 },
  { question: "What is the SI unit of force?", choices: ["Joule", "Newton", "Watt", "Pascal"], correct: 1 },
  { question: "What is the SI unit of energy?", choices: ["Newton", "Joule", "Watt", "Volt"], correct: 1 },
  { question: "Which law states 'for every action there is an equal and opposite reaction'?", choices: ["Newton's First", "Newton's Second", "Newton's Third", "Hooke's Law"], correct: 2 },
  { question: "What is the smallest unit of energy in quantum theory?", choices: ["Atom", "Quark", "Quantum", "Electron"], correct: 2 },
  { question: "Who proposed the Heisenberg uncertainty principle?", choices: ["Schr\u00f6dinger", "Heisenberg", "Bohr", "Planck"], correct: 1 },
  { question: "What is the SI unit of electric current?", choices: ["Volt", "Ampere", "Ohm", "Watt"], correct: 1 },
  { question: "What is the formula for kinetic energy?", choices: ["mgh", "0.5 mv^2", "ma", "mc^2"], correct: 1 },
  { question: "What is absolute zero in Celsius?", choices: ["0\u00b0C", "-100\u00b0C", "-273.15\u00b0C", "-459\u00b0C"], correct: 2 },
  { question: "What unit measures resistance?", choices: ["Volt", "Ampere", "Ohm", "Coulomb"], correct: 2 },
  { question: "Who developed quantum theory in 1900?", choices: ["Planck", "Einstein", "Bohr", "Curie"], correct: 0 },
  { question: "What is the formula for gravitational potential energy?", choices: ["mgh", "0.5 mv^2", "F=ma", "PV=nRT"], correct: 0 },
  { question: "Which scientist unified electricity and magnetism?", choices: ["Faraday", "Maxwell", "Tesla", "Einstein"], correct: 1 },
  { question: "What is a black body?", choices: ["A perfect emitter/absorber", "A type of star", "A magnet", "A capacitor"], correct: 0 },
  { question: "What is the unit of frequency?", choices: ["Hertz", "Watt", "Joule", "Pascal"], correct: 0 },
  { question: "Who discovered the electron?", choices: ["Thomson", "Rutherford", "Bohr", "Dalton"], correct: 0 },
  { question: "What does inertia describe?", choices: ["Resistance to motion change", "Speed of light", "Magnetic field", "Electric charge"], correct: 0 },
  { question: "Which law describes pressure-volume of gases?", choices: ["Newton's Law", "Boyle's Law", "Ohm's Law", "Coulomb's Law"], correct: 1 },
  { question: "What is centripetal force directed toward?", choices: ["Outward", "Tangentially", "Center of circle", "Up"], correct: 2 },
  { question: "What does Schr\u00f6dinger's cat illustrate?", choices: ["Relativity", "Superposition", "Gravitation", "Magnetism"], correct: 1 },
  { question: "What's the Higgs boson sometimes called?", choices: ["The God Particle", "The Sun Particle", "The Quark", "The Atom"], correct: 0 },
  { question: "What is light's particle nature called?", choices: ["Photon", "Electron", "Proton", "Neutrino"], correct: 0 },
  { question: "Who discovered the law of universal gravitation?", choices: ["Newton", "Einstein", "Galileo", "Hooke"], correct: 0 },
  { question: "What is the Doppler effect about?", choices: ["Color of stars", "Frequency change with motion", "Gravity", "Heat flow"], correct: 1 },
  { question: "What is the second law of thermodynamics about?", choices: ["Energy conservation", "Entropy increases", "Force = mass \u00d7 accel", "Light speed"], correct: 1 },
  { question: "What field did Richard Feynman pioneer?", choices: ["Electrodynamics", "Quantum electrodynamics", "Optics", "Astronomy"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PhysicsQuizSettings): PhysicsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PhysicsQuizState, action: PhysicsQuizAction): PhysicsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PhysicsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
