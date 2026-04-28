import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MrBeanQuizSettings { questions: "10" | "20" | "30"; }
export interface MrBeanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MrBeanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who plays Mr Bean?", choices: ["Rowan Atkinson", "Hugh Laurie", "Eric Idle", "John Cleese"], correct: 0 },
  { question: "Year Mr Bean first aired?", choices: ["1988", "1990", "1992", "1994"], correct: 1 },
  { question: "Mr Bean's car is?", choices: ["Mini", "Reliant Robin (3-wheel)", "Ford Cortina", "Yellow Mini & Reliant"], correct: 3 },
  { question: "What color is Mr Bean's mini?", choices: ["Red", "Yellow", "Green", "Blue"], correct: 1 },
  { question: "Mr Bean's teddy bear is named?", choices: ["Teddy", "Bear", "Brown", "Just 'Teddy'"], correct: 3 },
  { question: "How many original Mr Bean episodes were made?", choices: ["10", "15", "20", "25"], correct: 1 },
  { question: "Mr Bean (1997) film grossed approximately?", choices: ["$50M", "$100M", "$250M", "$500M"], correct: 2 },
  { question: "Mr Bean's Holiday year?", choices: ["2005", "2007", "2009", "2011"], correct: 1 },
  { question: "Mr Bean's Holiday is set primarily in?", choices: ["France", "Spain", "Italy", "Germany"], correct: 0 },
  { question: "Atkinson studied what at Oxford?", choices: ["English", "Engineering", "Physics", "Drama"], correct: 1 },
  { question: "Animated Mr Bean series began in?", choices: ["2002", "2004", "2006", "2008"], correct: 0 },
  { question: "Mr Bean attended which royal wedding spoof?", choices: ["Charles & Diana", "Will & Kate", "Harry & Meghan", "Olympics 2012"], correct: 1 },
  { question: "Atkinson played Mr Bean at what major event in 2012?", choices: ["Royal Wedding", "Olympics opening", "Jubilee", "Brexit vote"], correct: 1 },
  { question: "What film series stars Atkinson as a bumbling spy?", choices: ["Johnny English", "Black Adder", "Mr Stink", "Tall Guy"], correct: 0 },
  { question: "Bean rarely speaks because?", choices: ["Voiceless", "Mute", "Only mumbles", "Silent comedy choice"], correct: 3 },
  { question: "Who often plays Bean's girlfriend Irma?", choices: ["Matilda Ziegler", "Sue Perkins", "Mel Smith", "Jane Asher"], correct: 0 },
  { question: "Bean's iconic intro shows him?", choices: ["Falling from sky", "Walking out of bath", "Riding car", "Eating sandwich"], correct: 0 },
  { question: "Bean's birthplace per the show is?", choices: ["Highbury", "Earth (joke)", "Manchester", "Liverpool"], correct: 1 },
  { question: "What does Bean fake on a Christmas turkey episode?", choices: ["His head in turkey", "Stuffs it", "Eats raw", "Sings to it"], correct: 0 },
  { question: "Bean's restaurant scene involves what dish?", choices: ["Steak tartare", "Spaghetti", "Snails", "Sushi"], correct: 0 },
  { question: "Mr Bean swimming pool gag involves?", choices: ["Diving board fear", "Jumping in", "Lost trunks", "Empty pool"], correct: 0 },
  { question: "Atkinson is known for which late-1980s sitcom?", choices: ["Blackadder", "Yes Minister", "Fawlty Towers", "Vicar of Dibley"], correct: 0 },
  { question: "Bean's apartment number is?", choices: ["12", "2", "3", "4"], correct: 0 },
  { question: "Mr Bean (1997) film co-stars who as a curator?", choices: ["Peter MacNicol", "Steve Martin", "Ben Stiller", "John Cleese"], correct: 0 },
  { question: "What painting does Bean ruin?", choices: ["Mona Lisa", "Whistler's Mother", "Starry Night", "Last Supper"], correct: 1 },
  { question: "Bean's signature look includes?", choices: ["Tweed jacket", "Striped tie", "Brown loafers", "All of these"], correct: 3 },
  { question: "Atkinson's other film roles include?", choices: ["Maigret", "Johnny English", "Both", "Bean only"], correct: 2 },
  { question: "Mr Bean's Holiday opens at what event?", choices: ["Church raffle", "Lottery draw", "Subway", "Pub"], correct: 0 },
  { question: "Year Atkinson received CBE?", choices: ["2003", "2009", "2013", "2016"], correct: 2 },
  { question: "Bean's comedy is most aligned with?", choices: ["Stand-up", "Slapstick/silent film", "Improv", "Sketch"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MrBeanQuizSettings): MrBeanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MrBeanQuizState, action: MrBeanQuizAction): MrBeanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MrBeanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
