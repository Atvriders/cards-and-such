import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface JimCarreyQuizSettings { questions: "10" | "20" | "30"; }
export interface JimCarreyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type JimCarreyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What year was Jim Carrey born?", choices: ["1958", "1962", "1965", "1968"], correct: 1 },
  { question: "Where was Jim Carrey born?", choices: ["Newmarket, Ontario", "Toronto", "Los Angeles", "Detroit"], correct: 0 },
  { question: "What 1994 film features Carrey as a 'pet detective'?", choices: ["Ace Ventura: Pet Detective", "The Mask", "Dumb and Dumber", "Liar Liar"], correct: 0 },
  { question: "Carrey co-starred with Jeff Daniels in which 1994 comedy?", choices: ["Dumb and Dumber", "The Cable Guy", "Liar Liar", "Me, Myself & Irene"], correct: 0 },
  { question: "Who directed 'The Mask' (1994)?", choices: ["Chuck Russell", "Tom Shadyac", "Peter Farrelly", "Jim Carrey"], correct: 0 },
  { question: "What 1998 film stars Carrey as Truman Burbank?", choices: ["The Truman Show", "Man on the Moon", "Cable Guy", "Liar Liar"], correct: 0 },
  { question: "Carrey played comedian Andy Kaufman in which 1999 film?", choices: ["Man on the Moon", "Andy", "The Cable Guy", "I Love You Phillip Morris"], correct: 0 },
  { question: "In 'How the Grinch Stole Christmas' (2000), Carrey plays?", choices: ["The Grinch", "Cindy Lou Who", "The Narrator", "Mayor"], correct: 0 },
  { question: "What 2003 film features Carrey gaining God's powers?", choices: ["Bruce Almighty", "Liar Liar", "Yes Man", "Evan Almighty"], correct: 0 },
  { question: "In 'Eternal Sunshine of the Spotless Mind' (2004), Carrey plays?", choices: ["Joel Barish", "Clementine", "Patrick", "Howard"], correct: 0 },
  { question: "Who directed 'Eternal Sunshine of the Spotless Mind'?", choices: ["Michel Gondry", "Spike Jonze", "Charlie Kaufman", "Wes Anderson"], correct: 0 },
  { question: "Carrey first gained fame on which TV sketch show?", choices: ["In Living Color", "SNL", "Mad TV", "Kids in the Hall"], correct: 0 },
  { question: "What was Carrey's catchphrase from 'In Living Color' as Fire Marshal Bill?", choices: ["Lemme show ya something", "Hot stuff", "Burn baby", "Smokin'"], correct: 0 },
  { question: "What 1997 film has Carrey as a lawyer who can't lie?", choices: ["Liar Liar", "Yes Man", "Bruce Almighty", "Truman Show"], correct: 0 },
  { question: "Who directed 'The Truman Show'?", choices: ["Peter Weir", "Tom Shadyac", "Bobby Farrelly", "Frank Darabont"], correct: 0 },
  { question: "Which 2008 Carrey comedy involves saying 'yes' to everything?", choices: ["Yes Man", "Liar Liar", "Bruce Almighty", "Fun with Dick and Jane"], correct: 0 },
  { question: "Carrey starred in which 2014 sequel to 1994 hit?", choices: ["Dumb and Dumber To", "Ace Ventura 3", "Mask Returns", "Liar Liar 2"], correct: 0 },
  { question: "Carrey plays Dr. Robotnik in which film franchise?", choices: ["Sonic the Hedgehog", "Mario", "Pokemon", "Crash Bandicoot"], correct: 0 },
  { question: "Carrey won Golden Globes for which two consecutive years' films?", choices: ["Truman Show and Man on the Moon", "Mask and Ace Ventura", "Liar Liar and Bruce Almighty", "Yes Man and Eternal Sunshine"], correct: 0 },
  { question: "What instrument does Carrey play in 'Dumb and Dumber'?", choices: ["No instrument", "Guitar", "Harmonica", "Piano"], correct: 0 },
  { question: "What color suit does The Mask wear?", choices: ["Yellow", "Green", "Red", "Blue"], correct: 0 },
  { question: "What is the dog's name in 'The Mask'?", choices: ["Milo", "Max", "Buddy", "Rex"], correct: 0 },
  { question: "In 'Dumb and Dumber', Carrey's character is named?", choices: ["Lloyd Christmas", "Harry Dunne", "Ace", "Stanley"], correct: 0 },
  { question: "What city do they drive to in 'Dumb and Dumber'?", choices: ["Aspen", "Vail", "Denver", "Park City"], correct: 0 },
  { question: "Carrey's first major Hollywood film was?", choices: ["Once Bitten (1985)", "Earth Girls Are Easy (1988)", "Ace Ventura (1994)", "Pink Cadillac (1989)"], correct: 0 },
  { question: "Carrey was a member of which sketch comedy show, replacing a famous comedian briefly?", choices: ["The Duck Factory (NBC sitcom)", "SNL cast", "Kids in the Hall", "Mad TV"], correct: 0 },
  { question: "What is the name of Carrey's character in 'Bruce Almighty'?", choices: ["Bruce Nolan", "Bruce Wayne", "Bruce Banner", "Bruce Lee"], correct: 0 },
  { question: "In 'Eternal Sunshine', the memory-erasing company is named?", choices: ["Lacuna Inc.", "Memory Wipe", "Forget Me Not", "Eternal Co."], correct: 0 },
  { question: "Carrey co-starred with Kate Winslet in?", choices: ["Eternal Sunshine of the Spotless Mind", "The Truman Show", "Yes Man", "Bruce Almighty"], correct: 0 },
  { question: "What 2007 thriller has Carrey obsessed with the number 23?", choices: ["The Number 23", "Yes Man", "I Love You Phillip Morris", "23 Hours"], correct: 0 },
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
