import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MuscleCarsQuizSettings { questions: "10" | "20" | "30"; }
export interface MuscleCarsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MuscleCarsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is widely considered the first muscle car?", choices: ["1964 Pontiac GTO", "1955 Chrysler 300", "1968 Camaro", "1970 Hemi Cuda"], correct: 0 },
  { question: "Who developed the Pontiac GTO?", choices: ["John DeLorean (and team)", "Lee Iacocca", "Carroll Shelby", "Bunkie Knudsen"], correct: 0 },
  { question: "What does 'GTO' stand for?", choices: ["Gran Turismo Omologato (Italian)", "Grand Tour Original", "Great Touring Open", "Generic Touring Option"], correct: 0 },
  { question: "The Ford Mustang debuted in?", choices: ["1964 (1965 model year)", "1962", "1968", "1970"], correct: 0 },
  { question: "Who led the Mustang's development?", choices: ["Lee Iacocca", "Henry Ford II", "Carroll Shelby", "Bob McNamara"], correct: 0 },
  { question: "Carroll Shelby is famous for which Mustang variant?", choices: ["Shelby GT350/GT500", "Boss 302", "Mach 1", "Cobra"], correct: 0 },
  { question: "Chevy Camaro debuted in?", choices: ["1966 (1967 model)", "1968", "1964", "1970"], correct: 0 },
  { question: "Plymouth Hemi Cuda is from which platform?", choices: ["E-body", "B-body", "A-body", "C-body"], correct: 0 },
  { question: "What is the 'Hemi' engine named for?", choices: ["Hemispherical combustion chambers", "High Efficiency", "Heavy Modular Iron", "Hi-Energy Modulation"], correct: 0 },
  { question: "Dodge Challenger debuted in?", choices: ["1970", "1968", "1972", "1965"], correct: 0 },
  { question: "What 1970 Hemi Cuda is one of the most valuable muscle cars at auction?", choices: ["Hemi Cuda Convertible", "Cuda 340", "Cuda 383", "Cuda 440"], correct: 0 },
  { question: "Pontiac Firebird Trans Am featured in which film?", choices: ["Smokey and the Bandit", "Bullitt", "Vanishing Point", "Dirty Mary Crazy Larry"], correct: 0 },
  { question: "Who drove the Bandit Trans Am?", choices: ["Burt Reynolds", "Steve McQueen", "Paul Newman", "Clint Eastwood"], correct: 0 },
  { question: "Bullitt (1968) features what muscle car chase?", choices: ["Mustang GT 390 vs Dodge Charger", "Camaro vs Mustang", "GTO vs Charger", "Cuda vs Mustang"], correct: 0 },
  { question: "Who drove the Bullitt Mustang?", choices: ["Steve McQueen", "James Garner", "Paul Newman", "Robert Redford"], correct: 0 },
  { question: "Dodge Charger Daytona's most distinctive feature?", choices: ["Massive rear wing and aero nose", "Sliding doors", "T-top", "Glass roof"], correct: 0 },
  { question: "Plymouth Superbird's purpose?", choices: ["NASCAR aero homologation", "Drag racing only", "Endurance racing", "Hill climb"], correct: 0 },
  { question: "AMC's muscle car was the?", choices: ["AMX", "AMC Eagle", "Pacer", "Gremlin"], correct: 0 },
  { question: "AMC Javelin was a competitor to?", choices: ["Mustang/Camaro pony cars", "Corvette", "Charger", "GTO"], correct: 0 },
  { question: "What insurance change helped end the muscle car era?", choices: ["Higher rates and emissions standards (early 1970s)", "Lower limits", "New diesel rules", "Speed governors"], correct: 0 },
  { question: "Big-block Chevy 454 was found in?", choices: ["Chevelle SS 454, Corvette LS5/LS6", "Just trucks", "Just Camaros", "Just Caprice"], correct: 0 },
  { question: "Yenko Camaro is famous for?", choices: ["427 cubic inch big-block conversions", "Stock six-cylinders", "Diesel conversions", "Turbocharger"], correct: 0 },
  { question: "Who is Don Yenko?", choices: ["Pittsburgh Chevy dealer who built high-perf Yenko Chevys", "Ford engineer", "Mopar designer", "GM CEO"], correct: 0 },
  { question: "Boss 429 Mustang was built to homologate what?", choices: ["Engine for NASCAR", "Engine for drag racing", "Engine for road racing", "Engine for endurance"], correct: 0 },
  { question: "Modern muscle car revival - 2008 brought back which Camaro generation?", choices: ["Fifth-generation Camaro (2010 model year)", "Fourth gen", "Sixth gen", "Third gen"], correct: 0 },
  { question: "Dodge Demon (2018) had how much HP?", choices: ["840 HP", "707 HP", "1000 HP", "650 HP"], correct: 0 },
  { question: "Dodge Hellcat engine displacement?", choices: ["6.2L supercharged Hemi", "5.7L Hemi", "7.0L", "6.4L"], correct: 0 },
  { question: "Mustang Boss 302 returned for which model years recently?", choices: ["2012-2013", "2008-2010", "2015-2016", "2014-2015"], correct: 0 },
  { question: "What does 'SS' mean on Chevys?", choices: ["Super Sport", "Super Speed", "Special Series", "Standard Sport"], correct: 0 },
  { question: "What does 'R/T' mean on Dodges?", choices: ["Road/Track", "Rapid/Torque", "Race/Tested", "Rear/Traction"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MuscleCarsQuizSettings): MuscleCarsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MuscleCarsQuizState, action: MuscleCarsQuizAction): MuscleCarsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MuscleCarsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
