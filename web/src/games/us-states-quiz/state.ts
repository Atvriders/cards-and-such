import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface UsStatesQuizSettings { questions: "10" | "20" | "30"; }
export interface UsStatesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type UsStatesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which state is known as the Sunshine State?", choices: ["Texas","Florida","California","Arizona"], correct: 1 },
  { question: "Which is the largest U.S. state by area?", choices: ["Texas","California","Alaska","Montana"], correct: 2 },
  { question: "Which state has the smallest area?", choices: ["Delaware","Connecticut","Rhode Island","New Jersey"], correct: 2 },
  { question: "Which state is nicknamed the Lone Star State?", choices: ["Oklahoma","Texas","New Mexico","Arizona"], correct: 1 },
  { question: "Which state is the only one made entirely of islands?", choices: ["Hawaii","Florida","Alaska","Rhode Island"], correct: 0 },
  { question: "What is the capital of California?", choices: ["Los Angeles","San Francisco","Sacramento","San Diego"], correct: 2 },
  { question: "Which state has the most counties?", choices: ["California","Georgia","Texas","Kentucky"], correct: 2 },
  { question: "Which state was the first to ratify the Constitution?", choices: ["Pennsylvania","Delaware","Virginia","New Jersey"], correct: 1 },
  { question: "Which state borders the most other states?", choices: ["Missouri","Tennessee","Kentucky","Both Missouri and Tennessee with 8"], correct: 3 },
  { question: "What is the capital of New York state?", choices: ["New York City","Buffalo","Albany","Syracuse"], correct: 2 },
  { question: "Which state is the Beehive State?", choices: ["Idaho","Utah","Nevada","Colorado"], correct: 1 },
  { question: "Which state is known as the Bluegrass State?", choices: ["Tennessee","Kentucky","West Virginia","Virginia"], correct: 1 },
  { question: "What state is the Mount Rushmore State?", choices: ["Wyoming","Montana","South Dakota","North Dakota"], correct: 2 },
  { question: "Which state is the Granite State?", choices: ["Vermont","Maine","Massachusetts","New Hampshire"], correct: 3 },
  { question: "What is the capital of Texas?", choices: ["Houston","Dallas","Austin","San Antonio"], correct: 2 },
  { question: "Which state is the Aloha State?", choices: ["Alaska","Hawaii","California","Florida"], correct: 1 },
  { question: "What is the capital of Illinois?", choices: ["Chicago","Springfield","Peoria","Rockford"], correct: 1 },
  { question: "Which state is the Peach State?", choices: ["Florida","Alabama","Georgia","South Carolina"], correct: 2 },
  { question: "Which state is nicknamed the Show Me State?", choices: ["Missouri","Mississippi","Michigan","Maine"], correct: 0 },
  { question: "What is the capital of Pennsylvania?", choices: ["Philadelphia","Pittsburgh","Harrisburg","Erie"], correct: 2 },
  { question: "Which state is the Hoosier State?", choices: ["Iowa","Illinois","Indiana","Ohio"], correct: 2 },
  { question: "What state is known as the Last Frontier?", choices: ["Montana","Wyoming","Alaska","North Dakota"], correct: 2 },
  { question: "Which state has Mardi Gras in New Orleans?", choices: ["Mississippi","Louisiana","Alabama","Texas"], correct: 1 },
  { question: "What is the capital of Massachusetts?", choices: ["Worcester","Springfield","Boston","Cambridge"], correct: 2 },
  { question: "Which state is the Empire State?", choices: ["California","Texas","New York","Florida"], correct: 2 },
  { question: "Which state is the Volunteer State?", choices: ["Tennessee","Kentucky","Alabama","Georgia"], correct: 0 },
  { question: "What is the capital of Arizona?", choices: ["Tucson","Phoenix","Mesa","Flagstaff"], correct: 1 },
  { question: "Which state is the Garden State?", choices: ["New Hampshire","New Jersey","Vermont","Connecticut"], correct: 1 },
  { question: "What is the capital of Washington state?", choices: ["Seattle","Tacoma","Olympia","Spokane"], correct: 2 },
  { question: "Which state was the 50th admitted to the Union?", choices: ["Alaska","Hawaii","Arizona","New Mexico"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: UsStatesQuizSettings): UsStatesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: UsStatesQuizState, action: UsStatesQuizAction): UsStatesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: UsStatesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
