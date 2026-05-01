import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MicrosoftHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface MicrosoftHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MicrosoftHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what year was Microsoft founded by Bill Gates and Paul Allen?", choices: ["1973","1975","1977","1980"], correct: 1 },
  { question: "In what city was Microsoft originally founded?", choices: ["Redmond, WA","Seattle, WA","Albuquerque, NM","Boston, MA"], correct: 2 },
  { question: "What was Microsoft's first product?", choices: ["Altair BASIC","MS-DOS","Windows 1.0","Word"], correct: 0 },
  { question: "In what year did Microsoft release MS-DOS 1.0 for the IBM PC?", choices: ["1979","1980","1981","1982"], correct: 2 },
  { question: "In what year was Windows 1.0 released?", choices: ["1983","1985","1987","1989"], correct: 1 },
  { question: "In what year was Windows 95 released?", choices: ["1993","1994","1995","1996"], correct: 2 },
  { question: "In what year did Microsoft go public (IPO)?", choices: ["1984","1986","1988","1990"], correct: 1 },
  { question: "Who succeeded Bill Gates as Microsoft's CEO in 2000?", choices: ["Satya Nadella","Steve Ballmer","Paul Allen","Ray Ozzie"], correct: 1 },
  { question: "In what year did Satya Nadella become CEO of Microsoft?", choices: ["2012","2013","2014","2016"], correct: 2 },
  { question: "In what year was Microsoft Office first released?", choices: ["1989","1990","1991","1993"], correct: 1 },
  { question: "Microsoft acquired LinkedIn in what year?", choices: ["2014","2015","2016","2017"], correct: 2 },
  { question: "How much did Microsoft pay to acquire LinkedIn?", choices: ["$8.5 billion","$26.2 billion","$44 billion","$68.7 billion"], correct: 1 },
  { question: "In what year did Microsoft acquire GitHub?", choices: ["2016","2017","2018","2019"], correct: 2 },
  { question: "Microsoft acquired Skype in what year?", choices: ["2009","2010","2011","2013"], correct: 2 },
  { question: "What was the original name of Microsoft's Bing search engine?", choices: ["MSN Search","Live Search","Windows Search","BingIt"], correct: 1 },
  { question: "In what year did Microsoft launch the original Xbox?", choices: ["1999","2001","2003","2005"], correct: 1 },
  { question: "Microsoft acquired Nokia's mobile phone business in what year?", choices: ["2012","2013","2014","2016"], correct: 2 },
  { question: "In what year was Internet Explorer first released?", choices: ["1993","1995","1997","1999"], correct: 1 },
  { question: "In what year did Microsoft launch Azure (originally Windows Azure)?", choices: ["2008","2010","2012","2014"], correct: 1 },
  { question: "Microsoft's Surface tablet line launched in what year?", choices: ["2010","2012","2014","2015"], correct: 1 },
  { question: "In what year did Bill Gates step down as CEO of Microsoft?", choices: ["1998","2000","2002","2004"], correct: 1 },
  { question: "Microsoft's headquarters is located in which city?", choices: ["Seattle","Bellevue","Redmond","Tacoma"], correct: 2 },
  { question: "In what year did Microsoft announce its acquisition of Activision Blizzard?", choices: ["2020","2021","2022","2023"], correct: 2 },
  { question: "What was the value of the Microsoft-Activision Blizzard deal?", choices: ["$26 billion","$44 billion","$68.7 billion","$75 billion"], correct: 2 },
  { question: "Microsoft Teams was launched in what year?", choices: ["2015","2017","2019","2020"], correct: 1 },
  { question: "Which version of Windows introduced the Start Menu?", choices: ["Windows 3.1","Windows 95","Windows 98","Windows XP"], correct: 1 },
  { question: "In what year was Windows XP released?", choices: ["1999","2000","2001","2003"], correct: 2 },
  { question: "What was the codename for Windows 95 during development?", choices: ["Chicago","Daytona","Cairo","Memphis"], correct: 0 },
  { question: "Microsoft's investment in OpenAI was first announced in what year?", choices: ["2017","2018","2019","2020"], correct: 2 },
  { question: "In what year did Microsoft surpass a $1 trillion market cap for the first time?", choices: ["2017","2018","2019","2020"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MicrosoftHistoryQuizSettings): MicrosoftHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MicrosoftHistoryQuizState, action: MicrosoftHistoryQuizAction): MicrosoftHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MicrosoftHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
