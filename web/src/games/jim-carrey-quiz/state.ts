import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface JimCarreyQuizSettings { questions: "10" | "20" | "30"; }
export interface JimCarreyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type JimCarreyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Year Ace Ventura: Pet Detective released?", choices: ["1992", "1994", "1996", "1998"], correct: 1 },
  { question: "The Mask year?", choices: ["1992", "1994", "1996", "1998"], correct: 1 },
  { question: "Dumb and Dumber co-star?", choices: ["Jeff Daniels", "Adam Sandler", "Will Ferrell", "Mike Myers"], correct: 0 },
  { question: "Ace Ventura's pet is?", choices: ["Dog", "Spike (monkey)", "Cat", "Lizard"], correct: 1 },
  { question: "Liar Liar (1997) — Carrey's character is a?", choices: ["Doctor", "Lawyer", "Teacher", "Salesman"], correct: 1 },
  { question: "The Truman Show year?", choices: ["1996", "1998", "2000", "2002"], correct: 1 },
  { question: "Director of Truman Show?", choices: ["Peter Weir", "Spike Jonze", "Michel Gondry", "Robert Zemeckis"], correct: 0 },
  { question: "Eternal Sunshine of the Spotless Mind year?", choices: ["2002", "2004", "2006", "2008"], correct: 1 },
  { question: "Eternal Sunshine director?", choices: ["Spike Jonze", "Michel Gondry", "Charlie Kaufman", "Wes Anderson"], correct: 1 },
  { question: "Eternal Sunshine co-star (Clementine)?", choices: ["Kate Winslet", "Cate Blanchett", "Naomi Watts", "Drew Barrymore"], correct: 0 },
  { question: "Bruce Almighty year?", choices: ["2001", "2003", "2005", "2007"], correct: 1 },
  { question: "Bruce Almighty God played by?", choices: ["Morgan Freeman", "Steve Carell", "Denzel Washington", "James Earl Jones"], correct: 0 },
  { question: "Who plays the news rival in Bruce Almighty?", choices: ["Steve Carell", "Will Ferrell", "Jonah Hill", "Owen Wilson"], correct: 0 },
  { question: "How the Grinch Stole Christmas (2000) director?", choices: ["Ron Howard", "Tim Burton", "Robert Zemeckis", "Brad Silberling"], correct: 0 },
  { question: "Carrey was born in?", choices: ["USA", "Canada", "UK", "Australia"], correct: 1 },
  { question: "In Living Color was Carrey's launching pad — what year?", choices: ["1989", "1990", "1991", "1993"], correct: 1 },
  { question: "Carrey's character in Cable Guy?", choices: ["Chip", "Steven", "Ernie", "Lester"], correct: 0 },
  { question: "Cable Guy directed by?", choices: ["Ben Stiller", "Tim Burton", "Peter Berg", "Joel Schumacher"], correct: 0 },
  { question: "Me, Myself & Irene year?", choices: ["1998", "2000", "2002", "2004"], correct: 1 },
  { question: "Carrey's role in Batman Forever?", choices: ["Riddler", "Penguin", "Joker", "Two-Face"], correct: 0 },
  { question: "Number 23 (2007) explores what?", choices: ["Conspiracy/numerology", "Time travel", "Spies", "War"], correct: 0 },
  { question: "Yes Man (2008) co-star?", choices: ["Zooey Deschanel", "Anne Hathaway", "Reese Witherspoon", "Drew Barrymore"], correct: 0 },
  { question: "Sonic the Hedgehog (2020) Carrey plays?", choices: ["Dr. Robotnik", "Sonic", "Tails", "Knuckles"], correct: 0 },
  { question: "Man on the Moon (1999) — Carrey plays?", choices: ["Jerry Lewis", "Andy Kaufman", "Lenny Bruce", "George Carlin"], correct: 1 },
  { question: "Director of Man on the Moon?", choices: ["Milos Forman", "Tim Burton", "Spike Lee", "David Fincher"], correct: 0 },
  { question: "Dumb and Dumber To year?", choices: ["2010", "2012", "2014", "2016"], correct: 2 },
  { question: "Carrey hosted SNL how many times?", choices: ["1", "2", "3", "4"], correct: 2 },
  { question: "First major lead film was?", choices: ["Mask", "Ace Ventura", "Dumb and Dumber", "Earth Girls Are Easy"], correct: 1 },
  { question: "Carrey's Andy Kaufman portrayal won him?", choices: ["Oscar", "Golden Globe", "Emmy", "Razzie"], correct: 1 },
  { question: "Carrey reportedly turned down which Spielberg lead?", choices: ["Cable Guy", "Truman", "Catch Me If You Can", "Forrest Gump"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: JimCarreyQuizSettings): JimCarreyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: JimCarreyQuizState, action: JimCarreyQuizAction): JimCarreyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: JimCarreyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
