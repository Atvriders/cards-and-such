import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TvDramasQuizSettings { questions: "10" | "20" | "30"; }
export interface TvDramasQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TvDramasQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What 1999-2007 HBO drama features Tony Soprano?", choices: ["The Sopranos","The Wire","Boardwalk Empire","Oz"], correct: 0 },
  { question: "What 2002-08 HBO drama set in Baltimore?", choices: ["The Wire","Sopranos","Treme","Boardwalk"], correct: 0 },
  { question: "What 2008-13 AMC drama features Walter White?", choices: ["Breaking Bad","Better Call Saul","Mad Men","The Killing"], correct: 0 },
  { question: "What 2007-15 AMC drama set in 1960s ad agency?", choices: ["Mad Men","Breaking Bad","The Knick","Halt"], correct: 0 },
  { question: "Who plays Walter White?", choices: ["Bryan Cranston","Aaron Paul (Jesse)","Both","Just Cranston"], correct: 0 },
  { question: "What 2011-19 HBO fantasy series?", choices: ["Game of Thrones","True Blood","Westworld","Dark"], correct: 0 },
  { question: "What 2016-present Netflix show set in 1980s Indiana?", choices: ["Stranger Things","Dark","Ozark","Mindhunter"], correct: 0 },
  { question: "What 2016-22 BBC/Netflix drama features the Crown?", choices: ["The Crown","Victoria","The Tudors","Wolf Hall"], correct: 0 },
  { question: "What 2010-present AMC zombie drama?", choices: ["The Walking Dead","Z Nation","Black Summer","All zombie shows"], correct: 0 },
  { question: "What 2011-13 AMC drama features Don Draper?", choices: ["Mad Men (2007-15)","Breaking Bad","The Killing","Hell on Wheels"], correct: 0 },
  { question: "What 2017-23 NBC drama features Pearson family?", choices: ["This Is Us","Parenthood","The Good Doctor","New Amsterdam"], correct: 0 },
  { question: "What 1990-91 surreal mystery by David Lynch?", choices: ["Twin Peaks","Wild at Heart","Mulholland Drive","Lost Highway"], correct: 0 },
  { question: "What 2017 Twin Peaks revival was on?", choices: ["Showtime","HBO","Netflix","FX"], correct: 0 },
  { question: "What 1993-2002 X-Files-like crime drama is The X-Files?", choices: ["Yes - X-Files","Nope","Different","Same as X-Files"], correct: 0 },
  { question: "What 2010-15 AMC zombie drama features Rick Grimes?", choices: ["The Walking Dead","Fear TWD","Both","Z Nation"], correct: 0 },
  { question: "What 2002-09 medical drama by Shonda Rhimes is...?", choices: ["Grey's Anatomy started 2005","Both names possible","Just Grey's","ER (1994-09)"], correct: 2 },
  { question: "What 1994-2009 NBC medical drama?", choices: ["ER","Grey's","Chicago Hope","St Elsewhere"], correct: 0 },
  { question: "Who plays Don Draper?", choices: ["Jon Hamm","Vincent Kartheiser","Bryan Cranston","John Slattery"], correct: 0 },
  { question: "Who plays Tony Soprano?", choices: ["James Gandolfini","Edie Falco","Michael Imperioli","Tony Sirico"], correct: 0 },
  { question: "What 2005-12 Showtime drama features Dexter Morgan?", choices: ["Dexter","Weeds","Californication","Homeland"], correct: 0 },
  { question: "What 2014-present BBC/Netflix Sherlock?", choices: ["Sherlock (2010-17)","Elementary","Both","Just Sherlock"], correct: 0 },
  { question: "What 2010-13 BBC/PBS Sherlock Holmes update?", choices: ["Sherlock","Elementary","Both","Just Sherlock"], correct: 0 },
  { question: "What 2014-21 FX drama set in Atlanta?", choices: ["Atlanta","Justified","The Americans","All FX"], correct: 0 },
  { question: "What 2013-18 FX drama features married Russian spies?", choices: ["The Americans","Homeland","Counterpart","Berlin Station"], correct: 0 },
  { question: "What 2017-19 HBO drama features Westworld?", choices: ["Westworld","True Detective","Mr. Robot","Sharp Objects"], correct: 0 },
  { question: "What 2014-19 HBO anthology by Pizzolatto?", choices: ["True Detective","Big Little Lies","Sharp Objects","Watchmen"], correct: 0 },
  { question: "What 2017-23 Netflix drama set in Ozark?", choices: ["Ozark","Bloodline","Marco Polo","Hold the Dark"], correct: 0 },
  { question: "What 2011-14 HBO Western drama by HBO?", choices: ["Boardwalk Empire (1920s)","Deadwood","True Detective","Both Boardwalk and Deadwood"], correct: 3 },
  { question: "What 2010 ABC drama features survivors of an island? (Lost ended 2010 actually started 2004)", choices: ["Lost (2004-10)","FlashForward","V","Heroes"], correct: 0 },
  { question: "What 2008 AMC zombie drama beginning?", choices: ["Walking Dead started 2010 actually","2008 had different shows","The Walking Dead 2010","None"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TvDramasQuizSettings): TvDramasQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TvDramasQuizState, action: TvDramasQuizAction): TvDramasQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TvDramasQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
