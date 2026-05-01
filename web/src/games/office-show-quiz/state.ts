import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OfficeShowSettings { questions: "10" | "20" | "30"; }
export interface OfficeShowState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OfficeShowAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What city is The Office (US) set in?", choices: ["Scranton","Stamford","Buffalo","Utica"], correct: 0 },
  { question: "What state is Scranton in?", choices: ["Pennsylvania","New York","New Jersey","Ohio"], correct: 0 },
  { question: "What is the company called?", choices: ["Dunder Mifflin","Vance Refrigeration","Schrute Farms","Sabre"], correct: 0 },
  { question: "What does Dunder Mifflin sell?", choices: ["Paper","Office supplies (paper)","Both","Just paper"], correct: 2 },
  { question: "Who is the regional manager initially?", choices: ["Michael Scott","Andy Bernard","Robert California","Dwight"], correct: 0 },
  { question: "Who plays Michael Scott?", choices: ["Steve Carell","Rainn Wilson","John Krasinski","Ed Helms"], correct: 0 },
  { question: "Who plays Dwight Schrute?", choices: ["Rainn Wilson","Steve Carell","John Krasinski","Ed Helms"], correct: 0 },
  { question: "Who plays Jim Halpert?", choices: ["John Krasinski","Steve Carell","Rainn Wilson","Ed Helms"], correct: 0 },
  { question: "Who plays Pam Beesly?", choices: ["Jenna Fischer","Mindy Kaling","Angela Kinsey","Ellie Kemper"], correct: 0 },
  { question: "What's Dwight's farm?", choices: ["Schrute Farms (beet farm)","Beet ranch","Both","Just farm"], correct: 2 },
  { question: "What does Dwight farm primarily?", choices: ["Beets","Corn","Wheat","Grapes"], correct: 0 },
  { question: "What's Jim and Pam's daughter's name?", choices: ["Cece","Phillip","Both","Just Cece"], correct: 2 },
  { question: "What's Jim and Pam's son?", choices: ["Phillip","Cece","Roy","Tucker"], correct: 0 },
  { question: "What's Andy Bernard's a cappella group called?", choices: ["Here Comes Treble","The Treblemakers","Pitch Perfect","Glee Club"], correct: 0 },
  { question: "What's Kelly Kapoor's job?", choices: ["Customer service","Reception","Sales","Accounting"], correct: 0 },
  { question: "Who plays Andy Bernard?", choices: ["Ed Helms","John Krasinski","Steve Carell","B.J. Novak"], correct: 0 },
  { question: "Who plays Ryan Howard?", choices: ["B.J. Novak","Ed Helms","John Krasinski","Mindy Kaling"], correct: 0 },
  { question: "What episode is Dinner Party?", choices: ["Season 4","Season 3","Season 5","Season 2"], correct: 0 },
  { question: "What's Michael's improv group?", choices: ["Just kidding - improv class","Just an improv class","Both","No name"], correct: 1 },
  { question: "What's Stanley Hudson catchphrase?", choices: ["Did I stutter?","Pretzel day","Both","Where the white women at"], correct: 2 },
  { question: "What special day was Pretzel Day?", choices: ["Free pretzels in lobby","Stanley loves it","Both","Annual"], correct: 2 },
  { question: "What's Michael's love interest who left for NY?", choices: ["Holly Flax","Jan Levinson","Both have been","Just Holly"], correct: 2 },
  { question: "What's Jan Levinson's child?", choices: ["Astrid","Cece","Phillip","Tom"], correct: 0 },
  { question: "Who plays Holly Flax?", choices: ["Amy Ryan","Catherine Tate","Rashida Jones","Ellie Kemper"], correct: 0 },
  { question: "What's Threat Level Midnight?", choices: ["Michael's screenplay","Andy's project","Jim's idea","Stanley's"], correct: 0 },
  { question: "Who is Michael's character in Threat Level Midnight?", choices: ["Michael Scarn","Michael Klump","Michael Scott","Just Michael"], correct: 0 },
  { question: "What's Creed's job description?", choices: ["Quality assurance","Sales","Reception","Accountant"], correct: 0 },
  { question: "What's Toby's job?", choices: ["Human resources","Sales","Manager","Receptionist"], correct: 0 },
  { question: "What documentary crew made the Office?", choices: ["A fictional documentary crew","Real one","Both","No crew shown"], correct: 0 },
  { question: "What's the British original?", choices: ["The Office (UK)","Same name","British version aired 2001-03","Both"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OfficeShowSettings): OfficeShowState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OfficeShowState, action: OfficeShowAction): OfficeShowState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OfficeShowState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
