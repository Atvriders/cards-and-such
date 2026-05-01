import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BreakingBadSettings { questions: "10" | "20" | "30"; }
export interface BreakingBadState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BreakingBadAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's Walter White's profession originally?", choices: ["High school chemistry teacher","Lawyer","Doctor","Engineer"], correct: 0 },
  { question: "What city is Breaking Bad set in?", choices: ["Albuquerque","Phoenix","El Paso","Tucson"], correct: 0 },
  { question: "What state is Breaking Bad set in?", choices: ["New Mexico","Arizona","Texas","Colorado"], correct: 0 },
  { question: "What's Walt's alias?", choices: ["Heisenberg","Saul","Mr. White","Just Walt"], correct: 0 },
  { question: "Who plays Walter White?", choices: ["Bryan Cranston","Aaron Paul","Bob Odenkirk","Giancarlo Esposito"], correct: 0 },
  { question: "Who plays Jesse Pinkman?", choices: ["Aaron Paul","Bryan Cranston","Bob Odenkirk","Giancarlo Esposito"], correct: 0 },
  { question: "What disease does Walt have?", choices: ["Lung cancer","Brain cancer","Pancreatic cancer","Leukemia"], correct: 0 },
  { question: "What is Walt's wife's name?", choices: ["Skyler","Marie","Lydia","Holly"], correct: 0 },
  { question: "Who plays Skyler?", choices: ["Anna Gunn","Betsy Brandt","Laura Fraser","Jessica Hecht"], correct: 0 },
  { question: "What's Walt's brother-in-law's profession?", choices: ["DEA agent","FBI","Police","Lawyer"], correct: 0 },
  { question: "Who's Hank?", choices: ["Walt's brother-in-law","DEA agent","Both","Just brother-in-law"], correct: 2 },
  { question: "What color is Walt's signature meth?", choices: ["Blue","Red","Yellow","Green"], correct: 0 },
  { question: "What's Saul's full name?", choices: ["Saul Goodman / Jimmy McGill","Just Saul","Just Jimmy","Both"], correct: 0 },
  { question: "Who plays Saul?", choices: ["Bob Odenkirk","Bryan Cranston","Aaron Paul","Jonathan Banks"], correct: 0 },
  { question: "What's Gus Fring's restaurant?", choices: ["Los Pollos Hermanos","Just Pollos","Twin Brothers Chicken","All names"], correct: 0 },
  { question: "Who plays Gus Fring?", choices: ["Giancarlo Esposito","Mark Margolis","Tony Dalton","Lavell Crawford"], correct: 0 },
  { question: "What's Tuco's last name?", choices: ["Salamanca","Both Tuco and family","Just Salamanca","Tio's nephew"], correct: 0 },
  { question: "What episode is Ozymandias?", choices: ["Season 5 Episode 14","Season 4","Season 3","Season 5 finale"], correct: 0 },
  { question: "What movie continued Jesse's story?", choices: ["El Camino","Better Call Saul","Both","Just El Camino"], correct: 0 },
  { question: "What spinoff features Saul?", choices: ["Better Call Saul","Just Saul","Both","No spinoff"], correct: 0 },
  { question: "How many seasons did Breaking Bad have?", choices: ["5","6","4","7"], correct: 0 },
  { question: "What was Walt's first big partner?", choices: ["Krazy-8 (briefly)","Just Jesse","Both early","Tuco"], correct: 0 },
  { question: "What's the school Walt teaches at?", choices: ["JP Wynne","just school","Albuquerque High","Marshall"], correct: 0 },
  { question: "What's the company name Walt founds for laundering?", choices: ["A1A Car Wash","Mr. White Solutions","Both","Just A1A"], correct: 0 },
  { question: "Who plays Mike Ehrmantraut?", choices: ["Jonathan Banks","Mark Margolis","Bob Odenkirk","Giancarlo Esposito"], correct: 0 },
  { question: "Who plays Hector Tio Salamanca?", choices: ["Mark Margolis","Mark Marges","Tony Dalton","Just Margolis"], correct: 0 },
  { question: "What does Tio communicate with?", choices: ["Bell on wheelchair","Pen tap","Both","Just bell"], correct: 2 },
  { question: "What's Walt's son's name?", choices: ["Walt Jr / Flynn","Just Walter","Holly is daughter","Both Walt Jr and Flynn"], correct: 3 },
  { question: "What's Walt's daughter's name?", choices: ["Holly","Skyler is wife","Marie is sister-in-law","Holly is daughter"], correct: 0 },
  { question: "What chemical is the show's recurring icon?", choices: ["Element symbols Br Ba (Breaking Bad title)","Just chemistry","Both","Just elements"], correct: 2 },
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
