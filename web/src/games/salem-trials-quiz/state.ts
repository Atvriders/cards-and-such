import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SalemTrialsQuizSettings { questions: "10" | "20" | "30"; }
export interface SalemTrialsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SalemTrialsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Salem Witch Trials took place in?", choices: ["1620","1692","1720","1776"], correct: 1 },
  { question: "Salem is in which colony/state?", choices: ["Connecticut","Massachusetts","Rhode Island","Virginia"], correct: 1 },
  { question: "How many people were executed?", choices: ["10","20","50","100"], correct: 1 },
  { question: "The first 'afflicted' girls included?", choices: ["Betty Parris","Anne Hutchinson","Sarah Good","All Anne and Sarah"], correct: 0 },
  { question: "Tituba was?", choices: ["Judge","Enslaved woman in Parris home","Minister","Sheriff"], correct: 1 },
  { question: "Reverend Samuel Parris was?", choices: ["Salem judge","Salem Village minister","Boston governor","Massachusetts attorney"], correct: 1 },
  { question: "Spectral evidence refers to?", choices: ["Physical bodies","Dreams/visions of accuser","Ghost sightings","Witch marks"], correct: 1 },
  { question: "Giles Corey was killed by?", choices: ["Hanging","Pressing with stones","Drowning","Burning"], correct: 1 },
  { question: "Most accused were executed by?", choices: ["Burning","Hanging","Beheading","Drowning"], correct: 1 },
  { question: "The Court of Oyer and Terminer was created in?", choices: ["1692","1693","1694","1700"], correct: 0 },
  { question: "Judge Samuel Sewall later?", choices: ["Joined the witches","Apologized publicly","Fled","Died at trial"], correct: 1 },
  { question: "Cotton Mather wrote about witchcraft in?", choices: ["The Crucible","Wonders of the Invisible World","Magnalia","Dictionary"], correct: 1 },
  { question: "Bridget Bishop was the first?", choices: ["Accused","Executed","Acquitted","Released"], correct: 1 },
  { question: "The trials ended primarily because?", choices: ["Governor Phips dissolved court","People got bored","King intervened","Ministers were silent"], correct: 0 },
  { question: "Sarah Good was?", choices: ["A judge","An accused beggar","A minister's wife","A Native American"], correct: 1 },
  { question: "The Crucible is a play by?", choices: ["Eugene O'Neill","Arthur Miller","Tennessee Williams","Edward Albee"], correct: 1 },
  { question: "The Crucible was written in?", choices: ["1932","1953","1972","1992"], correct: 1 },
  { question: "Salem Village is now called?", choices: ["Salem","Danvers","Beverly","Peabody"], correct: 1 },
  { question: "The Witch House (still standing) was the home of?", choices: ["Judge Hathorne","Judge Corwin","Rev Parris","Cotton Mather"], correct: 1 },
  { question: "Most of the accused were?", choices: ["Men","Women","Children","Slaves"], correct: 1 },
  { question: "George Burroughs was?", choices: ["A judge","A former Salem minister, hanged","A doctor","A merchant"], correct: 1 },
  { question: "Rebecca Nurse was?", choices: ["Young accuser","Elderly executed woman","Judge","Sheriff"], correct: 1 },
  { question: "The 'witch cake' was?", choices: ["Snack","Magic ritual to find witches","Last meal","Wedding cake"], correct: 1 },
  { question: "Massachusetts officially exonerated some accused in?", choices: ["1700","1711","1957","All true (1711, 1957, 2001)"], correct: 3 },
  { question: "Spectral evidence was eventually?", choices: ["Required","Accepted","Banned","Doubled"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SalemTrialsQuizSettings): SalemTrialsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SalemTrialsQuizState, action: SalemTrialsQuizAction): SalemTrialsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SalemTrialsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
