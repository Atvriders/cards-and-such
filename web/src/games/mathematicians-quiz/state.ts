import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface MathematiciansState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type MathematiciansAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" } | { type:"tick" };
export interface MathematiciansSettings { questions: "10"|"20"|"30"; }

const ALL_Q: QuizQuestion[] = [
  { question:"Who proved Fermat's Last Theorem in 1994?", choices:["John Conway","Andrew Wiles","Grigori Perelman","Terence Tao"], correct:1 },
  { question:"Euclid is called the father of which branch?", choices:["Algebra","Geometry","Calculus","Number theory"], correct:1 },
  { question:"Who invented calculus independently of Newton?", choices:["Leonhard Euler","Gottfried Wilhelm Leibniz","Carl Gauss","Blaise Pascal"], correct:1 },
  { question:"Carl Friedrich Gauss is called the prince of?", choices:["Algebra","Geometry","Mathematics","Physics"], correct:2 },
  { question:"Leonhard Euler introduced which letter for the base of natural logarithm?", choices:["π","i","e","φ"], correct:2 },
  { question:"Who developed the theory of groups in algebra?", choices:["Augustin-Louis Cauchy","Évariste Galois","Niels Henrik Abel","Karl Weierstrass"], correct:1 },
  { question:"Srinivasa Ramanujan was a self-taught genius from which country?", choices:["Pakistan","Sri Lanka","India","Bangladesh"], correct:2 },
  { question:"Emmy Noether made fundamental contributions to which field?", choices:["Geometry","Abstract algebra","Topology","Numerical analysis"], correct:1 },
  { question:"Which mathematician formulated the incompleteness theorems?", choices:["Bertrand Russell","David Hilbert","Kurt Gödel","Alan Turing"], correct:2 },
  { question:"Blaise Pascal invented an early mechanical?", choices:["Clock","Calculator","Telescope","Printing press"], correct:1 },
  { question:"Who is credited with the Pythagorean theorem?", choices:["Euclid","Archimedes","Pythagoras","Thales"], correct:2 },
  { question:"Archimedes discovered the principle of?", choices:["Gravity","Buoyancy","Inertia","Momentum"], correct:1 },
  { question:"Which Russian mathematician proved the Poincaré conjecture in 2003?", choices:["Mikhail Gromov","Andrei Kolmogorov","Grigori Perelman","Vladimir Arnold"], correct:2 },
  { question:"John von Neumann made foundational contributions to?", choices:["Topology only","Game theory and quantum mechanics","Number theory only","Statistics only"], correct:1 },
  { question:"George Boole developed which algebra used in computing?", choices:["Linear algebra","Boolean algebra","Abstract algebra","Tensor algebra"], correct:1 },
  { question:"Pierre de Fermat is famous for which conjecture (proved later)?", choices:["Goldbach's conjecture","Four-color theorem","Fermat's Last Theorem","Riemann hypothesis"], correct:2 },
  { question:"The Riemann hypothesis concerns the distribution of?", choices:["Prime numbers","Fibonacci numbers","Perfect squares","Transcendental numbers"], correct:0 },
  { question:"David Hilbert proposed 23 famous unsolved?", choices:["Equations","Problems","Theorems","Conjectures"], correct:1 },
  { question:"Who is known as the first computer programmer?", choices:["Charles Babbage","Ada Lovelace","Alan Turing","George Boole"], correct:1 },
  { question:"Fibonacci is best known for which sequence?", choices:["Powers of 2","1,1,2,3,5,8... (each term = sum of prior two)","1,4,9,16... (perfect squares)","2,3,5,7... (primes)"], correct:1 },
  { question:"Évariste Galois died in a duel at age?", choices:["17","20","24","30"], correct:1 },
  { question:"The number π (pi) was computed to many decimal places — what type of number is it?", choices:["Rational","Irrational and transcendental","Algebraic","Integer"], correct:1 },
  { question:"Gottfried Leibniz also contributed significantly to?", choices:["Optics","Philosophy and logic","Chemistry","Mechanics only"], correct:1 },
  { question:"Who formalized the concept of a mathematical function?", choices:["Newton","Euler","Leibniz","Fourier"], correct:1 },
  { question:"Joseph Fourier is famous for the decomposition of functions into?", choices:["Polynomials","Sine and cosine waves (Fourier series)","Vectors","Matrices"], correct:1 },
  { question:"Which mathematician gave his name to a number connecting e, i, π, 1, and 0?", choices:["Newton","Euler","Riemann","Gauss"], correct:1 },
  { question:"Who developed topology and the Möbius strip concept?", choices:["Bernhard Riemann","August Möbius","Felix Klein","Henri Poincaré"], correct:1 },
  { question:"Which Indian mathematician worked on partition theory with Hardy?", choices:["Aryabhata","Srinivasa Ramanujan","Brahmagupta","Madhava"], correct:1 },
  { question:"René Descartes invented which coordinate system?", choices:["Polar coordinates","Cartesian coordinates","Spherical coordinates","Cylindrical coordinates"], correct:1 },
  { question:"Niels Henrik Abel proved that there is no general solution for polynomials of degree greater than?", choices:["3","4","5","6"], correct:1 },
];

function shuffle<T>(arr:T[], rng:()=>number):T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a; }

export function initialState(seed:number, settings:MathematiciansSettings):MathematiciansState {
  const rng=mulberry32(seed);
  const count=parseInt(settings.questions,10);
  let pool=shuffle([...ALL_Q],rng).slice(0,Math.min(count,ALL_Q.length));
  const questions=pool.map(q=>{
    const idx=q.choices.map((c,i)=>({c,i}));
    const sh=shuffle(idx,rng);
    const newCorrect=sh.findIndex(x=>x.i===q.correct) as 0|1|2|3;
    return {...q,choices:sh.map(x=>x.c) as [string,string,string,string],correct:newCorrect};
  });
  return {questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}

export function reducer(state:MathematiciansState, action:MathematiciansAction):MathematiciansState {
  if(state.phase==="done") return state;
  switch(action.type){
    case"select": if(state.submitted) return state; return {...state,selected:action.choice};
    case"submit":{ if(state.submitted||state.selected===null) return state; const q=state.questions[state.currentIndex]!; const ok=state.selected===q.correct; const pts=ok?100+Math.floor(state.timeLeft*10):0; return {...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"}; }
    case"tick":{ if(state.submitted) return state; const t=state.timeLeft-1; if(t<=0) return {...state,timeLeft:0,submitted:true,phase:"result"}; return {...state,timeLeft:t}; }
    case"next":{ const next=state.currentIndex+1; if(next>=state.questions.length) return {...state,phase:"done"}; return {...state,currentIndex:next,selected:null,submitted:false,timeLeft:15,phase:"playing"}; }
    default: return state;
  }
}

export function isTerminal(state:MathematiciansState):{score:number}|null {
  return state.phase==="done"?{score:state.score}:null;
}
