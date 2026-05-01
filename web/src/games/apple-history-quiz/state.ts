import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AppleHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface AppleHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AppleHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what year was Apple Computer Company founded?", choices: ["1974","1975","1976","1977"], correct: 2 },
  { question: "Who was Apple's third co-founder, besides Steve Jobs and Steve Wozniak?", choices: ["Bill Atkinson","Andy Hertzfeld","Ronald Wayne","Mike Markkula"], correct: 2 },
  { question: "In what year did the original Macintosh launch?", choices: ["1982","1983","1984","1985"], correct: 2 },
  { question: "In what year did Apple release the first iPod?", choices: ["2000","2001","2002","2003"], correct: 1 },
  { question: "In what year was the first iPhone released?", choices: ["2005","2006","2007","2008"], correct: 2 },
  { question: "Steve Jobs returned to Apple in 1997 after Apple acquired which company?", choices: ["NeXT","Pixar","Be Inc.","Newton Inc."], correct: 0 },
  { question: "Apple became the first US public company to reach which valuation?", choices: ["$1 trillion","$500 billion","$2 trillion","$3 trillion"], correct: 0 },
  { question: "What was the first computer Apple sold?", choices: ["Apple I","Apple Lisa","Macintosh","Apple II"], correct: 0 },
  { question: "In what year did Tim Cook become Apple's CEO?", choices: ["2009","2010","2011","2012"], correct: 2 },
  { question: "Who directed the iconic 1984 Macintosh Super Bowl ad?", choices: ["Ridley Scott","Steven Spielberg","James Cameron","George Lucas"], correct: 0 },
  { question: "In what year did Apple launch the original iPad?", choices: ["2009","2010","2011","2012"], correct: 1 },
  { question: "In what year did the Apple Watch debut?", choices: ["2014","2015","2016","2017"], correct: 1 },
  { question: "In what year did Apple open its first retail store?", choices: ["1999","2001","2003","2005"], correct: 1 },
  { question: "Who designed the original rainbow Apple logo with a bite?", choices: ["Rob Janoff","Paul Rand","Jonathan Ive","Susan Kare"], correct: 0 },
  { question: "The first Apple Silicon Macs (Nov 2020) launched with which chip?", choices: ["M1","A14","M2","T2"], correct: 0 },
  { question: "In what year were AirPods first released?", choices: ["2015","2016","2017","2018"], correct: 1 },
  { question: "In what year did Apple acquire Beats Electronics?", choices: ["2012","2014","2016","2018"], correct: 1 },
  { question: "What is the name of Apple's headquarters in Cupertino, opened in 2017?", choices: ["Apple Park","Infinite Loop","Cupertino Campus","One Apple Way"], correct: 0 },
  { question: "What was Apple's previous main headquarters address before Apple Park?", choices: ["1 Infinite Loop","1 Apple Park Way","One Apple Lane","2 Cupertino Drive"], correct: 0 },
  { question: "Which Apple computer in 1998 reintroduced colorful translucent design?", choices: ["iMac G3","Power Mac G4","Mac mini","eMac"], correct: 0 },
  { question: "Who was Apple's chief designer from 1996 to 2019?", choices: ["Jonathan Ive","Susan Kare","Hartmut Esslinger","Robert Brunner"], correct: 0 },
  { question: "What operating system did Apple introduce in March 2001?", choices: ["Mac OS X","System 9","macOS Big Sur","Lisa OS"], correct: 0 },
  { question: "In what year did Apple release the iTunes Store?", choices: ["2001","2002","2003","2004"], correct: 2 },
  { question: "Steve Jobs passed away in what year?", choices: ["2009","2010","2011","2012"], correct: 2 },
  { question: "What is Apple's stock ticker symbol?", choices: ["AAPL","APL","APPL","ACO"], correct: 0 },
  { question: "Apple's Newton MessagePad PDA was discontinued in what year?", choices: ["1996","1997","1998","2000"], correct: 1 },
  { question: "Which year did Apple release the first iPhone with Face ID (iPhone X)?", choices: ["2016","2017","2018","2019"], correct: 1 },
  { question: "What was the codename of Mac OS X 10.0?", choices: ["Cheetah","Puma","Jaguar","Panther"], correct: 0 },
  { question: "In what year did Apple announce the transition from PowerPC to Intel processors?", choices: ["2003","2004","2005","2006"], correct: 2 },
  { question: "Apple's market capitalization first crossed $3 trillion in what year?", choices: ["2020","2021","2022","2024"], correct: 1 }
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
