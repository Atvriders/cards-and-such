import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AppleHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface AppleHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AppleHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Apple was founded in what year?", choices: ["1974","1975","1976","1977"], correct: 2 },
  { question: "Apple's third co-founder was?", choices: ["Bill Atkinson","Andy Hertzfeld","Ronald Wayne","Mike Markkula"], correct: 2 },
  { question: "The Macintosh launched in?", choices: ["1982","1984","1986","1988"], correct: 1 },
  { question: "The first iPod launched in?", choices: ["2000","2001","2002","2003"], correct: 1 },
  { question: "The first iPhone launched in?", choices: ["2005","2006","2007","2008"], correct: 2 },
  { question: "Steve Jobs returned to Apple after acquiring which company?", choices: ["NeXT","Pixar","Be","Newton"], correct: 0 },
  { question: "Apple was the first US company to hit which valuation?", choices: ["$1 trillion","$500 billion","$2 trillion","$3 trillion"], correct: 0 },
  { question: "The first Apple computer was called?", choices: ["Apple I","Apple Lisa","Macintosh","Apple II"], correct: 0 },
  { question: "Tim Cook became CEO in?", choices: ["2009","2010","2011","2012"], correct: 2 },
  { question: "The 1984 Mac Super Bowl ad was directed by?", choices: ["Ridley Scott","Steven Spielberg","James Cameron","George Lucas"], correct: 0 },
  { question: "The iPad was launched in?", choices: ["2009","2010","2011","2012"], correct: 1 },
  { question: "Apple Watch debuted in?", choices: ["2014","2015","2016","2017"], correct: 1 },
  { question: "What was Apple's first retail store year?", choices: ["1999","2001","2003","2005"], correct: 1 },
  { question: "The Apple logo with a bite was designed by?", choices: ["Rob Janoff","Paul Rand","Jonathan Ive","Susan Kare"], correct: 0 },
  { question: "Apple Silicon Macs first launched with which chip?", choices: ["M1","A14","M2","T2"], correct: 0 },
  { question: "AirPods launched in?", choices: ["2015","2016","2017","2018"], correct: 1 },
  { question: "Apple acquired Beats by Dre in?", choices: ["2012","2014","2016","2018"], correct: 1 },
  { question: "Steve Jobs's biological father was?", choices: ["Syrian","Egyptian","Lebanese","German"], correct: 0 },
  { question: "Apple's headquarters is called?", choices: ["Apple Park","Infinite Loop","Cupertino Campus","AppleHQ"], correct: 0 },
  { question: "Apple's market cap first hit $3 trillion in?", choices: ["2020","2021","2022","2024"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AppleHistoryQuizSettings): AppleHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AppleHistoryQuizState, action: AppleHistoryQuizAction): AppleHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AppleHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
