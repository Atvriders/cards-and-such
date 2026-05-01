import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BillboardHitsQuizSettings { questions: "10" | "20" | "30"; }
export interface BillboardHitsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BillboardHitsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Billboard Hot 100 launched in what year?", choices: ["1953","1958","1965","1970"], correct: 1 },
  { question: "Which artist has the most #1 Hot 100 hits ever?", choices: ["Elvis Presley","Madonna","The Beatles","Mariah Carey"], correct: 2 },
  { question: "Lil Nas X's 'Old Town Road' set the record for weeks at #1 — how many?", choices: ["12","16","19","21"], correct: 2 },
  { question: "'One Sweet Day' held the longest #1 record (16 weeks) — by which artists?", choices: ["Mariah Carey & Boyz II Men","Whitney & Mariah","Elton John","Bee Gees"], correct: 0 },
  { question: "Which song was #1 on Christmas 1994 still topping charts decades later?", choices: ["Last Christmas","All I Want for Christmas Is You","Wonderful Christmas Time","Step Into Christmas"], correct: 1 },
  { question: "Who had the first #1 hit on the Hot 100 in 1958?", choices: ["Buddy Holly","Ricky Nelson","Tommy Edwards","Domenico Modugno"], correct: 3 },
  { question: "How many #1 hits did The Beatles have in 1964?", choices: ["3","4","5","6"], correct: 3 },
  { question: "Which boy band hit #1 in 1999 with 'I Want It That Way'?", choices: ["Boyzone","*NSYNC","Backstreet Boys","98 Degrees"], correct: 2 },
  { question: "Adele's 'Hello' was #1 for how many weeks in 2015?", choices: ["6","8","10","12"], correct: 2 },
  { question: "Drake holds a record for most weeks in top 10 — true or what?", choices: ["True","False","Tied with Beatles","Tied with Madonna"], correct: 0 },
  { question: "'Despacito' hit #1 in 2017 — featuring which guest?", choices: ["Pitbull","Justin Bieber","Drake","Maluma"], correct: 1 },
  { question: "Which BTS song was their first #1 in 2020?", choices: ["Boy with Luv","Dynamite","Butter","Permission to Dance"], correct: 1 },
  { question: "'I Will Always Love You' by Whitney Houston was #1 for how many weeks?", choices: ["10","12","14","16"], correct: 2 },
  { question: "Which '70s artist had four straight #1 albums and many #1 singles?", choices: ["Stevie Wonder","Elton John","Carole King","Donna Summer"], correct: 1 },
  { question: "Madonna's first Hot 100 #1 was?", choices: ["Material Girl","Like a Virgin","Holiday","Borderline"], correct: 1 },
  { question: "Which 'Old Town Road' guest helped extend its run?", choices: ["Lil Wayne","Billy Ray Cyrus","Diplo","Post Malone"], correct: 1 },
  { question: "Olivia Rodrigo's debut #1 was?", choices: ["Good 4 U","Drivers License","Deja Vu","Vampire"], correct: 1 },
  { question: "Which Mariah Carey song reclaimed #1 25 years after release?", choices: ["Hero","Vision of Love","All I Want for Christmas","Fantasy"], correct: 2 },
  { question: "The chart is published by Billboard magazine, founded in what year?", choices: ["1894","1908","1922","1955"], correct: 0 },
  { question: "Which Drake hit was his first solo #1?", choices: ["Hotline Bling","One Dance","God's Plan","In My Feelings"], correct: 2 },
  { question: "Mariah Carey's longest-running Hot 100 #1 (besides \"One Sweet Day\") is?", choices: ["Fantasy","We Belong Together","Hero","Always Be My Baby"], correct: 1 },
  { question: "Which artist had the most weeks at #1 in the 2010s?", choices: ["Taylor Swift","Drake","Bruno Mars","Mark Ronson"], correct: 1 },
  { question: "Cardi B's \"Bodak Yellow\" (2017) made her the first solo female rapper to hit #1 since?", choices: ["Lauryn Hill","Missy Elliott","Da Brat","Lil Kim"], correct: 0 },
  { question: "Harry Styles's first solo Hot 100 #1 was?", choices: ["Sign of the Times","Watermelon Sugar","As It Was","Adore You"], correct: 2 },
  { question: "\"Macarena\" topped the Hot 100 in?", choices: ["1995","1996","1997","1998"], correct: 1 },
  { question: "Glen Campbell's \"Rhinestone Cowboy\" hit #1 in?", choices: ["1973","1975","1977","1979"], correct: 1 },
  { question: "Taylor Swift's first Hot 100 #1 was?", choices: ["Shake It Off","We Are Never Ever Getting Back Together","Blank Space","Look What You Made Me Do"], correct: 1 },
  { question: "\"Blinding Lights\" by The Weeknd set a record for weeks in the top 10 — how many?", choices: ["43","45","57","60"], correct: 1 },
  { question: "Bruno Mars's \"Uptown Funk\" was #1 for how many weeks?", choices: ["10","12","14","16"], correct: 2 },
  { question: "Which Beatles single was #1 for 9 weeks in 1964?", choices: ["I Want to Hold Your Hand","Hey Jude","She Loves You","Can't Buy Me Love"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BillboardHitsQuizSettings): BillboardHitsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BillboardHitsQuizState, action: BillboardHitsQuizAction): BillboardHitsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BillboardHitsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
