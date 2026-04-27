import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SouthParkSettings { questions: "10" | "20" | "30"; }
export interface SouthParkState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SouthParkAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "South Park creators?", choices: ["Parker & Stone","MacFarlane","Groening","Judge"], correct: 0 },
  { question: "South Park aired first in?", choices: ["1997","1999","1995","2001"], correct: 0 },
  { question: "Set in which state?", choices: ["Colorado","Wyoming","Utah","Nebraska"], correct: 0 },
  { question: "Main 4 includes?", choices: ["Stan, Kyle, Cartman, Kenny","Stan, Tweek, Craig, Token","Stan, Kyle, Tweek, Kenny","Stan, Kyle, Cartman, Butters"], correct: 0 },
  { question: "Cartman's catchphrase?", choices: ["Respect my authoritah","I'm sorry","Hi","Yo"], correct: 0 },
  { question: "Kenny's catchphrase?", choices: ["Mphmpfm","Hi","Yo","Bye"], correct: 0 },
  { question: "Kyle is which religion?", choices: ["Jewish","Catholic","Muslim","Atheist"], correct: 0 },
  { question: "Mr. Garrison is a?", choices: ["Teacher","Cop","Mayor","Chef"], correct: 0 },
  { question: "Chef voice actor?", choices: ["Isaac Hayes","Trey Parker","Matt Stone","Cartman"], correct: 0 },
  { question: "Towelie loves?", choices: ["Weed","Beer","Coffee","Soda"], correct: 0 },
  { question: "Butters' last name?", choices: ["Stotch","Smith","Jones","Black"], correct: 0 },
  { question: "Timmy's catchphrase?", choices: ["TIMMY!","Hi!","Yo!","Wow!"], correct: 0 },
  { question: "Big Gay Al is?", choices: ["Boy Scout leader","Mayor","Teacher","Chef"], correct: 0 },
  { question: "Eric Cartman is famously?", choices: ["Greedy/villain","Kind","Honest","Quiet"], correct: 0 },
  { question: "Kenny dies famously?", choices: ["Often","Never","Once","Twice"], correct: 0 },
  { question: "Stan's family pet?", choices: ["Sparky","Dog","Cat","Buddy"], correct: 0 },
  { question: "Mayor of South Park?", choices: ["Mayor McDaniels","Quimby","Smith","Wendy"], correct: 0 },
  { question: "Wendy is whose girlfriend?", choices: ["Stan","Kyle","Cartman","Kenny"], correct: 0 },
  { question: "Show network?", choices: ["Comedy Central","FOX","NBC","ABC"], correct: 0 },
  { question: "Movie title?", choices: ["Bigger Longer & Uncut","The Movie","Adventure","Original"], correct: 0 },
  { question: "Manbearpig is a parody of?", choices: ["Climate change","Aliens","Politics","Religion"], correct: 0 },
  { question: "Imaginationland sees what destroyed?", choices: ["Imagination","Town","School","Hospital"], correct: 0 },
  { question: "Tweek is associated with?", choices: ["Coffee/anxiety","Football","Math","Music"], correct: 0 },
  { question: "Kenny's parka color?", choices: ["Orange","Red","Blue","Green"], correct: 0 },
  { question: "Kyle's hat is?", choices: ["Green","Red","Blue","Yellow"], correct: 0 },
  { question: "Stan's hat is?", choices: ["Red and Blue","Green","Yellow","Black"], correct: 0 },
  { question: "Show is famous for?", choices: ["Quick turnaround","Long production","No animation","Live action"], correct: 0 },
  { question: "Coon and Friends is?", choices: ["Cartman superhero group","Show","Game","Movie"], correct: 0 },
  { question: "Token is wealthy?", choices: ["Yes","No","Average","Poor"], correct: 0 },
  { question: "Show season count exceeds?", choices: ["20","10","5","30"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SouthParkSettings): SouthParkState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SouthParkState, action: SouthParkAction): SouthParkState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SouthParkState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
