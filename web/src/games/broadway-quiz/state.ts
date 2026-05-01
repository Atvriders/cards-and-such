import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BroadwayQuizSettings { questions: "10" | "20" | "30"; }
export interface BroadwayQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BroadwayQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Where is Broadway located?", choices: ["New York City","Chicago","London","Boston"], correct: 0 },
  { question: "What is the Broadway theater district called?", choices: ["Theatre District / Times Square area","SoHo","Greenwich Village","Tribeca"], correct: 0 },
  { question: "Who wrote Hamilton?", choices: ["Lin-Manuel Miranda","Stephen Sondheim","Andrew Lloyd Webber","Tim Rice"], correct: 0 },
  { question: "In what year did Hamilton open on Broadway?", choices: ["2015","2010","2017","2013"], correct: 0 },
  { question: "What musical features the song Memory?", choices: ["Cats","Phantom","Les Mis","Chess"], correct: 0 },
  { question: "Who composed Cats?", choices: ["Andrew Lloyd Webber","Tim Rice","Stephen Sondheim","Cy Coleman"], correct: 0 },
  { question: "What musical features The Phantom of the Opera?", choices: ["The Phantom of the Opera","Cats","Sunset Boulevard","Aspects of Love"], correct: 0 },
  { question: "What's the longest-running Broadway show?", choices: ["The Phantom of the Opera","Cats","Chicago","Lion King"], correct: 0 },
  { question: "What musical is set in Argentina with Don't Cry for Me Argentina?", choices: ["Evita","Chicago","Cabaret","Chess"], correct: 0 },
  { question: "What musical features Defying Gravity?", choices: ["Wicked","Chicago","Hamilton","Mamma Mia"], correct: 0 },
  { question: "Who wrote Wicked?", choices: ["Stephen Schwartz","Stephen Sondheim","Andrew Lloyd Webber","Lin-Manuel Miranda"], correct: 0 },
  { question: "What 1957 musical features the Jets and Sharks?", choices: ["West Side Story","Grease","Chicago","Hairspray"], correct: 0 },
  { question: "Who composed West Side Story?", choices: ["Leonard Bernstein","Stephen Sondheim (lyrics)","Both","Just Bernstein"], correct: 2 },
  { question: "What musical features Seasons of Love?", choices: ["Rent","Aida","Wicked","Hamilton"], correct: 0 },
  { question: "Who wrote Rent?", choices: ["Jonathan Larson","Stephen Schwartz","Sondheim","Webber"], correct: 0 },
  { question: "What award is the highest Broadway honor?", choices: ["Tony Award","Oscar","Emmy","Golden Globe"], correct: 0 },
  { question: "What musical is based on Victor Hugo's novel?", choices: ["Les Miserables","Phantom","Notre Dame de Paris","Both Les Mis and Notre Dame"], correct: 3 },
  { question: "What's Annie's signature song?", choices: ["Tomorrow","Hard Knock Life","Both","Maybe"], correct: 2 },
  { question: "What musical features New York New York?", choices: ["On the Town","Wonderful Town","Both - songs","Different shows"], correct: 0 },
  { question: "What 2003 musical featured the song Popular?", choices: ["Wicked","Avenue Q","Hairspray","Spamalot"], correct: 0 },
  { question: "What musical features Big Spender?", choices: ["Sweet Charity","Chicago","Cabaret","Sweet Charity"], correct: 0 },
  { question: "What musical features Don't Rain on My Parade?", choices: ["Funny Girl","Annie","Mame","Hello Dolly"], correct: 0 },
  { question: "What musical includes Cell Block Tango?", choices: ["Chicago","Cabaret","Sweet Charity","Pippin"], correct: 0 },
  { question: "What 1975 Sondheim musical is about marriage?", choices: ["Company","Follies","A Little Night Music","Sweeney Todd"], correct: 0 },
  { question: "Who composed Sweeney Todd?", choices: ["Stephen Sondheim","Lin-Manuel Miranda","Bernstein","Webber"], correct: 0 },
  { question: "What musical features Climb Every Mountain?", choices: ["The Sound of Music","South Pacific","Camelot","Carousel"], correct: 0 },
  { question: "Who composed The Sound of Music?", choices: ["Rodgers and Hammerstein","Lerner and Loewe","Sondheim","Bernstein"], correct: 0 },
  { question: "What's a Tony Award?", choices: ["Antoinette Perry Award","Theatre Olympics","Both","Just Tony Perry"], correct: 0 },
  { question: "What 1957 musical first integrated dance into plot?", choices: ["West Side Story","Oklahoma! (1943 actually)","Chicago","Cabaret"], correct: 1 },
  { question: "What's an Off-Broadway show?", choices: ["Smaller theater (100-499 seats)","Out of NY","Both","Touring"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BroadwayQuizSettings): BroadwayQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BroadwayQuizState, action: BroadwayQuizAction): BroadwayQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BroadwayQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
