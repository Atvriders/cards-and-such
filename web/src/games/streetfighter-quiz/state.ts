import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StreetfighterSettings { questions: "10" | "20" | "30"; }
export interface StreetfighterState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StreetfighterAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "SF developer?", choices: ["Capcom","SNK","Midway","Konami"], correct: 0 },
  { question: "SF1 year?", choices: ["1987","1990","1985","1992"], correct: 0 },
  { question: "SF2 year?", choices: ["1991","1989","1993","1995"], correct: 0 },
  { question: "SF main character?", choices: ["Ryu","Ken","Akuma","Bison"], correct: 0 },
  { question: "Ken is Ryu's?", choices: ["Best friend / rival","Brother","Father","Enemy"], correct: 0 },
  { question: "Ryu's signature move?", choices: ["Hadouken","Shoryuken","Tatsumaki","Spinning"], correct: 0 },
  { question: "Shoryuken is a?", choices: ["Rising uppercut","Fireball","Kick","Throw"], correct: 0 },
  { question: "Hadouken is a?", choices: ["Fireball","Uppercut","Kick","Throw"], correct: 0 },
  { question: "Chun-Li from?", choices: ["China","Japan","Russia","USA"], correct: 0 },
  { question: "Chun-Li's signature move?", choices: ["Spinning Bird Kick / Hyakuretsukyaku","Hadouken","Sonic Boom","Flash Kick"], correct: 0 },
  { question: "Guile from?", choices: ["USA","Russia","Brazil","China"], correct: 0 },
  { question: "Guile's hairstyle?", choices: ["Flat top","Mohawk","Bald","Long"], correct: 0 },
  { question: "Guile's signature move?", choices: ["Sonic Boom / Flash Kick","Hadouken","Spinning","Throw"], correct: 0 },
  { question: "Blanka color?", choices: ["Green","Red","Blue","Yellow"], correct: 0 },
  { question: "Blanka from?", choices: ["Brazil","USA","Russia","China"], correct: 0 },
  { question: "E. Honda is a?", choices: ["Sumo wrestler","Boxer","Karate","Judo"], correct: 0 },
  { question: "Zangief from?", choices: ["Russia","Germany","Poland","USA"], correct: 0 },
  { question: "Zangief's specialty?", choices: ["Wrestling/throws","Kicks","Speed","Magic"], correct: 0 },
  { question: "Dhalsim from?", choices: ["India","Japan","China","Thailand"], correct: 0 },
  { question: "Dhalsim's specialty?", choices: ["Yoga / stretchy limbs","Speed","Power","Throws"], correct: 0 },
  { question: "Bison is the boss in?", choices: ["SF2","SF1","SF3","SF4"], correct: 0 },
  { question: "Akuma's character debuted in?", choices: ["Super SF2 Turbo","SF1","SF3","SF4"], correct: 0 },
  { question: "Sagat is a?", choices: ["Muay Thai master","Sumo","Boxer","Karate"], correct: 0 },
  { question: "Sagat from?", choices: ["Thailand","India","Japan","China"], correct: 0 },
  { question: "Vega wears?", choices: ["Mask + claw","Cape","Hat","Gauntlet"], correct: 0 },
  { question: "Balrog is a?", choices: ["Boxer","Wrestler","Kickboxer","Karate"], correct: 0 },
  { question: "SF4 year?", choices: ["2009","2007","2011","2013"], correct: 0 },
  { question: "SF5 year?", choices: ["2016","2014","2018","2020"], correct: 0 },
  { question: "SF6 year?", choices: ["2023","2021","2024","2025"], correct: 0 },
  { question: "Marvel vs Capcom features SF?", choices: ["Yes","No","Sometimes","Once"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StreetfighterSettings): StreetfighterState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StreetfighterState, action: StreetfighterAction): StreetfighterState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StreetfighterState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
