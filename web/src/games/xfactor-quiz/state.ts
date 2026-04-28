import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface XfactorQuizSettings { questions: "10" | "20" | "30"; }
export interface XfactorQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type XfactorQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The X Factor UK first aired in what year?", choices: ["2002","2004","2005","2007"], correct: 1 },
  { question: "Which boy band was formed on X Factor UK 2010?", choices: ["The Wanted","Take That","One Direction","JLS"], correct: 2 },
  { question: "Little Mix won X Factor UK in?", choices: ["2010","2011","2012","2013"], correct: 1 },
  { question: "Leona Lewis won X Factor UK in?", choices: ["2005","2006","2007","2008"], correct: 1 },
  { question: "The X Factor was created by which mogul?", choices: ["Louis Walsh","Simon Cowell","Sharon Osbourne","Cheryl Cole"], correct: 1 },
  { question: "X Factor USA aired from?", choices: ["2010-2012","2011-2013","2012-2014","2013-2015"], correct: 1 },
  { question: "Which X Factor USA winner was just 14 years old?", choices: ["Melanie Amaro","Tate Stevens","Carlito Olivero","Demi Lovato"], correct: 0 },
  { question: "The judging round in singers' bedrooms was called?", choices: ["Boot Camp","Judges' Houses","Six Chair Challenge","Live Lounge"], correct: 1 },
  { question: "Cheryl was a judge on X Factor UK starting in?", choices: ["2007","2008","2009","2010"], correct: 1 },
  { question: "James Arthur won X Factor UK in?", choices: ["2011","2012","2013","2014"], correct: 1 },
  { question: "What is the Six Chair Challenge round?", choices: ["6 contestants compete for 6 spots","Judges sit in 6 chairs","6-judge panel","Audience picks 6"], correct: 0 },
  { question: "Olly Murs placed which on X Factor UK 2009?", choices: ["1st","2nd","3rd","4th"], correct: 1 },
  { question: "Which year did X Factor UK end its main run?", choices: ["2017","2018","2019","2020"], correct: 1 },
  { question: "The show is broadcast in the UK on?", choices: ["BBC","ITV","Channel 4","Sky"], correct: 1 },
  { question: "Sam Bailey, a prison officer, won X Factor UK in?", choices: ["2012","2013","2014","2015"], correct: 1 },
  { question: "Steve Brookstein won the first X Factor UK in?", choices: ["2003","2004","2005","2006"], correct: 1 },
  { question: "Which British group won X Factor 2008?", choices: ["JLS","Diversity","Same Difference","Alexandra Burke"], correct: 3 },
  { question: "Demi Lovato joined X Factor USA in season?", choices: ["1","2","3","Both 2 and 3"], correct: 3 },
  { question: "Wagner Carrilho was a UK X Factor novelty act in?", choices: ["2009","2010","2011","2012"], correct: 1 },
  { question: "Louis Tomlinson is a former contestant who became which kind of judge?", choices: ["X Factor UK","X Factor USA","America's Got Talent","The Voice"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: XfactorQuizSettings): XfactorQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: XfactorQuizState, action: XfactorQuizAction): XfactorQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: XfactorQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
