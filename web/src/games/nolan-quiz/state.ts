import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NolanQuizSettings { questions: "10" | "20" | "30"; }
export interface NolanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NolanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Memento year?", choices: ["1998", "2000", "2002", "2004"], correct: 1 },
  { question: "Memento storytelling style?", choices: ["Reverse chronology", "Linear", "Flashbacks", "Multiple POV"], correct: 0 },
  { question: "Insomnia year?", choices: ["2000", "2002", "2004", "2006"], correct: 1 },
  { question: "Batman Begins year?", choices: ["2003", "2005", "2007", "2009"], correct: 1 },
  { question: "The Dark Knight year?", choices: ["2006", "2008", "2010", "2012"], correct: 1 },
  { question: "Joker in Dark Knight played by?", choices: ["Heath Ledger", "Jared Leto", "Joaquin Phoenix", "Jack Nicholson"], correct: 0 },
  { question: "The Prestige year?", choices: ["2004", "2006", "2008", "2010"], correct: 1 },
  { question: "Inception year?", choices: ["2008", "2010", "2012", "2014"], correct: 1 },
  { question: "Inception lead?", choices: ["DiCaprio", "Bale", "McConaughey", "Pattinson"], correct: 0 },
  { question: "Dark Knight Rises year?", choices: ["2010", "2012", "2014", "2016"], correct: 1 },
  { question: "Bane in DKR played by?", choices: ["Tom Hardy", "Joaquin Phoenix", "Idris Elba", "Michael Fassbender"], correct: 0 },
  { question: "Interstellar year?", choices: ["2012", "2014", "2016", "2018"], correct: 1 },
  { question: "Interstellar lead?", choices: ["McConaughey", "Damon", "Pitt", "Affleck"], correct: 0 },
  { question: "Dunkirk year?", choices: ["2015", "2017", "2019", "2021"], correct: 1 },
  { question: "Dunkirk's three perspectives?", choices: ["Air, Land, Sea", "Day, Week, Hour", "Past, Present, Future", "Soldier, Pilot, Civilian"], correct: 0 },
  { question: "Tenet year?", choices: ["2018", "2020", "2022", "2024"], correct: 1 },
  { question: "Oppenheimer year?", choices: ["2021", "2022", "2023", "2024"], correct: 2 },
  { question: "Oppenheimer lead?", choices: ["Cillian Murphy", "Tom Hardy", "Matt Damon", "Robert Downey Jr."], correct: 0 },
  { question: "Oppenheimer won Best Picture?", choices: ["Yes", "No", "Lost to Barbie", "Was nominated only"], correct: 0 },
  { question: "Nolan was born in?", choices: ["UK", "USA", "France", "Australia"], correct: 0 },
  { question: "Nolan's brother is?", choices: ["Jonathan (writer)", "Producer", "Actor", "Composer"], correct: 0 },
  { question: "Nolan's wife & producer?", choices: ["Emma Thomas", "Lynda Obst", "Kathleen Kennedy", "Donna Gigliotti"], correct: 0 },
  { question: "Nolan's first feature?", choices: ["Following", "Memento", "Insomnia", "Batman Begins"], correct: 0 },
  { question: "Following year?", choices: ["1996", "1998", "2000", "2002"], correct: 1 },
  { question: "Nolan won Best Director Oscar for?", choices: ["Inception", "Dunkirk", "Oppenheimer", "Has not"], correct: 2 },
  { question: "Inception's totem of Cobb?", choices: ["Spinning top", "Coin", "Loaded die", "Chess piece"], correct: 0 },
  { question: "Interstellar villain (sort of)?", choices: ["Mann (Matt Damon)", "Cooper", "Brand", "Romilly"], correct: 0 },
  { question: "Composer for Nolan's recent films?", choices: ["Ludwig Göransson (Tenet, Oppenheimer)", "Hans Zimmer always", "John Williams", "Just both"], correct: 0 },
  { question: "Hans Zimmer scored which Nolan films?", choices: ["Batman, Inception, Interstellar, Dunkirk", "All Nolan", "Just Batman", "Memento+Insomnia"], correct: 0 },
  { question: "Nolan often shoots in?", choices: ["IMAX", "Digital", "Both", "Steadicam"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NolanQuizSettings): NolanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NolanQuizState, action: NolanQuizAction): NolanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NolanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
