import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BreakingBadSettings { questions: "10" | "20" | "30"; }
export interface BreakingBadState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BreakingBadAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What city is Breaking Bad set in?", choices: ["Albuquerque","Phoenix","El Paso","Las Vegas"], correct: 0 },
  { question: "What is Walter White's high school subject?", choices: ["Chemistry","Biology","Physics","Math"], correct: 0 },
  { question: "Who plays Walter White?", choices: ["Bryan Cranston","Aaron Paul","Bob Odenkirk","Giancarlo Esposito"], correct: 0 },
  { question: "Who plays Jesse Pinkman?", choices: ["Aaron Paul","Bryan Cranston","Bob Odenkirk","Dean Norris"], correct: 0 },
  { question: "What is Walter's drug-dealer alias?", choices: ["Heisenberg","Capone","Mr. White","The Cook"], correct: 0 },
  { question: "What car does Walter buy his son?", choices: ["Dodge Challenger","Mustang","Camaro","Aztek"], correct: 0 },
  { question: "What car does Walt drive most of the show?", choices: ["Pontiac Aztek","Chevy Tahoe","Ford F-150","Honda Civic"], correct: 0 },
  { question: "Who is Walt's brother-in-law (DEA agent)?", choices: ["Hank Schrader","Tuco","Mike","Saul"], correct: 0 },
  { question: "Who plays Hank Schrader?", choices: ["Dean Norris","Bob Odenkirk","Giancarlo Esposito","RJ Mitte"], correct: 0 },
  { question: "Who plays Saul Goodman?", choices: ["Bob Odenkirk","Dean Norris","Aaron Paul","Jonathan Banks"], correct: 0 },
  { question: "Who is the chicken-restaurant drug kingpin?", choices: ["Gus Fring","Tuco","Hector","Lalo"], correct: 0 },
  { question: "Who plays Gus Fring?", choices: ["Giancarlo Esposito","Mark Margolis","Steven Bauer","Jonathan Banks"], correct: 0 },
  { question: "What chicken chain does Gus operate?", choices: ["Los Pollos Hermanos","KFC","Pollo Loco","Chicken Shack"], correct: 0 },
  { question: "Who plays Mike Ehrmantraut?", choices: ["Jonathan Banks","Dean Norris","Bob Odenkirk","Mark Margolis"], correct: 0 },
  { question: "What color is Walt's signature meth?", choices: ["Blue","Red","Green","Clear"], correct: 0 },
  { question: "What is the chemical purity of Walt's signature product?", choices: ["99.1%","100%","95%","98.6%"], correct: 0 },
  { question: "What is Walt's wife's name?", choices: ["Skyler","Marie","Lydia","Andrea"], correct: 0 },
  { question: "Who plays Skyler White?", choices: ["Anna Gunn","Betsy Brandt","Laura Fraser","RJ Mitte"], correct: 0 },
  { question: "What does Hank collect as a hobby?", choices: ["Minerals (rocks)","Coins","Stamps","Comics"], correct: 0 },
  { question: "Who runs the laundry where the superlab is hidden?", choices: ["Lavanderia Brillante","Albuquerque Cleaners","Sparkle Wash","Better Call"], correct: 0 },
  { question: "What is Walt Jr.'s alternate name in later seasons?", choices: ["Flynn","Walt","Junior","Henry"], correct: 0 },
  { question: "How many seasons does Breaking Bad have?", choices: ["5","6","4","7"], correct: 0 },
  { question: "Who created Breaking Bad?", choices: ["Vince Gilligan","David Chase","David Simon","Matt Weiner"], correct: 0 },
  { question: "What disease does Walter have?", choices: ["Lung cancer","Brain cancer","Leukemia","Pancreatic cancer"], correct: 0 },
  { question: "What is the name of the spinoff prequel?", choices: ["Better Call Saul","El Camino","Heisenberg","The Cook"], correct: 0 },
  { question: "What movie continues Jesse's story?", choices: ["El Camino","Better Call Saul","Breaking Bad: After","Heisenberg's Last"], correct: 0 },
  { question: "Who plays Tuco Salamanca?", choices: ["Raymond Cruz","Mark Margolis","Steven Bauer","Bryan Cranston"], correct: 0 },
  { question: "Who plays Hector 'Tio' Salamanca?", choices: ["Mark Margolis","Raymond Cruz","Steven Bauer","Giancarlo Esposito"], correct: 0 },
  { question: "What does Hector use to communicate?", choices: ["A bell","A whiteboard","Sign language","A typewriter"], correct: 0 },
  { question: "How does Gus Fring die?", choices: ["Bomb on Hector's wheelchair","Shot by Walt","Poisoned","Car crash"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BreakingBadSettings): BreakingBadState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BreakingBadState, action: BreakingBadAction): BreakingBadState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BreakingBadState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
