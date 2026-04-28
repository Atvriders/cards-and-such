import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KaraokeClassicsQuizSettings { questions: "10" | "20" | "30"; }
export interface KaraokeClassicsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KaraokeClassicsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "'Don't Stop Believin'' is by which band?", choices: ["Foreigner","Journey","REO Speedwagon","Boston"], correct: 1 },
  { question: "'I Will Survive' is famously by?", choices: ["Donna Summer","Diana Ross","Gloria Gaynor","Aretha Franklin"], correct: 2 },
  { question: "'Bohemian Rhapsody' is from which Queen album?", choices: ["A Night at the Opera","News of the World","Sheer Heart Attack","Hot Space"], correct: 0 },
  { question: "'Sweet Caroline' is sung by?", choices: ["Neil Diamond","Neil Young","Tom Jones","Paul McCartney"], correct: 0 },
  { question: "'Total Eclipse of the Heart' is by?", choices: ["Cher","Bonnie Tyler","Stevie Nicks","Pat Benatar"], correct: 1 },
  { question: "Karaoke originated in which country?", choices: ["China","Korea","Japan","Taiwan"], correct: 2 },
  { question: "What does 'karaoke' literally mean?", choices: ["Empty orchestra","Sing along","Loud music","Bar song"], correct: 0 },
  { question: "'Living on a Prayer' is by which band?", choices: ["Bon Jovi","Def Leppard","Aerosmith","Whitesnake"], correct: 0 },
  { question: "'Mr. Brightside' is by?", choices: ["Coldplay","Killers","Foster the People","Arcade Fire"], correct: 1 },
  { question: "'Wonderwall' is by which Britpop band?", choices: ["Blur","Pulp","Oasis","Suede"], correct: 2 },
  { question: "Which decade saw karaoke become a worldwide trend?", choices: ["1970s","1980s","1990s","2000s"], correct: 1 },
  { question: "'Dancing Queen' is by?", choices: ["Cher","ABBA","Bee Gees","Donna Summer"], correct: 1 },
  { question: "'I Want It That Way' is a karaoke staple by?", choices: ["NSYNC","Backstreet Boys","98 Degrees","New Kids"], correct: 1 },
  { question: "'Summer Nights' is from which musical/film?", choices: ["Grease","Hairspray","Mamma Mia","Footloose"], correct: 0 },
  { question: "'Like a Virgin' is by?", choices: ["Cyndi Lauper","Madonna","Whitney Houston","Pat Benatar"], correct: 1 },
  { question: "'My Way' is most associated with which singer?", choices: ["Frank Sinatra","Sammy Davis Jr.","Dean Martin","Bing Crosby"], correct: 0 },
  { question: "'Africa' became a viral karaoke hit by which '80s band?", choices: ["Toto","Asia","Genesis","Yes"], correct: 0 },
  { question: "'Bohemian Rhapsody' was extended to fame in which 1992 film?", choices: ["Wayne's World","Back to the Future","Top Gun","The Big Lebowski"], correct: 0 },
  { question: "Karaoke machines are commonly hooked up to TVs to display?", choices: ["Lyrics","Pitch coaching","Album art","Music videos"], correct: 0 },
  { question: "'Can't Help Falling in Love' is most associated with?", choices: ["Elvis Presley","Frank Sinatra","Roy Orbison","Buddy Holly"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KaraokeClassicsQuizSettings): KaraokeClassicsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KaraokeClassicsQuizState, action: KaraokeClassicsQuizAction): KaraokeClassicsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KaraokeClassicsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
