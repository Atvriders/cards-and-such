import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TvSitcomsQuizSettings { questions: "10" | "20" | "30"; }
export interface TvSitcomsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TvSitcomsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What 1989-98 sitcom is about nothing?", choices: ["Seinfeld","Cheers","Friends","Frasier"], correct: 0 },
  { question: "What sitcom features Norm and Cliff?", choices: ["Cheers","Frasier","Wings","Taxi"], correct: 0 },
  { question: "What 1994-2004 sitcom features 6 friends in NYC?", choices: ["Friends","Frasier","Seinfeld","Will & Grace"], correct: 0 },
  { question: "What sitcom features Sheldon Cooper?", choices: ["The Big Bang Theory","Two and a Half Men","Young Sheldon","Both Big Bang and Young Sheldon"], correct: 3 },
  { question: "What 2005-2013 sitcom is HIMYM short for?", choices: ["How I Met Your Mother","How I Met Your Math","Hardly In My Yard","Help In My Yard"], correct: 0 },
  { question: "What 2009-15 sitcom features Liz Lemon?", choices: ["30 Rock","Community","Parks and Rec","Modern Family"], correct: 0 },
  { question: "Who created 30 Rock?", choices: ["Tina Fey","Mindy Kaling","Liz Meriwether","Lena Dunham"], correct: 0 },
  { question: "What 2009-15 sitcom features Ron Swanson?", choices: ["Parks and Recreation","Community","30 Rock","Modern Family"], correct: 0 },
  { question: "What 2009-2020 ABC sitcom features Pritchett family?", choices: ["Modern Family","The Middle","Black-ish","Last Man Standing"], correct: 0 },
  { question: "What 90s sitcom features the Banks family?", choices: ["The Fresh Prince of Bel-Air","Family Matters","Living Single","Martin"], correct: 0 },
  { question: "What 80s sitcom features the Huxtable family?", choices: ["The Cosby Show","Family Ties","Growing Pains","ALF"], correct: 0 },
  { question: "What 70s sitcom features Archie Bunker?", choices: ["All in the Family","M*A*S*H","Sanford and Son","Maude"], correct: 0 },
  { question: "What 70s sitcom is set in Korean War unit?", choices: ["M*A*S*H","Hogan's Heroes","Black Sheep","Combat"], correct: 0 },
  { question: "What 90s sitcom features Kramer?", choices: ["Seinfeld","Friends","Frasier","Mad About You"], correct: 0 },
  { question: "What 1988-97 sitcom set in Roseanne's home?", choices: ["Roseanne","Home Improvement","Married with Children","Family Matters"], correct: 0 },
  { question: "What 1989-2010 Bart and Homer cartoon?", choices: ["The Simpsons","Family Guy","South Park","King of the Hill"], correct: 0 },
  { question: "What 1999-present animated sitcom?", choices: ["Family Guy","South Park","Simpsons","King of the Hill"], correct: 0 },
  { question: "What 2005-present US version of British sitcom?", choices: ["The Office","Parks and Rec","Brooklyn 99","Community"], correct: 0 },
  { question: "Who's the boss of Dunder Mifflin Scranton?", choices: ["Michael Scott","Andy Bernard","Dwight (briefly)","All have been"], correct: 3 },
  { question: "What 2013-21 sitcom features 99th precinct?", choices: ["Brooklyn Nine-Nine","Police Academy","Brooklyn 99","Both Brooklyn 99 and B99"], correct: 3 },
  { question: "What 2009-15 sitcom set at community college?", choices: ["Community","Greendale","Both","Parks"], correct: 0 },
  { question: "What 1990s NYC sitcom features Will Truman?", choices: ["Will & Grace","Seinfeld","Friends","Sex and the City"], correct: 0 },
  { question: "What 1998-2004 HBO sitcom about NY women?", choices: ["Sex and the City","Girls","Veep","Gossip Girl"], correct: 0 },
  { question: "What 90s sitcom features 4 women in Miami?", choices: ["The Golden Girls","Designing Women","Living Single","Sex and the City"], correct: 0 },
  { question: "Who plays Dorothy in Golden Girls?", choices: ["Bea Arthur","Betty White (Rose)","Both","Just Bea"], correct: 0 },
  { question: "What 1971-79 family sitcom features Mary Tyler Moore?", choices: ["The Mary Tyler Moore Show","Rhoda","Phyllis","All MTM Productions"], correct: 0 },
  { question: "What 50s sitcom is I Love Lucy?", choices: ["1951-57","1955-65","1948-58","1960-65"], correct: 0 },
  { question: "Who plays Lucy in I Love Lucy?", choices: ["Lucille Ball","Vivian Vance","Both","Just Ball"], correct: 0 },
  { question: "What 80s sitcom features Sam Malone bartender?", choices: ["Cheers","Frasier","Wings","Norm"], correct: 0 },
  { question: "What's the spinoff featuring Frasier Crane?", choices: ["Frasier","Wings","Becker","Just Crane"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TvSitcomsQuizSettings): TvSitcomsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TvSitcomsQuizState, action: TvSitcomsQuizAction): TvSitcomsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TvSitcomsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
