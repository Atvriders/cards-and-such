import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OjTrialQuizSettings { questions: "10" | "20" | "30"; }
export interface OjTrialQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OjTrialQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The OJ Simpson criminal trial took place in?", choices: ["1993","1995","1997","1999"], correct: 1 },
  { question: "The Brentwood murders occurred in?", choices: ["1992","1994","1996","1998"], correct: 1 },
  { question: "The trial judge was?", choices: ["Lance Ito","William Rehnquist","Joe Brown","Mathis"], correct: 0 },
  { question: "The lead defense attorney was?", choices: ["Marcia Clark","Johnnie Cochran","Robert Shapiro","Christopher Darden"], correct: 1 },
  { question: "The lead prosecutor was?", choices: ["Marcia Clark","Johnnie Cochran","Christopher Darden","Robert Kardashian"], correct: 0 },
  { question: "The victims were Nicole Brown Simpson and?", choices: ["Ron Goldman","Mark Fuhrman","AC Cowlings","Kato Kaelin"], correct: 0 },
  { question: "Cochran's famous line was?", choices: ["'If it doesn't fit, you must acquit'","'Show me the money'","'Reasonable doubt'","'Beyond a doubt'"], correct: 0 },
  { question: "The infamous slow-speed chase was in a white?", choices: ["Ford Bronco","Chevy Tahoe","Toyota Camry","Cadillac"], correct: 0 },
  { question: "The Bronco was driven by?", choices: ["AC Cowlings","Robert Kardashian","Kato Kaelin","Marcus Allen"], correct: 0 },
  { question: "OJ was acquitted criminally in?", choices: ["October 1995","June 1995","October 1996","January 1996"], correct: 0 },
  { question: "OJ was found liable in a civil suit in?", choices: ["1997","1995","1998","2000"], correct: 0 },
  { question: "The civil award was approximately?", choices: ["$33.5 million","$10 million","$100 million","$1 million"], correct: 0 },
  { question: "Detective Mark Fuhrman was accused of?", choices: ["Racism / planting evidence","Lying about ID","Bribery","Drinking on duty"], correct: 0 },
  { question: "DNA evidence was a major focus of the?", choices: ["Prosecution","Defense","Both equally","Neither"], correct: 0 },
  { question: "OJ played in the NFL most famously for?", choices: ["Buffalo Bills","Dallas Cowboys","San Francisco 49ers","Bills and 49ers"], correct: 3 },
  { question: "OJ won which college football trophy?", choices: ["Heisman","Maxwell","Walter Camp","Lombardi"], correct: 0 },
  { question: "OJ played college football at?", choices: ["USC","UCLA","Stanford","Cal"], correct: 0 },
  { question: "The trial was televised, drawing huge ratings on?", choices: ["Court TV","ESPN","CNN","Court TV and CNN"], correct: 3 },
  { question: "Robert Kardashian was?", choices: ["A defense attorney/family friend","The judge","A prosecutor","A witness"], correct: 0 },
  { question: "Kato Kaelin was?", choices: ["A houseguest witness","A lawyer","A juror","A cop"], correct: 0 },
  { question: "OJ's Las Vegas robbery conviction came in?", choices: ["2008","2005","2010","2012"], correct: 0 },
  { question: "OJ was paroled in?", choices: ["2017","2015","2019","2020"], correct: 0 },
  { question: "The criminal trial lasted approximately?", choices: ["8-9 months","2 weeks","2 years","3 months"], correct: 0 },
  { question: "Christopher Darden was a?", choices: ["Prosecutor","Defense attorney","Judge","Witness"], correct: 0 },
  { question: "The 'dream team' refers to?", choices: ["The defense lawyers","The prosecution","The jury","The cops"], correct: 0 },
  { question: "F. Lee Bailey was on which side?", choices: ["Defense","Prosecution","Neither","Judge"], correct: 0 },
  { question: "Barry Scheck specialized in?", choices: ["DNA evidence challenges","Cross-examination of cops","Closing arguments","Jury selection"], correct: 0 },
  { question: "OJ Simpson died in?", choices: ["2024","2020","2022","2018"], correct: 0 },
  { question: "The civil trial held OJ liable for?", choices: ["Wrongful death","Murder","Aggravated assault","Battery only"], correct: 0 },
  { question: "Faye Resnick was?", choices: ["A friend of Nicole","A juror","A judge","A cop"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OjTrialQuizSettings): OjTrialQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OjTrialQuizState, action: OjTrialQuizAction): OjTrialQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OjTrialQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
