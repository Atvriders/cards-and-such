import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MicrosoftHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface MicrosoftHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MicrosoftHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Microsoft was founded in what year?", choices: ["1973","1975","1977","1979"], correct: 1 },
  { question: "Microsoft's co-founders were Bill Gates and?", choices: ["Steve Ballmer","Paul Allen","Steve Jobs","Larry Ellison"], correct: 1 },
  { question: "Windows 95 was released in?", choices: ["1993","1995","1996","1997"], correct: 1 },
  { question: "Microsoft was originally based in?", choices: ["Redmond","Albuquerque","Seattle","Bellevue"], correct: 1 },
  { question: "MS-DOS was first released in?", choices: ["1980","1981","1982","1983"], correct: 1 },
  { question: "Steve Ballmer became CEO in?", choices: ["1998","2000","2002","2004"], correct: 1 },
  { question: "Satya Nadella became CEO in?", choices: ["2012","2013","2014","2015"], correct: 2 },
  { question: "Microsoft acquired LinkedIn in?", choices: ["2015","2016","2017","2018"], correct: 1 },
  { question: "Microsoft acquired GitHub in?", choices: ["2017","2018","2019","2020"], correct: 1 },
  { question: "The Xbox launched in?", choices: ["2000","2001","2002","2003"], correct: 1 },
  { question: "Internet Explorer was first released in?", choices: ["1993","1995","1996","1997"], correct: 1 },
  { question: "Bill Gates stepped down as Microsoft Chairman in?", choices: ["2014","2016","2018","2020"], correct: 3 },
  { question: "Microsoft's antitrust trial in the US peaked in?", choices: ["1998","2000","2002","2004"], correct: 1 },
  { question: "Azure was launched in?", choices: ["2008","2010","2012","2014"], correct: 1 },
  { question: "Microsoft acquired Activision Blizzard for ~$69B in?", choices: ["2022","2023","2024","2025"], correct: 1 },
  { question: "Clippy debuted in Microsoft Office in?", choices: ["1995","1997","1999","2003"], correct: 1 },
  { question: "Surface launched in?", choices: ["2010","2012","2014","2016"], correct: 1 },
  { question: "Microsoft's mascot for early Office Assistant was nicknamed?", choices: ["Jamie","Bob","Dave","BillG"], correct: 1 },
  { question: "Microsoft's mobile OS attempt was called?", choices: ["Windows Phone","Pocket PC","Both — they evolved","Lumia OS"], correct: 2 },
  { question: "Office for Mac was first released in which year?", choices: ["1985","1989","1993","1998"], correct: 0 }
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
