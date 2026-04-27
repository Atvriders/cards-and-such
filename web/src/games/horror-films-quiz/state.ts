import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HorrorFilmsQuizSettings { questions: "10" | "20" | "30"; }
export interface HorrorFilmsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HorrorFilmsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Director of 'Psycho' (1960)?", choices: ["Alfred Hitchcock", "Stanley Kubrick", "John Carpenter", "Wes Craven"], correct: 0 },
  { question: "'The Exorcist' was released in?", choices: ["1968", "1973", "1978", "1980"], correct: 1 },
  { question: "Freddy Krueger's setting?", choices: ["Camp Crystal Lake", "Elm Street", "Haddonfield", "Amityville"], correct: 1 },
  { question: "Jason Voorhees's iconic mask?", choices: ["Hockey", "Skull", "Latex", "Burlap"], correct: 0 },
  { question: "'Halloween' (1978) director?", choices: ["John Carpenter", "Wes Craven", "Tobe Hooper", "Sam Raimi"], correct: 0 },
  { question: "Michael Myers's hometown?", choices: ["Crystal Lake", "Haddonfield", "Springwood", "Amityville"], correct: 1 },
  { question: "'The Shining' director?", choices: ["Stanley Kubrick", "Brian De Palma", "John Carpenter", "Roman Polanski"], correct: 0 },
  { question: "'The Shining' is based on a novel by?", choices: ["Dean Koontz", "Stephen King", "Clive Barker", "Anne Rice"], correct: 1 },
  { question: "Pennywise the clown is from?", choices: ["The Shining", "It", "Pet Sematary", "Carrie"], correct: 1 },
  { question: "'Get Out' director?", choices: ["Jordan Peele", "Ari Aster", "James Wan", "M. Night Shyamalan"], correct: 0 },
  { question: "Who is the killer in 'Scream' (1996)?", choices: ["Just Billy", "Just Stu", "Both Billy and Stu", "Sidney's father"], correct: 2 },
  { question: "'Rosemary's Baby' director?", choices: ["Roman Polanski", "Alfred Hitchcock", "John Carpenter", "Brian De Palma"], correct: 0 },
  { question: "What does Annabelle from 'The Conjuring' resemble?", choices: ["Doll", "Painting", "Mirror", "Locket"], correct: 0 },
  { question: "'Hereditary' director?", choices: ["Ari Aster", "Robert Eggers", "Jordan Peele", "James Wan"], correct: 0 },
  { question: "Cabin in the Woods premise?", choices: ["Possession", "Slasher meta-horror", "Vampires", "Ghosts"], correct: 1 },
  { question: "'A Nightmare on Elm Street' director?", choices: ["Wes Craven", "John Carpenter", "Sam Raimi", "Tobe Hooper"], correct: 0 },
  { question: "'Texas Chain Saw Massacre' (1974) villain?", choices: ["Michael Myers", "Leatherface", "Jason", "Pinhead"], correct: 1 },
  { question: "'Saw' creators?", choices: ["Wan & Whannell", "Jordan Peele", "James Wan solo", "Eli Roth"], correct: 0 },
  { question: "'The Silence of the Lambs' won how many top Oscars?", choices: ["3", "4", "5", "6"], correct: 2 },
  { question: "Hannibal Lecter actor?", choices: ["Anthony Hopkins", "Anthony Hawkins", "Antonio Banderas", "Anthony Quinn"], correct: 0 },
  { question: "'The Witch' (2015) director?", choices: ["Robert Eggers", "Ari Aster", "Mike Flanagan", "Jordan Peele"], correct: 0 },
  { question: "'Carrie' was based on whose novel?", choices: ["Stephen King", "Clive Barker", "Dean Koontz", "Anne Rice"], correct: 0 },
  { question: "Pinhead is from which franchise?", choices: ["Hellraiser", "Friday the 13th", "Saw", "Wishmaster"], correct: 0 },
  { question: "'Insidious' director?", choices: ["James Wan", "Wes Craven", "Sam Raimi", "John Carpenter"], correct: 0 },
  { question: "Bram Stoker created which iconic vampire?", choices: ["Lestat", "Dracula", "Carmilla", "Nosferatu"], correct: 1 },
  { question: "'Evil Dead' director?", choices: ["Sam Raimi", "Bruce Campbell", "Eli Roth", "Rob Zombie"], correct: 0 },
  { question: "Bruce Campbell's iconic role?", choices: ["Ash Williams", "Sam Loomis", "Tommy Jarvis", "Billy Loomis"], correct: 0 },
  { question: "'Poltergeist' director?", choices: ["Tobe Hooper", "Steven Spielberg (producer)", "John Carpenter", "Brian De Palma"], correct: 0 },
  { question: "Year of 'Night of the Living Dead'?", choices: ["1965", "1968", "1972", "1975"], correct: 1 },
  { question: "George A. Romero is famous for?", choices: ["Vampire films", "Zombie films", "Slashers", "Possession"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HorrorFilmsQuizSettings): HorrorFilmsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HorrorFilmsQuizState, action: HorrorFilmsQuizAction): HorrorFilmsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HorrorFilmsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
