import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ComedyCentralQuizSettings { questions: "10" | "20" | "30"; }
export interface ComedyCentralQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ComedyCentralQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What year did Comedy Central launch?", choices: ["1989", "1991", "1993", "1995"], correct: 1 },
  { question: "Comedy Central was formed by merging which two channels?", choices: ["The Comedy Channel and HA!", "MTV and VH1", "USA and TBS", "TBS and TNT"], correct: 0 },
  { question: "Who hosted 'The Daily Show' from 1999 to 2015?", choices: ["Jon Stewart", "Stephen Colbert", "Trevor Noah", "Craig Kilborn"], correct: 0 },
  { question: "'South Park' premiered on Comedy Central in what year?", choices: ["1995", "1997", "1999", "2001"], correct: 1 },
  { question: "Who created 'South Park'?", choices: ["Trey Parker and Matt Stone", "Mike Judge", "Seth MacFarlane", "Adam McKay"], correct: 0 },
  { question: "Stephen Colbert hosted which Daily Show spinoff (2005-2014)?", choices: ["The Colbert Report", "@midnight", "The Half Hour", "Tosh.0"], correct: 0 },
  { question: "Who hosts 'The Daily Show' starting in 2015?", choices: ["Trevor Noah", "Stephen Colbert", "Hasan Minhaj", "Samantha Bee"], correct: 0 },
  { question: "'Chappelle's Show' aired on Comedy Central from?", choices: ["2003-2006", "2000-2003", "2005-2008", "2002-2005"], correct: 0 },
  { question: "'Drawn Together' (2004) was Comedy Central's first?", choices: ["Adult animated reality show parody", "Drama", "Sitcom", "News show"], correct: 0 },
  { question: "Which long-running roast series is on Comedy Central?", choices: ["Comedy Central Roast", "Comedy Central Tonight", "Just Roast", "Burn Notice"], correct: 0 },
  { question: "'Reno 911!' debuted on Comedy Central in?", choices: ["2003", "2005", "2007", "2009"], correct: 0 },
  { question: "Who created 'Workaholics'?", choices: ["Blake Anderson, Adam DeVine, Anders Holm, Kyle Newacheck", "Matt Stone", "Trey Parker", "Mike Judge"], correct: 0 },
  { question: "What animated sitcom from Mike Judge aired on Comedy Central?", choices: ["Beavis and Butt-Head (some seasons)", "King of the Hill", "Family Guy", "Bob's Burgers"], correct: 0 },
  { question: "Comedy Central's Ugly Americans was about?", choices: ["Monsters at a social services agency", "Roast", "Crime", "Hospital"], correct: 0 },
  { question: "'Inside Amy Schumer' premiered in what year?", choices: ["2011", "2013", "2015", "2017"], correct: 1 },
  { question: "'Tosh.0' was hosted by?", choices: ["Daniel Tosh", "Bill Burr", "Bo Burnham", "Anthony Jeselnik"], correct: 0 },
  { question: "What 'Key & Peele' Comedy Central show ran from?", choices: ["2012-2015", "2010-2013", "2014-2017", "2009-2012"], correct: 0 },
  { question: "Comedy Central is owned by?", choices: ["Paramount Global", "Comcast", "Disney", "Warner Bros."], correct: 0 },
  { question: "'Broad City' was on Comedy Central from?", choices: ["2014-2019", "2012-2017", "2016-2020", "2010-2015"], correct: 0 },
  { question: "Who created 'Broad City'?", choices: ["Abbi Jacobson and Ilana Glazer", "Amy Schumer", "Tina Fey", "Sarah Silverman"], correct: 0 },
  { question: "'The Sarah Silverman Program' aired on Comedy Central from?", choices: ["2007-2010", "2005-2008", "2009-2012", "2003-2006"], correct: 0 },
  { question: "Which Comedy Central show was set in Reno's police force?", choices: ["Reno 911!", "Workaholics", "Tosh.0", "Drunk History"], correct: 0 },
  { question: "'Drunk History' originated on which platform before Comedy Central?", choices: ["Funny or Die", "YouTube", "Vimeo", "MTV"], correct: 0 },
  { question: "South Park's main four kids live in what state?", choices: ["Colorado", "Wyoming", "Utah", "Idaho"], correct: 0 },
  { question: "Who voices Cartman on South Park?", choices: ["Trey Parker", "Matt Stone", "Isaac Hayes", "Mary Kay Bergman"], correct: 0 },
  { question: "'Mind of Mencia' was hosted by?", choices: ["Carlos Mencia", "Greg Giraldo", "Lewis Black", "Dane Cook"], correct: 0 },
  { question: "'Crank Yankers' uses what type of comedy?", choices: ["Puppets making prank calls", "Stand-up", "Sketches", "Game show"], correct: 0 },
  { question: "'@midnight with Chris Hardwick' was a what?", choices: ["Comedy panel game show", "Late-night talk show", "Sketch", "News parody"], correct: 0 },
  { question: "What stand-up showcase aired half-hour specials?", choices: ["Comedy Central Presents", "Comedy Tonight", "Stand-up Spotlight", "Comedy Hour"], correct: 0 },
  { question: "South Park has won how many Primetime Emmys?", choices: ["Multiple (5+)", "0", "1", "2"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ComedyCentralQuizSettings): ComedyCentralQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ComedyCentralQuizState, action: ComedyCentralQuizAction): ComedyCentralQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ComedyCentralQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
