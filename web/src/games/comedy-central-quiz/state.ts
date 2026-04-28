import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ComedyCentralQuizSettings { questions: "10" | "20" | "30"; }
export interface ComedyCentralQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ComedyCentralQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Year Comedy Central launched?", choices: ["1989", "1991", "1993", "1995"], correct: 1 },
  { question: "South Park premiered in?", choices: ["1995", "1997", "1999", "2001"], correct: 1 },
  { question: "South Park creators?", choices: ["Parker & Stone", "Seth MacFarlane", "Mike Judge", "Bill Plympton"], correct: 0 },
  { question: "Town in South Park is in what state?", choices: ["Wyoming", "Colorado", "Montana", "Idaho"], correct: 1 },
  { question: "Daily Show original host?", choices: ["Jon Stewart", "Craig Kilborn", "Trevor Noah", "Stephen Colbert"], correct: 1 },
  { question: "Stewart became host of Daily Show in?", choices: ["1996", "1999", "2001", "2003"], correct: 1 },
  { question: "Colbert Report ran from?", choices: ["2003-2010", "2005-2014", "2007-2015", "2008-2016"], correct: 1 },
  { question: "Chappelle's Show ran for how many seasons?", choices: ["1", "2", "3", "5"], correct: 1 },
  { question: "Chappelle's Show year began?", choices: ["2001", "2003", "2005", "2007"], correct: 1 },
  { question: "Reno 911! launched in?", choices: ["2001", "2003", "2005", "2007"], correct: 1 },
  { question: "Workaholics ran from?", choices: ["2008-2015", "2011-2017", "2013-2018", "2015-2020"], correct: 1 },
  { question: "Drunk History creator?", choices: ["Derek Waters", "Lonely Island", "Funny or Die", "Tim Heidecker"], correct: 0 },
  { question: "Key & Peele ran on?", choices: ["Comedy Central", "NBC", "FX", "HBO"], correct: 0 },
  { question: "Key & Peele duo?", choices: ["Keegan-Michael Key & Jordan Peele", "Tim & Eric", "Chappelle & Mooney", "Anyone else"], correct: 0 },
  { question: "Inside Amy Schumer launch?", choices: ["2011", "2013", "2015", "2017"], correct: 1 },
  { question: "Broad City stars?", choices: ["Abbi & Ilana", "Tina & Amy", "Sarah & Maya", "Aubrey & Anna"], correct: 0 },
  { question: "Trevor Noah hosted Daily Show until?", choices: ["2020", "2022", "2023", "Still hosts"], correct: 1 },
  { question: "South Park episode released same week as event = ?", choices: ["Yes (rapid turnaround)", "No", "Sometimes", "Only specials"], correct: 0 },
  { question: "Eric Cartman's mother's name?", choices: ["Liane", "Carol", "Sharon", "Sheila"], correct: 0 },
  { question: "Kenny dies almost every?", choices: ["Episode (early seasons)", "Movie", "Season finale", "Special"], correct: 0 },
  { question: "Crank Yankers creators?", choices: ["Adam Carolla & Jimmy Kimmel", "Tim & Eric", "Chappelle", "Lonely Island"], correct: 0 },
  { question: "Strangers with Candy starred?", choices: ["Amy Sedaris", "Tina Fey", "Sarah Silverman", "Janeane Garofalo"], correct: 0 },
  { question: "Detroiters duo?", choices: ["Sam Richardson & Tim Robinson", "Key & Peele", "Mulaney & Bargatze", "Mulaney & Kroll"], correct: 0 },
  { question: "Roast of which celebrity was first network roast?", choices: ["Denis Leary", "Jerry Stiller", "Drew Carey", "Hugh Hefner"], correct: 0 },
  { question: "Last Week Tonight is on?", choices: ["Comedy Central", "HBO", "NBC", "Showtime"], correct: 1 },
  { question: "Tosh.0 host?", choices: ["Daniel Tosh", "Demetri Martin", "Doug Stanhope", "Dane Cook"], correct: 0 },
  { question: "Mind of Mencia host?", choices: ["Carlos Mencia", "Gabriel Iglesias", "George Lopez", "Joe Rogan"], correct: 0 },
  { question: "Awkwafina is Nora From Queens aired on?", choices: ["Comedy Central", "Hulu", "Netflix", "HBO Max"], correct: 0 },
  { question: "South Park episode count exceeds?", choices: ["100", "200", "300", "400"], correct: 2 },
  { question: "South Park: Bigger, Longer & Uncut year?", choices: ["1997", "1999", "2001", "2003"], correct: 1 },
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
