import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ScorseseQuizSettings { questions: "10" | "20" | "30"; }
export interface ScorseseQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ScorseseQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Taxi Driver year?", choices: ["1974", "1976", "1978", "1980"], correct: 1 },
  { question: "Raging Bull year?", choices: ["1978", "1980", "1982", "1984"], correct: 1 },
  { question: "Goodfellas year?", choices: ["1988", "1990", "1992", "1994"], correct: 1 },
  { question: "Casino year?", choices: ["1993", "1995", "1997", "1999"], correct: 1 },
  { question: "Departed year?", choices: ["2004", "2006", "2008", "2010"], correct: 1 },
  { question: "Wolf of Wall Street year?", choices: ["2011", "2013", "2015", "2017"], correct: 1 },
  { question: "Irishman year?", choices: ["2017", "2019", "2021", "2023"], correct: 1 },
  { question: "Killers of the Flower Moon year?", choices: ["2021", "2022", "2023", "2024"], correct: 2 },
  { question: "Mean Streets year?", choices: ["1971", "1973", "1975", "1977"], correct: 1 },
  { question: "King of Comedy year?", choices: ["1981", "1983", "1985", "1987"], correct: 1 },
  { question: "Cape Fear (Scorsese) year?", choices: ["1989", "1991", "1993", "1995"], correct: 1 },
  { question: "Travis Bickle (Taxi Driver) played by?", choices: ["De Niro", "Pacino", "Hackman", "Stallone"], correct: 0 },
  { question: "Iconic Taxi Driver line?", choices: ["You talkin' to me?", "I'm Travis", "Get out", "I'm a man"], correct: 0 },
  { question: "Jake LaMotta in Raging Bull?", choices: ["De Niro", "Pesci", "Liotta", "Pacino"], correct: 0 },
  { question: "Goodfellas narrator?", choices: ["Henry Hill", "Jimmy Conway", "Tommy DeVito", "Paulie"], correct: 0 },
  { question: "Henry Hill played by?", choices: ["Ray Liotta", "De Niro", "Pesci", "Pacino"], correct: 0 },
  { question: "Tommy DeVito played by?", choices: ["Joe Pesci", "De Niro", "Liotta", "Sorvino"], correct: 0 },
  { question: "Departed remake of which film?", choices: ["Infernal Affairs", "Hard Boiled", "A Better Tomorrow", "Election"], correct: 0 },
  { question: "Departed Oscar?", choices: ["Best Picture", "Best Director", "Both", "Just nominated"], correct: 2 },
  { question: "Wolf of Wall Street lead?", choices: ["DiCaprio", "Damon", "Pitt", "Cruise"], correct: 0 },
  { question: "Jordan Belfort is real?", choices: ["Yes", "No", "Composite", "Inspired by"], correct: 0 },
  { question: "Scorsese & DiCaprio collaborations count by 2023?", choices: ["3", "5", "6", "7"], correct: 2 },
  { question: "Scorsese's first DiCaprio film?", choices: ["Gangs of New York", "The Aviator", "Departed", "Wolf"], correct: 0 },
  { question: "Last Temptation of Christ year?", choices: ["1986", "1988", "1990", "1992"], correct: 1 },
  { question: "Hugo year?", choices: ["2009", "2011", "2013", "2015"], correct: 1 },
  { question: "Silence year?", choices: ["2014", "2016", "2018", "2020"], correct: 1 },
  { question: "Scorsese was born in?", choices: ["NYC", "NJ", "LA", "Chicago"], correct: 0 },
  { question: "Scorsese's frequent editor?", choices: ["Thelma Schoonmaker", "Walter Murch", "Anne Coates", "Verna Fields"], correct: 0 },
  { question: "Scorsese won Best Director Oscar for?", choices: ["Departed", "Goodfellas", "Raging Bull", "Casino"], correct: 0 },
  { question: "Killers of Flower Moon Native nation focus?", choices: ["Osage", "Lakota", "Cherokee", "Apache"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ScorseseQuizSettings): ScorseseQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ScorseseQuizState, action: ScorseseQuizAction): ScorseseQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ScorseseQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
