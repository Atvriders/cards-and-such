import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CoppolaQuizSettings { questions: "10" | "20" | "30"; }
export interface CoppolaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CoppolaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Francis Ford Coppola was born in?", choices: ["1939", "1942", "1945", "1948"], correct: 0 },
  { question: "What 1972 film established Coppola as a master?", choices: ["The Godfather", "Apocalypse Now", "The Conversation", "The Rain People"], correct: 0 },
  { question: "Who plays Vito Corleone in 'The Godfather'?", choices: ["Marlon Brando", "Al Pacino", "Robert De Niro", "James Caan"], correct: 0 },
  { question: "Who plays Michael Corleone?", choices: ["Al Pacino", "Robert De Niro", "James Caan", "Robert Duvall"], correct: 0 },
  { question: "The Godfather is based on a novel by?", choices: ["Mario Puzo", "Truman Capote", "Norman Mailer", "Gay Talese"], correct: 0 },
  { question: "How many Best Picture Oscars did The Godfather Parts I and II both win?", choices: ["Both won", "Only Part I", "Only Part II", "Neither"], correct: 0 },
  { question: "Robert De Niro plays young Vito in?", choices: ["The Godfather Part II", "The Godfather Part III", "Goodfellas", "The Irishman"], correct: 0 },
  { question: "What 1979 Vietnam War epic by Coppola?", choices: ["Apocalypse Now", "Platoon", "The Deer Hunter", "Full Metal Jacket"], correct: 0 },
  { question: "Apocalypse Now is loosely based on what novel?", choices: ["Heart of Darkness", "Lord Jim", "The Quiet American", "Catch-22"], correct: 0 },
  { question: "Who plays Colonel Kurtz?", choices: ["Marlon Brando", "Robert Duvall", "Martin Sheen", "Dennis Hopper"], correct: 0 },
  { question: "Who plays Captain Willard?", choices: ["Martin Sheen", "Robert Duvall", "Harvey Keitel", "Dennis Hopper"], correct: 0 },
  { question: "Robert Duvall's Apocalypse Now line about napalm?", choices: ["I love the smell of napalm in the morning", "Charlie don't surf", "Bring the rain", "Saddle up"], correct: 0 },
  { question: "What 1974 paranoid thriller stars Gene Hackman as a surveillance expert?", choices: ["The Conversation", "Klute", "Three Days of the Condor", "Marathon Man"], correct: 0 },
  { question: "What 1992 horror film stars Gary Oldman in the title role?", choices: ["Bram Stoker's Dracula", "The Lost Boys", "Interview with the Vampire", "Nosferatu"], correct: 0 },
  { question: "What 1983 Coppola coming-of-age film features Matt Dillon?", choices: ["The Outsiders", "Rumble Fish", "Both", "Peggy Sue Got Married"], correct: 2 },
  { question: "What 1997 legal drama stars Matt Damon?", choices: ["The Rainmaker", "A Civil Action", "The Firm", "Erin Brockovich"], correct: 0 },
  { question: "What 1988 Coppola film about a Cuban automaker?", choices: ["Tucker: The Man and His Dream", "Gardens of Stone", "Peggy Sue Got Married", "Cotton Club"], correct: 0 },
  { question: "Coppola won his first Oscars for which film besides Godfather?", choices: ["Patton (screenplay)", "American Graffiti", "The Conversation", "Apocalypse Now"], correct: 0 },
  { question: "Coppola's daughter is which acclaimed director?", choices: ["Sofia Coppola", "Roman Coppola", "Gia Coppola", "Talia Shire"], correct: 0 },
  { question: "Coppola's nephew Nicolas Cage was born?", choices: ["Nicolas Coppola", "Nicolas Lopes", "Nicolas Strange", "Nicolas Vito"], correct: 0 },
  { question: "Coppola won Palme d'Or at Cannes for?", choices: ["The Conversation and Apocalypse Now", "Just Apocalypse Now", "Just Godfather", "Just Conversation"], correct: 0 },
  { question: "Coppola operates a famous winery called?", choices: ["Inglenook", "Mondavi", "Coppola Winery", "Niebaum-Coppola"], correct: 0 },
  { question: "What 1986 fantasy stars Kathleen Turner as a woman traveling back in time?", choices: ["Peggy Sue Got Married", "Gardens of Stone", "Tucker", "The Outsiders"], correct: 0 },
  { question: "Apocalypse Now features what classical piece during a helicopter attack?", choices: ["Ride of the Valkyries", "1812 Overture", "Carmina Burana", "Toccata and Fugue"], correct: 0 },
  { question: "What is the opening line of The Godfather?", choices: ["I believe in America", "It's not personal, it's strictly business", "Leave the gun, take the cannoli", "I'll make him an offer he can't refuse"], correct: 0 },
  { question: "Who plays Tom Hagen in The Godfather?", choices: ["Robert Duvall", "James Caan", "John Cazale", "Talia Shire"], correct: 0 },
  { question: "Who plays Sonny Corleone?", choices: ["James Caan", "Robert Duvall", "Al Pacino", "John Cazale"], correct: 0 },
  { question: "What is Coppola's 2024 self-funded epic?", choices: ["Megalopolis", "Twixt", "Tetro", "Youth Without Youth"], correct: 0 },
  { question: "Coppola was the youngest USC film school student/grad of his era and studied at?", choices: ["UCLA", "USC", "AFI", "NYU"], correct: 0 },
  { question: "What 1990 film completed the Godfather trilogy?", choices: ["The Godfather Part III", "The Godfather Returns", "The Godfather Saga", "The Don's Last"], correct: 0 },
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
