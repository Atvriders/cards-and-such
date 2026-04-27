import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OscarFilmsQuizSettings { questions: "10" | "20" | "30"; }
export interface OscarFilmsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OscarFilmsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which film won Best Picture in 1994?", choices: ["Pulp Fiction", "Forrest Gump", "The Shawshank Redemption", "Quiz Show"], correct: 1 },
  { question: "Who directed 'Schindler's List' (1993 Best Picture)?", choices: ["Martin Scorsese", "Steven Spielberg", "Francis Ford Coppola", "Robert Zemeckis"], correct: 1 },
  { question: "'Titanic' won how many Oscars in 1997?", choices: ["7", "9", "11", "13"], correct: 2 },
  { question: "Which actor won Best Actor for 'Lincoln' (2012)?", choices: ["Daniel Day-Lewis", "Joaquin Phoenix", "Bradley Cooper", "Hugh Jackman"], correct: 0 },
  { question: "'Parasite' (2019) was directed by?", choices: ["Park Chan-wook", "Bong Joon-ho", "Hirokazu Kore-eda", "Lee Chang-dong"], correct: 1 },
  { question: "Which film won Best Picture in 1972?", choices: ["The French Connection", "The Godfather", "Cabaret", "Deliverance"], correct: 1 },
  { question: "Who won Best Actress for 'La La Land' (2016)?", choices: ["Natalie Portman", "Meryl Streep", "Emma Stone", "Isabelle Huppert"], correct: 2 },
  { question: "'No Country for Old Men' was directed by?", choices: ["The Coen Brothers", "Paul Thomas Anderson", "David Fincher", "Quentin Tarantino"], correct: 0 },
  { question: "Which film won Best Picture in 2008?", choices: ["Slumdog Millionaire", "Milk", "The Reader", "Frost/Nixon"], correct: 0 },
  { question: "Who directed 'The Departed' (2006 Best Picture)?", choices: ["Spike Lee", "Martin Scorsese", "Clint Eastwood", "Ron Howard"], correct: 1 },
  { question: "'Moonlight' upset which film for Best Picture in 2016?", choices: ["Manchester by the Sea", "La La Land", "Hidden Figures", "Lion"], correct: 1 },
  { question: "Which actress won Best Actress for 'Black Swan' (2010)?", choices: ["Natalie Portman", "Annette Bening", "Nicole Kidman", "Michelle Williams"], correct: 0 },
  { question: "Best Picture 2003: 'The Lord of the Rings: ___'?", choices: ["The Fellowship of the Ring", "The Two Towers", "The Return of the King", "An Unexpected Journey"], correct: 2 },
  { question: "Who directed 'Birdman' (2014 Best Picture)?", choices: ["Alejandro González Iñárritu", "Alfonso Cuarón", "Guillermo del Toro", "Damien Chazelle"], correct: 0 },
  { question: "'12 Years a Slave' (2013) starred?", choices: ["Denzel Washington", "Chiwetel Ejiofor", "Idris Elba", "Forest Whitaker"], correct: 1 },
  { question: "Which film won Best Picture in 2000?", choices: ["Gladiator", "Erin Brockovich", "Traffic", "Crouching Tiger, Hidden Dragon"], correct: 0 },
  { question: "Who won Best Director for 'Life of Pi' (2012)?", choices: ["Ang Lee", "Steven Spielberg", "Michael Haneke", "David O. Russell"], correct: 0 },
  { question: "'The Hurt Locker' (2009) was directed by?", choices: ["Kathryn Bigelow", "James Cameron", "Quentin Tarantino", "Lee Daniels"], correct: 0 },
  { question: "Which actor won Best Actor for 'There Will Be Blood'?", choices: ["Daniel Day-Lewis", "George Clooney", "Johnny Depp", "Tommy Lee Jones"], correct: 0 },
  { question: "Best Picture 2018?", choices: ["Roma", "Green Book", "BlacKkKlansman", "A Star Is Born"], correct: 1 },
  { question: "'Nomadland' (2020 Best Picture) was directed by?", choices: ["Chloé Zhao", "Emerald Fennell", "Lee Isaac Chung", "David Fincher"], correct: 0 },
  { question: "'CODA' (2021 Best Picture) is set in what state?", choices: ["Maine", "Massachusetts", "Rhode Island", "New Hampshire"], correct: 1 },
  { question: "'Everything Everywhere All at Once' (2022) starred?", choices: ["Lucy Liu", "Michelle Yeoh", "Sandra Oh", "Constance Wu"], correct: 1 },
  { question: "'Oppenheimer' (2023 Best Picture) was directed by?", choices: ["Christopher Nolan", "Denis Villeneuve", "Greta Gerwig", "Ridley Scott"], correct: 0 },
  { question: "How many Best Director Oscars did John Ford win?", choices: ["2", "3", "4", "5"], correct: 2 },
  { question: "Which film won Best Picture in 1939?", choices: ["The Wizard of Oz", "Gone with the Wind", "Mr. Smith Goes to Washington", "Stagecoach"], correct: 1 },
  { question: "'Casablanca' won Best Picture in?", choices: ["1942", "1943", "1944", "1945"], correct: 1 },
  { question: "Best Picture 1990?", choices: ["Goodfellas", "Dances with Wolves", "Awakenings", "Ghost"], correct: 1 },
  { question: "Who won Best Actor for 'The Pianist' (2002)?", choices: ["Adrien Brody", "Daniel Day-Lewis", "Jack Nicholson", "Michael Caine"], correct: 0 },
  { question: "'Spotlight' (2015) was about which institution?", choices: ["The Vatican", "Boston Globe", "Catholic Church abuse", "Police corruption"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OscarFilmsQuizSettings): OscarFilmsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OscarFilmsQuizState, action: OscarFilmsQuizAction): OscarFilmsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OscarFilmsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
