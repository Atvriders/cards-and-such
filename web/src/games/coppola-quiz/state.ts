import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CoppolaQuizSettings { questions: "10" | "20" | "30"; }
export interface CoppolaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CoppolaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Godfather year?", choices: ["1970", "1972", "1974", "1976"], correct: 1 },
  { question: "Godfather Part II year?", choices: ["1972", "1974", "1976", "1978"], correct: 1 },
  { question: "Godfather Part III year?", choices: ["1988", "1990", "1992", "1994"], correct: 1 },
  { question: "Apocalypse Now year?", choices: ["1977", "1979", "1981", "1983"], correct: 1 },
  { question: "The Conversation year?", choices: ["1972", "1974", "1976", "1978"], correct: 1 },
  { question: "Bram Stoker's Dracula year?", choices: ["1990", "1992", "1994", "1996"], correct: 1 },
  { question: "Vito Corleone in Part I?", choices: ["Brando", "De Niro", "Pacino", "Caan"], correct: 0 },
  { question: "Vito Corleone in Part II flashbacks?", choices: ["De Niro", "Brando", "Pacino", "Caan"], correct: 0 },
  { question: "Michael Corleone played by?", choices: ["Pacino", "Brando", "De Niro", "Caan"], correct: 0 },
  { question: "Sonny Corleone played by?", choices: ["James Caan", "De Niro", "Pacino", "Cazale"], correct: 0 },
  { question: "Fredo played by?", choices: ["John Cazale", "Caan", "Pacino", "De Niro"], correct: 0 },
  { question: "Apocalypse Now based on which novella?", choices: ["Heart of Darkness", "Lord Jim", "Nostromo", "Victory"], correct: 0 },
  { question: "Heart of Darkness author?", choices: ["Joseph Conrad", "Hemingway", "Crane", "Stevenson"], correct: 0 },
  { question: "Kurtz in Apocalypse Now?", choices: ["Brando", "De Niro", "Hopkins", "Hackman"], correct: 0 },
  { question: "Captain Willard?", choices: ["Martin Sheen", "Charlie Sheen", "Robert Duvall", "Frederic Forrest"], correct: 0 },
  { question: "Robert Duvall famous line?", choices: ["I love the smell of napalm in the morning", "Charlie don't surf", "Both", "Either"], correct: 2 },
  { question: "Coppola won Best Director Oscar for?", choices: ["Godfather", "Godfather II", "Both", "Apocalypse Now"], correct: 1 },
  { question: "Coppola born in?", choices: ["Detroit", "NYC", "Chicago", "LA"], correct: 0 },
  { question: "Coppola's daughter Sofia directed?", choices: ["Lost in Translation", "Virgin Suicides", "Marie Antoinette", "All of these"], correct: 3 },
  { question: "Coppola's nephew is?", choices: ["Nicolas Cage", "Jason Schwartzman", "Both", "Just Cage"], correct: 2 },
  { question: "Coppola's wife Eleanor made which doc?", choices: ["Hearts of Darkness", "Burden of Dreams", "Both", "Lost in La Mancha"], correct: 0 },
  { question: "Hearts of Darkness is about making?", choices: ["Apocalypse Now", "Godfather", "Conversation", "Cotton Club"], correct: 0 },
  { question: "Coppola's 'Outsiders' (1983) cast?", choices: ["Cruise, Estevez, Howell", "Hanks, Damon", "Tom Bergquist", "Robin Williams"], correct: 0 },
  { question: "Cotton Club year?", choices: ["1982", "1984", "1986", "1988"], correct: 1 },
  { question: "Tucker: The Man and His Dream year?", choices: ["1986", "1988", "1990", "1992"], correct: 1 },
  { question: "Coppola owns a?", choices: ["Winery", "Brewery", "Hotel", "All of these"], correct: 3 },
  { question: "American Zoetrope co-founded with?", choices: ["George Lucas", "Spielberg", "Schrader", "Friedkin"], correct: 0 },
  { question: "Megalopolis year?", choices: ["2022", "2024", "2025", "2026"], correct: 1 },
  { question: "Conversation lead?", choices: ["Hackman", "De Niro", "Pacino", "Duvall"], correct: 0 },
  { question: "Conversation cinematographer (DP)?", choices: ["Bill Butler", "Vittorio Storaro", "Gordon Willis", "Vilmos Zsigmond"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CoppolaQuizSettings): CoppolaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CoppolaQuizState, action: CoppolaQuizAction): CoppolaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CoppolaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
