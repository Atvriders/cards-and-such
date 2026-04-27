import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BreakingBadSettings { questions: "10" | "20" | "30"; }
export interface BreakingBadState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BreakingBadAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Breaking Bad creator?", choices: ["Vince Gilligan","David Lynch","JJ Abrams","Jon Favreau"], correct: 0 },
  { question: "Walter White's alias?", choices: ["Heisenberg","Mr. White","Walt","WW"], correct: 0 },
  { question: "Show's setting?", choices: ["Albuquerque","Phoenix","Tucson","Las Vegas"], correct: 0 },
  { question: "Walter's profession before?", choices: ["Chemistry teacher","Doctor","Lawyer","Engineer"], correct: 0 },
  { question: "Jesse Pinkman's catchphrase?", choices: ["Yeah, science / bitch","OK","Sup","Hi"], correct: 0 },
  { question: "Show ran how many seasons?", choices: ["4","5","6","7"], correct: 1 },
  { question: "Walter's wife?", choices: ["Skyler","Anna","Lana","Cassie"], correct: 0 },
  { question: "Hank Schrader works for?", choices: ["DEA","FBI","CIA","ATF"], correct: 0 },
  { question: "Color of meth they cook?", choices: ["Blue","Pink","Green","Yellow"], correct: 0 },
  { question: "Walter's son?", choices: ["Walt Jr (Flynn)","Hank","Bobby","Brian"], correct: 0 },
  { question: "Spinoff series?", choices: ["Better Call Saul","Mr. Chips","Cooking Bad","Felina"], correct: 0 },
  { question: "Saul Goodman is a?", choices: ["Lawyer","Doctor","Chef","Cop"], correct: 0 },
  { question: "Mike Ehrmantraut is a?", choices: ["Fixer/hitman","Doctor","Lawyer","Cook"], correct: 0 },
  { question: "Gustavo Fring owns?", choices: ["Los Pollos Hermanos","Pizza Hut","El Camino","Big Burger"], correct: 0 },
  { question: "Final episode title?", choices: ["Felina","Granite State","Ozymandias","Face Off"], correct: 0 },
  { question: "Walter's diagnosis?", choices: ["Lung cancer","Heart disease","Kidney failure","Brain tumor"], correct: 0 },
  { question: "Tuco Salamanca is a?", choices: ["Drug dealer","Lawyer","Doctor","Cop"], correct: 0 },
  { question: "Tio's bell is iconic?", choices: ["Yes","No","Sometimes","Once"], correct: 0 },
  { question: "Pizza on roof scene?", choices: ["Yes (famous)","No","Maybe","Twice"], correct: 0 },
  { question: "Walt sells meth to fund?", choices: ["Family/medical bills","Vacation","House","Car"], correct: 0 },
  { question: "Skyler runs a?", choices: ["Car wash","Diner","Bar","Bakery"], correct: 0 },
  { question: "Walt poisoned Brock with?", choices: ["Lily of the valley","Cyanide","Arsenic","Mercury"], correct: 0 },
  { question: "Train heist episode?", choices: ["Dead Freight","Felina","Phoenix","Salud"], correct: 0 },
  { question: "Heisenberg's hat?", choices: ["Pork pie","Fedora","Cap","Top hat"], correct: 0 },
  { question: "Final season aired in?", choices: ["2013","2014","2012","2015"], correct: 0 },
  { question: "Show first aired in?", choices: ["2008","2007","2009","2006"], correct: 0 },
  { question: "I am the one who?", choices: ["Knocks","Cooks","Lies","Wins"], correct: 0 },
  { question: "Network?", choices: ["AMC","HBO","FX","Netflix"], correct: 0 },
  { question: "Hector Salamanca speaks via?", choices: ["Bell","Notes","Phone","Email"], correct: 0 },
  { question: "Walter Jr's breakfast?", choices: ["Bacon","Eggs","Cereal","Pancakes"], correct: 0 },
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
