import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CountryMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface CountryMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CountryMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What city is country music's home?", choices: ["Nashville","Memphis","Atlanta","Austin"], correct: 0 },
  { question: "What's the iconic Nashville venue?", choices: ["Grand Ole Opry","Ryman Auditorium","Both","Bluebird Cafe"], correct: 2 },
  { question: "Who is called the King of Country?", choices: ["George Strait","Hank Williams","Garth Brooks","Johnny Cash"], correct: 0 },
  { question: "Who was The Man in Black?", choices: ["Johnny Cash","Willie Nelson","Waylon Jennings","Merle Haggard"], correct: 0 },
  { question: "What's Johnny Cash's signature song?", choices: ["Folsom Prison Blues","Ring of Fire","I Walk the Line","All iconic"], correct: 3 },
  { question: "Who is the Queen of Country?", choices: ["Dolly Parton","Loretta Lynn","Tammy Wynette","Reba McEntire"], correct: 0 },
  { question: "Who wrote I Will Always Love You (later Whitney Houston cover)?", choices: ["Dolly Parton","Loretta Lynn","Patsy Cline","Tammy Wynette"], correct: 0 },
  { question: "Who sang Crazy (1961)?", choices: ["Patsy Cline","Loretta Lynn","Dolly Parton","Tammy Wynette"], correct: 0 },
  { question: "Who wrote Crazy?", choices: ["Willie Nelson","Hank Williams","Patsy Cline","Buddy Holly"], correct: 0 },
  { question: "What's Hank Williams Sr.'s most famous song?", choices: ["Your Cheatin Heart","I'm So Lonesome I Could Cry","Hey Good Lookin","All classics"], correct: 3 },
  { question: "What is Outlaw Country?", choices: ["1970s subgenre with Willie Nelson, Waylon Jennings","1990s genre","2000s genre","Bluegrass branch"], correct: 0 },
  { question: "Who released Wide Open Spaces?", choices: ["Dixie Chicks (Chicks)","Shania Twain","Carrie Underwood","Faith Hill"], correct: 0 },
  { question: "Who's the bestselling country crossover artist of the 90s?", choices: ["Garth Brooks","Shania Twain","Both","Tim McGraw"], correct: 2 },
  { question: "What's Shania Twain's iconic 1997 album?", choices: ["Come On Over","The Woman in Me","Up!","Greatest Hits"], correct: 0 },
  { question: "Who sang Friends in Low Places?", choices: ["Garth Brooks","Alan Jackson","George Strait","Brooks and Dunn"], correct: 0 },
  { question: "What CMA Entertainer of the Year reign held by Garth Brooks ended around when?", choices: ["Late 1990s","Early 2000s","Mid 80s","2010s"], correct: 0 },
  { question: "Who is Carrie Underwood's American Idol season win?", choices: ["Season 4 (2005)","Season 1","Season 8","Season 10"], correct: 0 },
  { question: "Who duet-recorded Jackson with Johnny Cash?", choices: ["June Carter Cash","Loretta Lynn","Dolly Parton","Patsy Cline"], correct: 0 },
  { question: "What instrument is most iconic of country?", choices: ["Guitar (acoustic)","Banjo","Fiddle","All used"], correct: 3 },
  { question: "What is the term for fast-tempo string-band country?", choices: ["Bluegrass","Honky-tonk","Western","Outlaw"], correct: 0 },
  { question: "Who's father of bluegrass?", choices: ["Bill Monroe","Earl Scruggs","Lester Flatt","Ralph Stanley"], correct: 0 },
  { question: "Who sang Achy Breaky Heart?", choices: ["Billy Ray Cyrus","Garth Brooks","Alan Jackson","Tim McGraw"], correct: 0 },
  { question: "What's Tim McGraw and Faith Hill's relationship?", choices: ["Married","Siblings","Cousins","Not related"], correct: 0 },
  { question: "What country singer's reality show was The Voice coach?", choices: ["Blake Shelton","Trace Adkins","Toby Keith","Jason Aldean"], correct: 0 },
  { question: "Who sang Live Like You Were Dying?", choices: ["Tim McGraw","Kenny Chesney","Toby Keith","Brad Paisley"], correct: 0 },
  { question: "What's the Country Music Hall of Fame located?", choices: ["Nashville","Memphis","Branson","Houston"], correct: 0 },
  { question: "Who's Taylor Swift early genre?", choices: ["Country","Pop","Both - she crossed","R&B"], correct: 0 },
  { question: "What 1960s singer was Coal Miner's Daughter?", choices: ["Loretta Lynn","Tammy Wynette","Patsy Cline","Dolly"], correct: 0 },
  { question: "What's a steel guitar in country?", choices: ["Pedal/lap steel guitar","Slide guitar variation","Both","Just any guitar"], correct: 2 },
  { question: "What's a honky-tonk?", choices: ["Bar with country music","Music subgenre","Both","Dance hall"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CountryMusicQuizSettings): CountryMusicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CountryMusicQuizState, action: CountryMusicQuizAction): CountryMusicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CountryMusicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
