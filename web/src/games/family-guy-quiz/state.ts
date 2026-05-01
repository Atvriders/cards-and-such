import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FamilyGuySettings { questions: "10" | "20" | "30"; }
export interface FamilyGuyState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FamilyGuyAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What town is Family Guy set in?", choices: ["Quahog","Springfield","Pawnee","Stars Hollow"], correct: 0 },
  { question: "What state is Quahog in?", choices: ["Rhode Island","Massachusetts","Connecticut","Maine"], correct: 0 },
  { question: "Who created Family Guy?", choices: ["Seth MacFarlane","Matt Groening","Mike Judge","Trey Parker"], correct: 0 },
  { question: "Who is the Griffin family's talking dog?", choices: ["Brian","Stewie","Vinny","Rex"], correct: 0 },
  { question: "Who is the Griffin family's matricidal baby?", choices: ["Stewie","Chris","Meg","Brian"], correct: 0 },
  { question: "Who is the Griffin patriarch?", choices: ["Peter","Lois","Quagmire","Cleveland"], correct: 0 },
  { question: "Who is the Griffin matriarch?", choices: ["Lois","Bonnie","Donna","Connie"], correct: 0 },
  { question: "Who is the awkward middle child?", choices: ["Chris","Meg","Stewie","Brian"], correct: 0 },
  { question: "Who is the often-bullied daughter?", choices: ["Meg","Lois","Connie","Bonnie"], correct: 0 },
  { question: "What is Quagmire's catchphrase?", choices: ["Giggity","Freakin' sweet","Hey there","Shazam"], correct: 0 },
  { question: "What is Peter's drinking buddy bar called?", choices: ["The Drunken Clam","Moe's","The Black Pearl","Cheers"], correct: 0 },
  { question: "Who is the African-American neighbor who moved away?", choices: ["Cleveland Brown","Joe Swanson","Glenn Quagmire","Mort Goldman"], correct: 0 },
  { question: "Who is the wheelchair-using neighbor cop?", choices: ["Joe Swanson","Cleveland","Quagmire","Mort"], correct: 0 },
  { question: "What is Stewie's accent?", choices: ["British","American","Australian","Canadian"], correct: 0 },
  { question: "Who voices Peter Griffin?", choices: ["Seth MacFarlane","Mike Henry","Patrick Warburton","Adam West"], correct: 0 },
  { question: "Who voices Lois Griffin?", choices: ["Alex Borstein","Mila Kunis","Jane Lynch","Seth MacFarlane"], correct: 0 },
  { question: "Who voices Meg Griffin (current)?", choices: ["Mila Kunis","Lacey Chabert","Alex Borstein","Seth Green"], correct: 0 },
  { question: "Who voices Chris Griffin?", choices: ["Seth Green","Seth MacFarlane","Mike Henry","Mila Kunis"], correct: 0 },
  { question: "What is the name of Peter's evil chicken nemesis?", choices: ["Ernie the Giant Chicken","Chickenator","Cluckles","The Cock"], correct: 0 },
  { question: "What network airs Family Guy?", choices: ["Fox","ABC","NBC","HBO"], correct: 0 },
  { question: "What year did Family Guy premiere?", choices: ["1999","2001","1997","2003"], correct: 0 },
  { question: "Who voices Stewie?", choices: ["Seth MacFarlane","Mike Henry","Seth Green","Patrick Warburton"], correct: 0 },
  { question: "What is the name of Peter's father?", choices: ["Francis Griffin","Mickey McFinnigan","Carter Pewterschmidt","Bertram"], correct: 0 },
  { question: "Who is Lois's wealthy father?", choices: ["Carter Pewterschmidt","Francis","Adam West","Mort Goldman"], correct: 0 },
  { question: "Who plays Mayor Adam West (the character is named after him)?", choices: ["Adam West","Christopher Lloyd","Patrick Stewart","James Woods"], correct: 0 },
  { question: "What is the name of Brian's on-and-off girlfriend who has an annoying voice?", choices: ["Jillian","Ida","Bonnie","Tricia"], correct: 0 },
  { question: "Who is the Jewish accountant friend of Peter?", choices: ["Mort Goldman","Herbert","Bruce","Seamus"], correct: 0 },
  { question: "What is Herbert's defining trait?", choices: ["Creepy interest in Chris","Heroic firefighter","Marathon runner","Master chef"], correct: 0 },
  { question: "Where does Peter work for many seasons (factory)?", choices: ["Pawtucket Brewery","Quahog Cable","The Clam","Happy-Go-Lucky Toys"], correct: 0 },
  { question: "What is Peter's hilarious oversized cousin called?", choices: ["Fat-related; not applicable: he has Pawtucket Pat","Pawtucket Pat","Big Fat Paulie","The Quahog Quasher"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FamilyGuySettings): FamilyGuyState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FamilyGuyState, action: FamilyGuyAction): FamilyGuyState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FamilyGuyState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
