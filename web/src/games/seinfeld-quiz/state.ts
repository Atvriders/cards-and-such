import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SeinfeldSettings { questions: "10" | "20" | "30"; }
export interface SeinfeldState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SeinfeldAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What city is Seinfeld set in?", choices: ["New York","Los Angeles","Chicago","Boston"], correct: 0 },
  { question: "Who plays Jerry Seinfeld?", choices: ["Jerry Seinfeld","Jason Alexander","Michael Richards","Larry David"], correct: 0 },
  { question: "Who plays George Costanza?", choices: ["Jason Alexander","Jerry Seinfeld","Michael Richards","Wayne Knight"], correct: 0 },
  { question: "Who plays Elaine Benes?", choices: ["Julia Louis-Dreyfus","Jerry Seinfeld","Estelle Harris","Heidi Swedberg"], correct: 0 },
  { question: "Who plays Kramer?", choices: ["Michael Richards","Jason Alexander","Wayne Knight","Larry David"], correct: 0 },
  { question: "What is Kramer's first name?", choices: ["Cosmo","Stanley","Bob","Frank"], correct: 0 },
  { question: "What is George's go-to fake job?", choices: ["Architect","Marine biologist","Latex salesman","Importer/exporter"], correct: 0 },
  { question: "Who is Newman?", choices: ["A postal worker","A doorman","A cab driver","A lawyer"], correct: 0 },
  { question: "What does Jerry say is the master of his domain?", choices: ["His self-control","His apartment","His car","His career"], correct: 0 },
  { question: "What sitcom-within-the-sitcom do Jerry and George pitch to NBC?", choices: ["Jerry","Seinfeld","The Pitch","About Nothing"], correct: 0 },
  { question: "Who is George's fiancée who dies from licking envelopes?", choices: ["Susan Ross","Marla","Sheila","Allison"], correct: 0 },
  { question: "What is the Soup Nazi's catchphrase?", choices: ["No soup for you!","Get out!","Move along!","Next!"], correct: 0 },
  { question: "Who plays Frank Costanza?", choices: ["Jerry Stiller","Barney Martin","Wayne Knight","Phil Morris"], correct: 0 },
  { question: "What is Frank Costanza's invented holiday?", choices: ["Festivus","Kwanza Eve","Festival","Costanzamas"], correct: 0 },
  { question: "What dance does Elaine famously do?", choices: ["The thumb-pumping flop","The robot","The shimmy","The macarena"], correct: 0 },
  { question: "Who is Jackie Chiles?", choices: ["A flamboyant lawyer","A judge","A doctor","A cop"], correct: 0 },
  { question: "What does Kramer slide through Jerry's door doing?", choices: ["Bursts in","Knocks politely","Calls first","Rings the bell"], correct: 0 },
  { question: "Where does George park to avoid paying?", choices: ["Handicapped spot","Driveway","Garage","Street"], correct: 0 },
  { question: "What is the name of Jerry's nemesis comedian friend?", choices: ["Kenny Bania","Bob Sacamano","Lloyd Braun","Mickey Abbott"], correct: 0 },
  { question: "What food does Bania think is gold, Jerry?", choices: ["Soup","Cake","Pizza","Chicken"], correct: 0 },
  { question: "What is Elaine's boss J. Peterman's catalog famous for?", choices: ["Adventurous tales","Sports gear","Cheap deals","Kids' clothes"], correct: 0 },
  { question: "Who is Mr. Pitt?", choices: ["Elaine's eccentric boss","George's boss","Jerry's neighbor","Kramer's friend"], correct: 0 },
  { question: "In what episode does Kramer become an underwear model?", choices: ["The Calzone","The Pick","The Smelly Car","The Sniffing Accountant"], correct: 0 },
  { question: "What is the name of the diner where they meet?", choices: ["Monk's Cafe","Tom's Restaurant","Reggie's","Joe's Diner"], correct: 0 },
  { question: "Who created Seinfeld with Jerry?", choices: ["Larry David","Jason Alexander","Michael Richards","Mel Brooks"], correct: 0 },
  { question: "What does Kramer set on fire (his apartment)?", choices: ["A Cuban cigar fiasco","A toaster","A candle","A stove"], correct: 0 },
  { question: "What is George's favorite explanation when caught lying?", choices: ["It's not a lie if you believe it","I was framed","It wasn't me","Newman did it"], correct: 0 },
  { question: "What is Elaine's signature exclamation?", choices: ["Get out!","No way!","Yada yada","Serenity now"], correct: 0 },
  { question: "Who says 'Serenity now'?", choices: ["Frank Costanza","George","Jerry","Kramer"], correct: 0 },
  { question: "How many seasons did Seinfeld run?", choices: ["9","7","10","8"], correct: 0 },
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
