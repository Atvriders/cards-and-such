import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AmazonHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface AmazonHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AmazonHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what year was Amazon founded?", choices: ["1993","1994","1995","1996"], correct: 1 },
  { question: "Who founded Amazon?", choices: ["Jeff Bezos","Jack Ma","Elon Musk","Larry Ellison"], correct: 0 },
  { question: "In what city was Amazon founded?", choices: ["Seattle","Bellevue","Redmond","Portland"], correct: 0 },
  { question: "What was Amazon's original product category?", choices: ["Electronics","Books","Music","Toys"], correct: 1 },
  { question: "In what year did Amazon launch its website to the public?", choices: ["1994","1995","1996","1997"], correct: 1 },
  { question: "Amazon went public (IPO) in what year?", choices: ["1996","1997","1998","1999"], correct: 1 },
  { question: "What was Amazon's original company name?", choices: ["Cadabra","Relentless","Bookworld","Amazon"], correct: 0 },
  { question: "Amazon Prime was launched in what year?", choices: ["2003","2004","2005","2006"], correct: 2 },
  { question: "What was Amazon Prime's original annual price?", choices: ["$49","$59","$79","$99"], correct: 2 },
  { question: "Amazon Web Services (AWS) launched publicly in what year?", choices: ["2002","2004","2006","2008"], correct: 2 },
  { question: "Who succeeded Jeff Bezos as Amazon's CEO in 2021?", choices: ["Andy Jassy","Jeff Wilke","Werner Vogels","Brian Olsavsky"], correct: 0 },
  { question: "Amazon acquired Whole Foods in what year?", choices: ["2015","2016","2017","2018"], correct: 2 },
  { question: "How much did Amazon pay for Whole Foods?", choices: ["$8.7 billion","$13.7 billion","$18.5 billion","$22 billion"], correct: 1 },
  { question: "In what year was the Amazon Kindle e-reader launched?", choices: ["2005","2007","2009","2011"], correct: 1 },
  { question: "In what year was the Amazon Echo (with Alexa) first released?", choices: ["2012","2014","2016","2018"], correct: 1 },
  { question: "Amazon acquired Zappos in what year?", choices: ["2007","2008","2009","2010"], correct: 2 },
  { question: "Amazon acquired Twitch in what year?", choices: ["2012","2013","2014","2015"], correct: 2 },
  { question: "How much did Amazon pay for Twitch?", choices: ["$485 million","$970 million","$1.5 billion","$2.5 billion"], correct: 1 },
  { question: "What is Amazon's stock ticker symbol?", choices: ["AMZN","AMAZ","AZN","AMZ"], correct: 0 },
  { question: "Amazon's headquarters is in what city?", choices: ["Bellevue","Seattle","Redmond","Tacoma"], correct: 1 },
  { question: "In what year did Amazon Prime Video debut its first original series?", choices: ["2010","2012","2013","2015"], correct: 2 },
  { question: "In what year did Amazon's market cap first cross $1 trillion?", choices: ["2017","2018","2019","2020"], correct: 1 },
  { question: "What is Amazon's logistics service for third-party sellers called?", choices: ["FBA","AWS","FBM","APX"], correct: 0 },
  { question: "The arrow on the Amazon logo points from?", choices: ["A to Z","A to M","M to N","Top to bottom"], correct: 0 },
  { question: "Amazon completed its acquisition of MGM Studios in what year?", choices: ["2020","2021","2022","2023"], correct: 1 },
  { question: "How much did Amazon pay for MGM Studios?", choices: ["$5.2 billion","$8.45 billion","$13.7 billion","$26 billion"], correct: 1 },
  { question: "Jeff Bezos's space company is called?", choices: ["SpaceX","Blue Origin","Virgin Galactic","Origin Space"], correct: 1 },
  { question: "What is Amazon's home delivery drone program called?", choices: ["Prime Air","SkyDrop","FastFly","AirShip"], correct: 0 },
  { question: "Amazon's AI voice assistant is called?", choices: ["Alexa","Cortana","Echo","Siri"], correct: 0 },
  { question: "Amazon's annual shareholder letter often references which famous earlier letter?", choices: ["1997","1999","2000","1995"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AmazonHistoryQuizSettings): AmazonHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AmazonHistoryQuizState, action: AmazonHistoryQuizAction): AmazonHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AmazonHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
