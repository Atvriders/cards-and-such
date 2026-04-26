import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface ScientistsState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type ScientistsAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" } | { type:"tick" };
export interface ScientistsSettings { questions: "10"|"20"|"30"; }

const ALL_Q: QuizQuestion[] = [
  { question:"Who proposed the theory of general relativity?", choices:["Isaac Newton","Niels Bohr","Albert Einstein","Max Planck"], correct:2 },
  { question:"Which scientist described the three laws of motion?", choices:["Galileo Galilei","Isaac Newton","Robert Hooke","Johannes Kepler"], correct:1 },
  { question:"Who discovered penicillin?", choices:["Louis Pasteur","Joseph Lister","Alexander Fleming","Robert Koch"], correct:2 },
  { question:"Marie Curie was the first woman to win a Nobel Prize in which field?", choices:["Chemistry","Literature","Physics","Medicine"], correct:2 },
  { question:"Charles Darwin proposed which theory?", choices:["Germ theory","Quantum mechanics","Evolution by natural selection","Plate tectonics"], correct:2 },
  { question:"Which scientist described the double helix structure of DNA?", choices:["Rosalind Franklin","Francis Crick","James Watson","Both Crick and Watson"], correct:3 },
  { question:"Galileo Galilei improved which instrument to observe moons of Jupiter?", choices:["Microscope","Barometer","Telescope","Thermometer"], correct:2 },
  { question:"Who developed the smallpox vaccine?", choices:["Louis Pasteur","Edward Jenner","Robert Koch","Joseph Lister"], correct:1 },
  { question:"Which scientist developed the germ theory of disease?", choices:["Florence Nightingale","Louis Pasteur","Gregor Mendel","Wilhelm Röntgen"], correct:1 },
  { question:"Wilhelm Röntgen discovered which type of radiation?", choices:["Gamma rays","Infrared radiation","X-rays","Ultraviolet light"], correct:2 },
  { question:"Who is known as the father of genetics?", choices:["Charles Darwin","Gregor Mendel","Thomas Morgan","Francis Galton"], correct:1 },
  { question:"Which scientist formulated the laws of planetary motion?", choices:["Galileo","Copernicus","Johannes Kepler","Tycho Brahe"], correct:2 },
  { question:"Who invented the telephone?", choices:["Thomas Edison","Nikola Tesla","Alexander Graham Bell","Guglielmo Marconi"], correct:2 },
  { question:"Nikola Tesla is famous for work with?", choices:["Direct current","Alternating current","Radio waves only","X-rays"], correct:1 },
  { question:"Which physicist developed quantum mechanics' uncertainty principle?", choices:["Niels Bohr","Werner Heisenberg","Erwin Schrödinger","Paul Dirac"], correct:1 },
  { question:"Richard Feynman contributed greatly to which field?", choices:["Plate tectonics","Quantum electrodynamics","Genetics","Astronomy"], correct:1 },
  { question:"Who proposed the heliocentric model of the solar system?", choices:["Galileo Galilei","Tycho Brahe","Nicolaus Copernicus","Johannes Kepler"], correct:2 },
  { question:"Which scientist first synthesized nylon?", choices:["Leo Baekeland","Wallace Carothers","Fritz Haber","Percy Julian"], correct:1 },
  { question:"Linus Pauling won two Nobel Prizes in which fields?", choices:["Physics and Chemistry","Chemistry and Peace","Medicine and Chemistry","Physics and Peace"], correct:1 },
  { question:"Which scientist developed the Periodic Table of Elements?", choices:["Antoine Lavoisier","John Dalton","Dmitri Mendeleev","Ernest Rutherford"], correct:2 },
  { question:"Ernest Rutherford discovered the atomic?", choices:["Electron","Proton (nucleus)","Neutron","Quark"], correct:1 },
  { question:"James Clerk Maxwell unified which two forces in equations?", choices:["Gravity and electromagnetism","Electricity and magnetism","Nuclear and gravity","Weak and strong force"], correct:1 },
  { question:"Who developed the theory of special relativity?", choices:["Max Planck","Niels Bohr","Albert Einstein","Ernest Rutherford"], correct:2 },
  { question:"Which chemist discovered oxygen?", choices:["Antoine Lavoisier","Joseph Priestley","Carl Wilhelm Scheele","Humphry Davy"], correct:1 },
  { question:"Carl Sagan was famous for popularizing which field?", choices:["Biology","Astronomy and cosmology","Chemistry","Geology"], correct:1 },
  { question:"Stephen Hawking's most famous work concerned which objects?", choices:["Black holes","Galaxies","Neutron stars","Dark matter"], correct:0 },
  { question:"Who coined the term 'scientist'?", choices:["Francis Bacon","William Whewell","John Herschel","Thomas Young"], correct:1 },
  { question:"Alan Turing is known as the father of which field?", choices:["Robotics","Computer science","Cybernetics","Information theory"], correct:1 },
  { question:"Rachel Carson's 'Silent Spring' raised awareness about?", choices:["Nuclear waste","Pesticides and ecology","Ozone depletion","Acid rain"], correct:1 },
  { question:"Which scientist described the photoelectric effect (contributing to the Nobel Prize)?", choices:["Max Planck","Albert Einstein","Niels Bohr","Arthur Compton"], correct:1 },
];

function shuffle<T>(arr:T[], rng:()=>number):T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a; }

export function initialState(seed:number, settings:ScientistsSettings):ScientistsState {
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

export function reducer(state:ScientistsState, action:ScientistsAction):ScientistsState {
  if(state.phase==="done") return state;
  switch(action.type){
    case"select": if(state.submitted) return state; return {...state,selected:action.choice};
    case"submit":{
      if(state.submitted||state.selected===null) return state;
      const q=state.questions[state.currentIndex]!;
      const ok=state.selected===q.correct;
      const pts=ok?100+Math.floor(state.timeLeft*10):0;
      return {...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};
    }
    case"tick":{
      if(state.submitted) return state;
      const t=state.timeLeft-1;
      if(t<=0) return {...state,timeLeft:0,submitted:true,phase:"result"};
      return {...state,timeLeft:t};
    }
    case"next":{
      const next=state.currentIndex+1;
      if(next>=state.questions.length) return {...state,phase:"done"};
      return {...state,currentIndex:next,selected:null,submitted:false,timeLeft:15,phase:"playing"};
    }
    default: return state;
  }
}

export function isTerminal(state:ScientistsState):{score:number}|null {
  return state.phase==="done"?{score:state.score}:null;
}
