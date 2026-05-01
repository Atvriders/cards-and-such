import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GoogleHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface GoogleHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GoogleHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what year was Google founded?", choices: ["1996","1997","1998","1999"], correct: 2 },
  { question: "Who co-founded Google with Larry Page?", choices: ["Eric Schmidt","Sundar Pichai","Sergey Brin","Marissa Mayer"], correct: 2 },
  { question: "At what university did Larry Page and Sergey Brin meet?", choices: ["MIT","Stanford","Berkeley","Harvard"], correct: 1 },
  { question: "What was Google's original name as a research project?", choices: ["BackRub","PageRank","SearchIt","Stanford Search"], correct: 0 },
  { question: "In what year did Google IPO?", choices: ["2002","2003","2004","2005"], correct: 2 },
  { question: "Who became Google's CEO in 2001 (the 'adult supervision' era)?", choices: ["Eric Schmidt","Sundar Pichai","Larry Page","Tim Armstrong"], correct: 0 },
  { question: "In what year was Gmail launched (publicly announced)?", choices: ["2002","2003","2004","2005"], correct: 2 },
  { question: "Google acquired YouTube in what year?", choices: ["2004","2005","2006","2007"], correct: 2 },
  { question: "How much did Google pay to acquire YouTube?", choices: ["$1.65 billion","$3.1 billion","$650 million","$12.5 billion"], correct: 0 },
  { question: "Google acquired Android Inc. in what year?", choices: ["2003","2004","2005","2007"], correct: 2 },
  { question: "In what year was the first Android phone (HTC Dream/G1) released?", choices: ["2007","2008","2009","2010"], correct: 1 },
  { question: "In what year was Google Chrome first released?", choices: ["2006","2007","2008","2009"], correct: 2 },
  { question: "In what year was Google Maps launched?", choices: ["2003","2004","2005","2006"], correct: 2 },
  { question: "Google's parent holding company, formed in 2015, is called?", choices: ["Alphabet","Google Holdings","X Corp","Sundar Inc."], correct: 0 },
  { question: "Who became CEO of Google in 2015 when Alphabet was formed?", choices: ["Larry Page","Sergey Brin","Sundar Pichai","Ruth Porat"], correct: 2 },
  { question: "Google acquired DoubleClick in what year?", choices: ["2006","2007","2008","2010"], correct: 1 },
  { question: "What did Google pay for DoubleClick?", choices: ["$1.65 billion","$3.1 billion","$5 billion","$12.5 billion"], correct: 1 },
  { question: "Google's headquarters is known as the?", choices: ["Googleplex","Google Park","Search HQ","Mountain View Campus"], correct: 0 },
  { question: "In what city is Google headquartered?", choices: ["Palo Alto","Mountain View","San Jose","Cupertino"], correct: 1 },
  { question: "In what year did Google launch Google+?", choices: ["2009","2010","2011","2012"], correct: 2 },
  { question: "In what year was Google+ shut down for consumers?", choices: ["2017","2018","2019","2020"], correct: 2 },
  { question: "Google's self-driving car project, started in 2009, became known as?", choices: ["Waymo","Cruise","Argo","Aurora"], correct: 0 },
  { question: "Google acquired Motorola Mobility in what year?", choices: ["2010","2011","2012","2013"], correct: 1 },
  { question: "Google's AI lab, acquired in 2014, is called?", choices: ["DeepMind","OpenAI","Brain","Anthropic"], correct: 0 },
  { question: "In what year did Google launch the Pixel smartphone line?", choices: ["2014","2015","2016","2017"], correct: 2 },
  { question: "Google's original mission statement begins with which phrase?", choices: ["'To organize the world's information'","'Don't be evil'","'Search and find'","'Make information free'"], correct: 0 },
  { question: "What was Google's famous unofficial motto until 2018?", choices: ["'Think different'","'Don't be evil'","'Move fast'","'Just Google it'"], correct: 1 },
  { question: "In what year did Google acquire Writely (which became Google Docs)?", choices: ["2004","2005","2006","2007"], correct: 2 },
  { question: "Google launched Google Cloud Platform in what year?", choices: ["2006","2008","2010","2012"], correct: 1 },
  { question: "Google's Bard AI chatbot was first announced in what year?", choices: ["2021","2022","2023","2024"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GoogleHistoryQuizSettings): GoogleHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GoogleHistoryQuizState, action: GoogleHistoryQuizAction): GoogleHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GoogleHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
