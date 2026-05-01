import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CivilRightsQuizSettings { questions: "10" | "20" | "30"; }
export interface CivilRightsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CivilRightsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "\"I Have a Dream\" speaker?", choices: ["MLK", "Malcolm X", "Parks", "Lewis"], correct: 0 },
  { question: "\"I Have a Dream\" year?", choices: ["1955", "1963", "1968", "1972"], correct: 1 },
  { question: "March on Washington site?", choices: ["Capitol", "Lincoln Memorial", "White House", "Mall"], correct: 1 },
  { question: "Rosa Parks refused to give up her?", choices: ["Job", "Bus seat", "Vote", "House"], correct: 1 },
  { question: "Montgomery Bus Boycott year?", choices: ["1955", "1960", "1963", "1965"], correct: 0 },
  { question: "MLK was assassinated in?", choices: ["Atlanta", "Memphis", "Selma", "Birmingham"], correct: 1 },
  { question: "MLK assassination year?", choices: ["1963", "1965", "1968", "1972"], correct: 2 },
  { question: "Malcolm X was assassinated in?", choices: ["1963", "1965", "1968", "1972"], correct: 1 },
  { question: "Malcolm X belonged to?", choices: ["NAACP", "SCLC", "Nation of Islam", "SNCC"], correct: 2 },
  { question: "Civil Rights Act signed by?", choices: ["JFK", "LBJ", "Nixon", "Carter"], correct: 1 },
  { question: "Civil Rights Act year?", choices: ["1957", "1964", "1968", "1972"], correct: 1 },
  { question: "Voting Rights Act year?", choices: ["1964", "1965", "1968", "1971"], correct: 1 },
  { question: "Selma to Montgomery march led by?", choices: ["Malcolm X", "MLK", "Parks", "Carmichael"], correct: 1 },
  { question: "\"Bloody Sunday\" took place in?", choices: ["Selma", "Birmingham", "Memphis", "Atlanta"], correct: 0 },
  { question: "SCLC stands for?", choices: ["Southern Christian Leadership Conference", "Student Civil Liberties Committee", "Southern Civil League", "State Civil Liberties Council"], correct: 0 },
  { question: "NAACP founded in?", choices: ["1909", "1920", "1955", "1963"], correct: 0 },
  { question: "Brown v. Board year?", choices: ["1948", "1954", "1960", "1965"], correct: 1 },
  { question: "Brown v. Board ended?", choices: ["Slavery", "School segregation", "Poll taxes", "Jim Crow signs"], correct: 1 },
  { question: "Thurgood Marshall later became?", choices: ["President", "Senator", "Supreme Court Justice", "Governor"], correct: 2 },
  { question: "Little Rock Nine integrated in?", choices: ["1955", "1957", "1960", "1963"], correct: 1 },
  { question: "Freedom Riders challenged?", choices: ["Bus segregation", "School segregation", "Poll taxes", "Voting laws"], correct: 0 },
  { question: "Greensboro sit-ins were at?", choices: ["Woolworth", "Walmart", "Sears", "Kresge"], correct: 0 },
  { question: "John Lewis led which group?", choices: ["NAACP", "SNCC", "SCLC", "CORE"], correct: 1 },
  { question: "Medgar Evers was killed in?", choices: ["Mississippi", "Alabama", "Georgia", "Tennessee"], correct: 0 },
  { question: "\"Letter from Birmingham Jail\" by?", choices: ["Malcolm X", "MLK", "Parks", "Lewis"], correct: 1 },
  { question: "Stokely Carmichael popularized?", choices: ["\"I Have a Dream\"", "\"Black Power\"", "\"We Shall Overcome\"", "\"Yes We Can\""], correct: 1 },
  { question: "Black Panther Party founded in?", choices: ["Harlem", "Oakland", "Chicago", "Atlanta"], correct: 1 },
  { question: "Huey Newton co-founded?", choices: ["SNCC", "Black Panthers", "SCLC", "Nation of Islam"], correct: 1 },
  { question: "Fair Housing Act year?", choices: ["1964", "1965", "1968", "1972"], correct: 2 },
  { question: "First African-American Supreme Court Justice?", choices: ["Marshall", "Thomas", "Jackson", "Bell"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CivilRightsQuizSettings): CivilRightsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CivilRightsQuizState, action: CivilRightsQuizAction): CivilRightsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CivilRightsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
