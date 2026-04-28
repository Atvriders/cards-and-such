import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SnlQuizSettings { questions: "10" | "20" | "30"; }
export interface SnlQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SnlQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What year did Saturday Night Live first air?", choices: ["1972", "1975", "1978", "1981"], correct: 1 },
  { question: "Who created Saturday Night Live?", choices: ["Lorne Michaels", "Dick Ebersol", "Brandon Tartikoff", "Steve Allen"], correct: 0 },
  { question: "Which cast member popularized the 'Wayne's World' sketch?", choices: ["Adam Sandler", "Mike Myers", "Dana Carvey", "Chris Farley"], correct: 1 },
  { question: "Garth from Wayne's World was played by?", choices: ["Dana Carvey", "Mike Myers", "Phil Hartman", "Chris Farley"], correct: 0 },
  { question: "Who played 'Matt Foley, motivational speaker'?", choices: ["Chris Farley", "John Belushi", "Will Ferrell", "Adam Sandler"], correct: 0 },
  { question: "Which cast member is famous for 'More Cowbell'?", choices: ["Will Ferrell", "Jimmy Fallon", "Tracy Morgan", "Horatio Sanz"], correct: 0 },
  { question: "Tina Fey was head writer for SNL starting in?", choices: ["1995", "1999", "2002", "2005"], correct: 1 },
  { question: "The Coneheads featured which cast member as the patriarch?", choices: ["Dan Aykroyd", "John Belushi", "Bill Murray", "Chevy Chase"], correct: 0 },
  { question: "Which 'Weekend Update' anchor said 'I'm Chevy Chase, and you're not'?", choices: ["Chevy Chase", "Dennis Miller", "Norm Macdonald", "Jane Curtin"], correct: 0 },
  { question: "Eddie Murphy joined SNL in what year?", choices: ["1978", "1980", "1983", "1985"], correct: 1 },
  { question: "Who played 'Mr. Robinson's Neighborhood'?", choices: ["Eddie Murphy", "Tracy Morgan", "Damon Wayans", "Chris Rock"], correct: 0 },
  { question: "Which cast member created 'The Church Lady'?", choices: ["Mike Myers", "Dana Carvey", "Phil Hartman", "Jon Lovitz"], correct: 1 },
  { question: "Who played the original Blues Brother 'Jake'?", choices: ["John Belushi", "Dan Aykroyd", "Bill Murray", "Chevy Chase"], correct: 0 },
  { question: "Will Ferrell's iconic cheerleader sketches partnered him with?", choices: ["Cheri Oteri", "Molly Shannon", "Ana Gasteyer", "Tina Fey"], correct: 0 },
  { question: "Kristen Wiig's Target Lady was a recurring sketch in which decades?", choices: ["1990s", "2000s", "2010s", "Both 2000s and 2010s"], correct: 3 },
  { question: "Which host has hosted SNL the most times?", choices: ["Alec Baldwin", "Steve Martin", "John Goodman", "Tom Hanks"], correct: 0 },
  { question: "Andy Samberg co-founded which digital comedy group?", choices: ["The Lonely Island", "Tim and Eric", "Funny or Die", "College Humor"], correct: 0 },
  { question: "Which musical guest was famously banned after ripping a photo of the Pope?", choices: ["Madonna", "Sinéad O'Connor", "Pearl Jam", "Cypress Hill"], correct: 1 },
  { question: "Who played Sarah Palin in 2008?", choices: ["Tina Fey", "Amy Poehler", "Kristen Wiig", "Maya Rudolph"], correct: 0 },
  { question: "Maya Rudolph is famous for impressions of?", choices: ["Beyoncé", "Oprah", "Kamala Harris", "All of these"], correct: 3 },
  { question: "Which Weekend Update co-anchor pair started in 2014?", choices: ["Tina/Amy", "Jost/Che", "Fey/Poehler", "Meyers/Strong"], correct: 1 },
  { question: "What does the cold open traditionally end with?", choices: ["A monologue", "'Live from New York…'", "A song", "A sketch"], correct: 1 },
  { question: "Which cast member played 'Stefon'?", choices: ["Bill Hader", "Fred Armisen", "Andy Samberg", "Bobby Moynihan"], correct: 0 },
  { question: "Mister Bill was created by?", choices: ["Walter Williams", "Lorne Michaels", "Al Franken", "Tom Davis"], correct: 0 },
  { question: "Which cast member starred in 'Bridesmaids' (2011)?", choices: ["Kristen Wiig", "Maya Rudolph", "Both", "Tina Fey"], correct: 2 },
  { question: "Lonely Island's 'Lazy Sunday' parodied a trip to see?", choices: ["Star Wars", "Narnia", "Lord of the Rings", "Harry Potter"], correct: 1 },
  { question: "Pete Davidson joined SNL in?", choices: ["2010", "2014", "2016", "2018"], correct: 1 },
  { question: "Which sketch features 'Debbie Downer'?", choices: ["Rachel Dratch", "Cheri Oteri", "Molly Shannon", "Amy Poehler"], correct: 0 },
  { question: "Belushi's 'Samurai' sketches featured what occupations?", choices: ["Tailor, Deli, Hotel", "Just samurai", "Doctor", "Lawyer"], correct: 0 },
  { question: "Which famous comedian was fired after one season in 1980-81?", choices: ["Chris Rock", "Charles Rocket", "Eddie Murphy", "Joe Piscopo"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SnlQuizSettings): SnlQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SnlQuizState, action: SnlQuizAction): SnlQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SnlQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
