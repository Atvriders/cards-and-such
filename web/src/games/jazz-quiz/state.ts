import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface JazzQuizSettings { questions: "10" | "20" | "30"; }
export interface JazzQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type JazzQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what city did jazz famously originate?", choices: ["New Orleans","Chicago","New York","Memphis"], correct: 0 },
  { question: "Who is called the King of Jazz/Satchmo?", choices: ["Louis Armstrong","Duke Ellington","Miles Davis","Charlie Parker"], correct: 0 },
  { question: "What instrument did Louis Armstrong famously play?", choices: ["Trumpet","Saxophone","Piano","Drums"], correct: 0 },
  { question: "What jazz pianist composed Take the A Train (with Strayhorn)?", choices: ["Duke Ellington","Count Basie","Thelonious Monk","Art Tatum"], correct: 0 },
  { question: "What saxophonist pioneered bebop?", choices: ["Charlie Parker","John Coltrane","Sonny Rollins","Ornette Coleman"], correct: 0 },
  { question: "What jazz singer was called Lady Day?", choices: ["Billie Holiday","Ella Fitzgerald","Sarah Vaughan","Nina Simone"], correct: 0 },
  { question: "What singer was the First Lady of Song?", choices: ["Ella Fitzgerald","Billie Holiday","Sarah Vaughan","Dinah Washington"], correct: 0 },
  { question: "Who recorded Kind of Blue (1959)?", choices: ["Miles Davis","John Coltrane","Bill Evans","Cannonball Adderley"], correct: 0 },
  { question: "What is Kind of Blue notable for?", choices: ["Modal jazz","Bebop","Swing","Free jazz"], correct: 0 },
  { question: "Who composed Round Midnight?", choices: ["Thelonious Monk","Bill Evans","Miles Davis","Bud Powell"], correct: 0 },
  { question: "What style was Glenn Miller associated with?", choices: ["Swing","Bebop","Cool","Free"], correct: 0 },
  { question: "Who recorded A Love Supreme?", choices: ["John Coltrane","Miles Davis","Sonny Rollins","Wayne Shorter"], correct: 0 },
  { question: "What's the term for a jazz solo improvisation?", choices: ["Improvisation / chorus","Cadenza","Vamp","Riff"], correct: 0 },
  { question: "What 1920s era is also called the Jazz Age?", choices: ["Roaring Twenties","Gilded","Progressive","Jazz Era"], correct: 0 },
  { question: "Who coined Take Five?", choices: ["Dave Brubeck","Paul Desmond wrote it for Brubeck","Miles","Stan Getz"], correct: 1 },
  { question: "What time signature is Take Five in?", choices: ["5/4","4/4","3/4","7/8"], correct: 0 },
  { question: "What did Wynton Marsalis play?", choices: ["Trumpet","Saxophone","Piano","Bass"], correct: 0 },
  { question: "What song was Ella Fitzgerald famous for scatting?", choices: ["How High the Moon","Mack the Knife","Both","All of these"], correct: 3 },
  { question: "What jazz subgenre fused with rock in late 60s?", choices: ["Fusion","Cool jazz","Hard bop","Free jazz"], correct: 0 },
  { question: "What's the famous jazz festival in Newport?", choices: ["Newport Jazz Festival","Monterey","Both major","Montreux"], correct: 0 },
  { question: "What instrument did Charles Mingus play?", choices: ["Bass","Piano","Saxophone","Drums"], correct: 0 },
  { question: "What jazz musician composed Mood Indigo?", choices: ["Duke Ellington","Count Basie","Fletcher Henderson","Benny Goodman"], correct: 0 },
  { question: "Who was the King of Swing?", choices: ["Benny Goodman","Tommy Dorsey","Glenn Miller","Artie Shaw"], correct: 0 },
  { question: "What instrument did Benny Goodman play?", choices: ["Clarinet","Saxophone","Trumpet","Piano"], correct: 0 },
  { question: "Who composed Birdland?", choices: ["Joe Zawinul / Weather Report","Pat Metheny","Chick Corea","Herbie Hancock"], correct: 0 },
  { question: "What jazz subgenre started in the 1940s?", choices: ["Bebop","Swing","Cool","Free"], correct: 0 },
  { question: "Who composed In a Sentimental Mood?", choices: ["Duke Ellington","Cole Porter","Hoagy Carmichael","Irving Berlin"], correct: 0 },
  { question: "What's a head in jazz?", choices: ["Main melody","Solo","Bridge","Outro"], correct: 0 },
  { question: "What instrument did Herbie Hancock play famously?", choices: ["Piano/keyboards","Bass","Drums","Saxophone"], correct: 0 },
  { question: "What style is Chet Baker associated with?", choices: ["Cool jazz","Bebop","Swing","Free"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: JazzQuizSettings): JazzQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: JazzQuizState, action: JazzQuizAction): JazzQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: JazzQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
