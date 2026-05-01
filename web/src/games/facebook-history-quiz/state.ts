import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FacebookHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface FacebookHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FacebookHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what year was Facebook founded?", choices: ["2002","2003","2004","2005"], correct: 2 },
  { question: "At what university was Facebook originally launched?", choices: ["MIT","Yale","Harvard","Princeton"], correct: 2 },
  { question: "Which Facebook co-founder later became its CEO?", choices: ["Mark Zuckerberg","Eduardo Saverin","Dustin Moskovitz","Chris Hughes"], correct: 0 },
  { question: "What was Facebook's original name?", choices: ["TheFacebook","Facemash","CollegeBook","HarvardConnect"], correct: 0 },
  { question: "In what year did Facebook open to anyone aged 13+ (general public)?", choices: ["2004","2005","2006","2007"], correct: 2 },
  { question: "In what year did Facebook IPO?", choices: ["2010","2011","2012","2013"], correct: 2 },
  { question: "Facebook acquired Instagram in what year?", choices: ["2010","2011","2012","2013"], correct: 2 },
  { question: "How much did Facebook pay for Instagram (cash and stock)?", choices: ["$500 million","$1 billion","$2 billion","$5 billion"], correct: 1 },
  { question: "Facebook acquired WhatsApp in what year?", choices: ["2012","2013","2014","2015"], correct: 2 },
  { question: "What did Facebook pay to acquire WhatsApp?", choices: ["$3 billion","$10 billion","$19 billion","$22 billion"], correct: 3 },
  { question: "Facebook acquired Oculus VR in what year?", choices: ["2013","2014","2015","2016"], correct: 1 },
  { question: "Facebook paid how much for Oculus?", choices: ["$1 billion","$2 billion","$3 billion","$5 billion"], correct: 1 },
  { question: "In what year did Facebook rebrand its parent company to Meta?", choices: ["2019","2020","2021","2022"], correct: 2 },
  { question: "Who was the COO of Facebook from 2008 until stepping down in 2022?", choices: ["Marissa Mayer","Sheryl Sandberg","Susan Wojcicki","Ginni Rometty"], correct: 1 },
  { question: "What was the name of Mark Zuckerberg's predecessor site at Harvard?", choices: ["Facemash","HarvardBook","Connect","SocialNet"], correct: 0 },
  { question: "Where is Meta's headquarters located?", choices: ["Palo Alto","Menlo Park","Mountain View","San Francisco"], correct: 1 },
  { question: "In what year did Facebook reach 1 billion monthly active users?", choices: ["2010","2011","2012","2013"], correct: 2 },
  { question: "Facebook's News Feed feature launched in what year?", choices: ["2005","2006","2007","2008"], correct: 1 },
  { question: "What is the stock ticker symbol Meta Platforms uses today?", choices: ["FB","META","MTA","FBOK"], correct: 1 },
  { question: "Facebook's Like button was introduced in what year?", choices: ["2007","2008","2009","2010"], correct: 2 },
  { question: "The 2010 film about Facebook's founding was titled?", choices: ["The Social Network","Friends Online","Zuckerberg","The Network"], correct: 0 },
  { question: "Who played Mark Zuckerberg in 'The Social Network'?", choices: ["Andrew Garfield","Jesse Eisenberg","Justin Timberlake","Armie Hammer"], correct: 1 },
  { question: "The Cambridge Analytica scandal broke into headlines in what year?", choices: ["2016","2017","2018","2019"], correct: 2 },
  { question: "Facebook Marketplace was launched in what year?", choices: ["2014","2015","2016","2017"], correct: 2 },
  { question: "Facebook acquired FriendFeed in what year?", choices: ["2008","2009","2010","2011"], correct: 1 },
  { question: "The Winklevoss twins sued Facebook in connection with which earlier site?", choices: ["ConnectU","HarvardLink","SocialU","Friendster"], correct: 0 },
  { question: "Facebook's first office was in which California city?", choices: ["San Francisco","Palo Alto","Menlo Park","Mountain View"], correct: 1 },
  { question: "Threads, Meta's text-based app rivaling Twitter, launched in what year?", choices: ["2021","2022","2023","2024"], correct: 2 },
  { question: "Meta's Reality Labs division focuses primarily on?", choices: ["AI research","VR/AR and metaverse","Cloud computing","Self-driving cars"], correct: 1 },
  { question: "In what year did Facebook reach 2 billion monthly active users?", choices: ["2015","2016","2017","2018"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FacebookHistoryQuizSettings): FacebookHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FacebookHistoryQuizState, action: FacebookHistoryQuizAction): FacebookHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FacebookHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
