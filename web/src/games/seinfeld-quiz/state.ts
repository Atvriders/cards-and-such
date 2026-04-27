import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SeinfeldSettings { questions: "10" | "20" | "30"; }
export interface SeinfeldState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SeinfeldAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who created Seinfeld?", choices: ["Jerry & Larry David","Jerry alone","Larry alone","Larry Charles"], correct: 0 },
  { question: "Kramer's first name?", choices: ["Cosmo","Kelvin","Kal","Kraig"], correct: 0 },
  { question: "George's surname?", choices: ["Costanza","Castello","Coppola","Carlin"], correct: 0 },
  { question: "Elaine works for?", choices: ["Pendant Publishing","Simon","Putt-Putt","Vandelay"], correct: 0 },
  { question: "Vandelay Industries makes?", choices: ["Latex","Paper","Software","Toys"], correct: 0 },
  { question: "Festivus pole is made of?", choices: ["Aluminum","Wood","Iron","Plastic"], correct: 0 },
  { question: "Soup Nazi catchphrase?", choices: ["No soup for you!","Get out!","Next!","Move along!"], correct: 0 },
  { question: "Show is about?", choices: ["Nothing","Comedy","NYC","Dating"], correct: 0 },
  { question: "Newman's job?", choices: ["Postman","Cabbie","Doorman","Cop"], correct: 0 },
  { question: "Jerry's apartment number?", choices: ["5A","5B","4A","3A"], correct: 1 },
  { question: "Kramer's hot tub fluctuates?", choices: ["Yes","No","Maybe","Sometimes"], correct: 0 },
  { question: "Babka flavor George prefers?", choices: ["Cinnamon","Chocolate","Vanilla","Lemon"], correct: 0 },
  { question: "Marble rye theft involves?", choices: ["Jerry's mom","Estelle","Mrs. Choate","Helen"], correct: 2 },
  { question: "Master of his domain refers to?", choices: ["Bet","Apartment","Boss","Diet"], correct: 0 },
  { question: "George's fiancée Susan dies from?", choices: ["Glue envelopes","Toxic candy","Plane crash","Drowning"], correct: 0 },
  { question: "Kramer's coffee table book is?", choices: ["About coffee tables","About cars","About NYC","About fashion"], correct: 0 },
  { question: "Pez Dispenser at concert features?", choices: ["Tweety","Mickey","Donald","Bugs"], correct: 0 },
  { question: "George's pet name in pool?", choices: ["Shrinkage","Spongey","Pool man","Slim"], correct: 0 },
  { question: "Yada yada means?", choices: ["Skip details","Goodbye","Yes","No"], correct: 0 },
  { question: "Jerry dates a girl with?", choices: ["Man hands","Big head","Small voice","Big feet"], correct: 0 },
  { question: "Magic Loogie was a parody of?", choices: ["JFK conspiracy","Apollo 13","Watergate","9/11"], correct: 0 },
  { question: "The Bro / Manssiere creators?", choices: ["Frank & Kramer","Jerry & Newman","George & Frank","Estelle"], correct: 0 },
  { question: "Show ran how many seasons?", choices: ["7","8","9","10"], correct: 2 },
  { question: "Finale aired in?", choices: ["1996","1997","1998","1999"], correct: 2 },
  { question: "Mr. Pitt's last name in full?", choices: ["Pitt","Justin Pitt","Mr. Justin Pitt","Justin"], correct: 1 },
  { question: "The contest involves?", choices: ["Sleep","Self denial","Eating","Dancing"], correct: 1 },
  { question: "Kenny Rogers Roasters annoyed?", choices: ["Kramer","George","Jerry","Elaine"], correct: 0 },
  { question: "The Junior Mint operation incident?", choices: ["Kramer","Jerry","George","Newman"], correct: 0 },
  { question: "Fusilli Jerry refers to?", choices: ["Pasta sculpture","Restaurant","Cookbook","Joke"], correct: 0 },
  { question: "George's job at Yankees?", choices: ["Asst to Traveling Sec","Player","Owner","Coach"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SeinfeldSettings): SeinfeldState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SeinfeldState, action: SeinfeldAction): SeinfeldState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SeinfeldState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
