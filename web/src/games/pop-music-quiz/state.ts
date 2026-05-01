import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PopMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface PopMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PopMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who is the King of Pop?", choices: ["Michael Jackson","Prince","Elvis","Justin Bieber"], correct: 0 },
  { question: "What's MJ's bestselling album?", choices: ["Thriller","Bad","Off the Wall","Dangerous"], correct: 0 },
  { question: "Who is the Queen of Pop?", choices: ["Madonna","Britney Spears","Lady Gaga","Cher"], correct: 0 },
  { question: "What was Madonna's 1984 hit?", choices: ["Like a Virgin","Material Girl","Holiday","Like a Prayer"], correct: 0 },
  { question: "What is Beyoncé's group of origin?", choices: ["Destiny's Child","Spice Girls","TLC","En Vogue"], correct: 0 },
  { question: "Who released the album 21 in 2011?", choices: ["Adele","Beyonce","Taylor Swift","Lady Gaga"], correct: 0 },
  { question: "What's Adele's chart-topping ballad from 21?", choices: ["Someone Like You","Hello","Skyfall","Rolling in the Deep"], correct: 0 },
  { question: "Who released 1989?", choices: ["Taylor Swift","Beyonce","Adele","Katy Perry"], correct: 0 },
  { question: "Who sang Baby One More Time?", choices: ["Britney Spears","Christina Aguilera","Jessica Simpson","Mandy Moore"], correct: 0 },
  { question: "What was Whitney Houston's 1992 hit?", choices: ["I Will Always Love You","Greatest Love","I Wanna Dance","All of these are hers"], correct: 0 },
  { question: "Who released Bad Romance?", choices: ["Lady Gaga","Madonna","Christina","Britney"], correct: 0 },
  { question: "What boy band did Justin Timberlake start in?", choices: ["NSYNC","Backstreet Boys","98 Degrees","New Kids"], correct: 0 },
  { question: "What boy band sang I Want It That Way?", choices: ["Backstreet Boys","NSYNC","98 Degrees","BTS"], correct: 0 },
  { question: "What pop singer is known as J-Lo?", choices: ["Jennifer Lopez","Jennifer Hudson","Jessica Simpson","Janet Jackson"], correct: 0 },
  { question: "What 2017 song by Luis Fonsi and Daddy Yankee broke records?", choices: ["Despacito","Mi Gente","Bailando","Echame La Culpa"], correct: 0 },
  { question: "Who sang Single Ladies (Put a Ring on It)?", choices: ["Beyonce","Rihanna","Jennifer Hudson","Kelly Rowland"], correct: 0 },
  { question: "Who released Shake It Off in 2014?", choices: ["Taylor Swift","Katy Perry","Demi Lovato","Selena Gomez"], correct: 0 },
  { question: "Who sang Roar?", choices: ["Katy Perry","Kesha","Pink","Christina"], correct: 0 },
  { question: "What boy band is Harry Styles from?", choices: ["One Direction","NSYNC","BSB","JLS"], correct: 0 },
  { question: "Who sang Rolling in the Deep?", choices: ["Adele","Sia","Jessie J","Pink"], correct: 0 },
  { question: "Who is Bruno Mars best known for?", choices: ["Just the Way You Are","Uptown Funk","24K Magic","All hits"], correct: 3 },
  { question: "What pop song was Macarena?", choices: ["Los del Rio","Ricky Martin","Enrique Iglesias","Shakira"], correct: 0 },
  { question: "Who sang Livin La Vida Loca?", choices: ["Ricky Martin","Marc Anthony","Enrique Iglesias","Luis Miguel"], correct: 0 },
  { question: "Who's the singer of Toxic?", choices: ["Britney Spears","Christina Aguilera","Pink","Avril Lavigne"], correct: 0 },
  { question: "What pop band sang Wannabe?", choices: ["Spice Girls","All Saints","TLC","Eternal"], correct: 0 },
  { question: "Who released the album The Fame?", choices: ["Lady Gaga","Madonna","Britney","Pink"], correct: 0 },
  { question: "What's Justin Bieber's 2010 hit?", choices: ["Baby","Sorry","Boyfriend","All hits"], correct: 0 },
  { question: "What pop diva sang Vogue (1990)?", choices: ["Madonna","Cher","Janet","Whitney"], correct: 0 },
  { question: "Who sang Rolling Stones Satisfaction in pop covers? (trick: original)", choices: ["Rolling Stones","Beatles","Beach Boys","Doors"], correct: 0 },
  { question: "Who is Drake's frequent collaborator and label-mate?", choices: ["The Weeknd, Future, etc.","All listed","Lil Wayne","Many - all listed"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PopMusicQuizSettings): PopMusicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PopMusicQuizState, action: PopMusicQuizAction): PopMusicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PopMusicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
