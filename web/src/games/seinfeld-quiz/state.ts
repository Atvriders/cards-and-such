import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SeinfeldSettings { questions: "10" | "20" | "30"; }
export interface SeinfeldState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SeinfeldAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what city is Seinfeld set?", choices: ["New York","Boston","Chicago","Los Angeles"], correct: 0 },
  { question: "Who plays Jerry?", choices: ["Jerry Seinfeld","Jason Alexander","Michael Richards","Larry David"], correct: 0 },
  { question: "Who plays George Costanza?", choices: ["Jason Alexander","Jerry Seinfeld","Michael Richards","Wayne Knight"], correct: 0 },
  { question: "Who plays Kramer?", choices: ["Michael Richards","Jason Alexander","Wayne Knight","Larry David"], correct: 0 },
  { question: "Who plays Elaine Benes?", choices: ["Julia Louis-Dreyfus","Lori Loughlin","Marisa Tomei","Susan Sullivan"], correct: 0 },
  { question: "What's Kramer's first name?", choices: ["Cosmo","Jerry","Newman","Frank"], correct: 0 },
  { question: "What's Jerry's apartment number?", choices: ["5A","9D","3C","11B"], correct: 0 },
  { question: "What's George's father's name?", choices: ["Frank","Estelle (mother)","Both","Just Frank"], correct: 0 },
  { question: "Who plays Frank Costanza?", choices: ["Jerry Stiller","Lloyd Bridges","Phil Bruns (early)","Both Stiller and Bruns"], correct: 3 },
  { question: "What's George's go-to lie about his profession?", choices: ["Architect","Marine biologist","Importer/exporter","All used"], correct: 3 },
  { question: "What's Newman's job?", choices: ["Postal worker","Cab driver","Lawyer","Doorman"], correct: 0 },
  { question: "Who plays Newman?", choices: ["Wayne Knight","Larry David (voice)","Both","Just Knight"], correct: 0 },
  { question: "What's the famous soup episode?", choices: ["The Soup Nazi","No Soup For You","Both names","Just Soup Nazi"], correct: 2 },
  { question: "What's the line from Soup Nazi?", choices: ["No soup for you!","Move along!","Next!","All used"], correct: 3 },
  { question: "What's the master of his domain?", choices: ["The Contest (about masturbation)","Stand-up","Bro","Manhood"], correct: 0 },
  { question: "What's Festivus?", choices: ["For the rest of us (Costanza family holiday)","Christmas","Hanukkah","All-purpose"], correct: 0 },
  { question: "What's Festivus's pole?", choices: ["Aluminum pole (no decorations)","Christmas pole","Same","Just pole"], correct: 0 },
  { question: "What's the Airing of Grievances?", choices: ["Festivus tradition","Family meeting","Both","Just Festivus"], correct: 2 },
  { question: "What's George's fiancee who died from poisonous envelopes?", choices: ["Susan","Marcy","Lori","Mona"], correct: 0 },
  { question: "What's Elaine's signature dance?", choices: ["Bizarre dance","Awful dance","Both","Just bad"], correct: 2 },
  { question: "What's Yada yada yada from?", choices: ["Seinfeld episode","Both said by characters","The Yada Yada","Both"], correct: 2 },
  { question: "Who is J. Peterman?", choices: ["Elaine's boss","Jerry's friend","Kramer's friend","George's boss"], correct: 0 },
  { question: "What's Jerry's car?", choices: ["BMW","Saab","Volkswagen","Mercedes"], correct: 0 },
  { question: "What's Kramer's frequent way of entering Jerry's?", choices: ["Sliding through door","Knocking","Yelling","All variations"], correct: 0 },
  { question: "What's Pez dispenser episode?", choices: ["The Pez Dispenser","The Wig Master","The Boyfriend","Just Pez"], correct: 0 },
  { question: "What's the show within the show?", choices: ["Jerry","The show about nothing","Both","Just Jerry"], correct: 0 },
  { question: "How many seasons did Seinfeld run?", choices: ["9","10","8","12"], correct: 0 },
  { question: "What years did Seinfeld air?", choices: ["1989-98","1990-99","1991-2000","1988-97"], correct: 0 },
  { question: "Who created Seinfeld?", choices: ["Larry David and Jerry Seinfeld","Just Jerry","Just Larry","Mike Judge"], correct: 0 },
  { question: "What follows Larry David from Seinfeld?", choices: ["Curb Your Enthusiasm","Veep","Mad About You","Wonder Years"], correct: 0 },
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
