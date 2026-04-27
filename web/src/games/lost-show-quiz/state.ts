import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LostShowSettings { questions: "10" | "20" | "30"; }
export interface LostShowState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LostShowAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "LOST creators include?", choices: ["JJ Abrams & Damon Lindelof","Joss Whedon","Vince Gilligan","JJ Abrams alone"], correct: 0 },
  { question: "Flight number?", choices: ["815","316","404","180"], correct: 0 },
  { question: "Airline of the crash?", choices: ["Oceanic","Pan Am","Delta","Hawaiian"], correct: 0 },
  { question: "The famous numbers?", choices: ["4 8 15 16 23 42","1 2 3 4 5 6","7 13 21 28 35 42","5 10 15 20 25 30"], correct: 0 },
  { question: "Jack's profession?", choices: ["Spinal surgeon","Dentist","Lawyer","Pilot"], correct: 0 },
  { question: "Jack's actor?", choices: ["Matthew Fox","Josh Holloway","Naveen Andrews","Terry O'Quinn"], correct: 0 },
  { question: "Sawyer's real name?", choices: ["James Ford","Sawyer","John","Tom"], correct: 0 },
  { question: "Locke's actor?", choices: ["Terry O'Quinn","Naveen Andrews","Henry Ian Cusick","Matt"], correct: 0 },
  { question: "Smoke monster's identity?", choices: ["Man in Black","Jacob","Locke","Ben"], correct: 0 },
  { question: "Hatch button must be pressed every?", choices: ["108 minutes","60 minutes","24 hours","10 minutes"], correct: 0 },
  { question: "Hurley's lottery winnings?", choices: ["$156 million","$10 million","$50 million","$1 million"], correct: 0 },
  { question: "Kate's last name?", choices: ["Austen","Smith","Jones","Black"], correct: 0 },
  { question: "Show ran how many seasons?", choices: ["6","5","7","8"], correct: 0 },
  { question: "Final episode aired in?", choices: ["2010","2009","2011","2012"], correct: 0 },
  { question: "The Others' leader?", choices: ["Ben Linus","Jacob","Tom","Richard"], correct: 0 },
  { question: "The Dharma Initiative is?", choices: ["Research project","Cult","Airline","Police"], correct: 0 },
  { question: "Polar bear on the island?", choices: ["Yes","No","In a dream","Once"], correct: 0 },
  { question: "Charlie's band?", choices: ["Drive Shaft","Drive On","Lost Crew","Crash"], correct: 0 },
  { question: "Sun and Jin are from?", choices: ["Korea","Japan","China","Vietnam"], correct: 0 },
  { question: "Sayid was in?", choices: ["Iraqi Republican Guard","US Army","British Army","Police"], correct: 0 },
  { question: "Walt's father?", choices: ["Michael","John","Charlie","Tom"], correct: 0 },
  { question: "Vincent is a?", choices: ["Dog","Cat","Bird","Boar"], correct: 0 },
  { question: "Jacob lives in?", choices: ["Statue/foot","Hatch","Beach","Cave"], correct: 0 },
  { question: "Penny's father?", choices: ["Charles Widmore","Ben","Jacob","Locke"], correct: 0 },
  { question: "Desmond's catchphrase?", choices: ["Brother","Mate","Hi","Yo"], correct: 0 },
  { question: "Network?", choices: ["ABC","NBC","CBS","FOX"], correct: 0 },
  { question: "Pilot episode aired in?", choices: ["2004","2003","2005","2006"], correct: 0 },
  { question: "The Island can move?", choices: ["Yes (S5)","No","Maybe","Once"], correct: 0 },
  { question: "Final scene takes place at?", choices: ["Church","Beach","Plane","Hatch"], correct: 0 },
  { question: "Live together, die?", choices: ["Alone","Together","Free","Strong"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: LostShowSettings): LostShowState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LostShowState, action: LostShowAction): LostShowState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LostShowState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
