import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface UsStatesQuizSettings { questions: "10" | "20" | "30"; }
export interface UsStatesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type UsStatesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Capital of California?", choices: ["Los Angeles","Sacramento","San Francisco","San Diego"], correct: 1 },
  { question: "Capital of Texas?", choices: ["Houston","Dallas","Austin","San Antonio"], correct: 2 },
  { question: "Capital of New York?", choices: ["New York City","Buffalo","Albany","Rochester"], correct: 2 },
  { question: "Capital of Florida?", choices: ["Miami","Orlando","Tallahassee","Jacksonville"], correct: 2 },
  { question: "Capital of Illinois?", choices: ["Chicago","Springfield","Peoria","Rockford"], correct: 1 },
  { question: "Capital of Pennsylvania?", choices: ["Philadelphia","Pittsburgh","Harrisburg","Erie"], correct: 2 },
  { question: "Capital of Ohio?", choices: ["Cleveland","Columbus","Cincinnati","Toledo"], correct: 1 },
  { question: "Capital of Georgia?", choices: ["Atlanta","Savannah","Augusta","Macon"], correct: 0 },
  { question: "Nickname of Texas?", choices: ["Sunshine State","Lone Star State","Empire State","Golden State"], correct: 1 },
  { question: "Nickname of California?", choices: ["Buckeye State","Golden State","Pelican State","Hoosier State"], correct: 1 },
  { question: "Nickname of New York?", choices: ["Bay State","Empire State","Garden State","Show Me State"], correct: 1 },
  { question: "Nickname of Florida?", choices: ["Sunshine State","Sooner State","Tar Heel State","Beaver State"], correct: 0 },
  { question: "Abbreviation for Massachusetts?", choices: ["MS","MA","MT","ME"], correct: 1 },
  { question: "Abbreviation for Mississippi?", choices: ["MS","MI","MO","MN"], correct: 0 },
  { question: "Abbreviation for Michigan?", choices: ["MC","MG","MI","MH"], correct: 2 },
  { question: "Abbreviation for Minnesota?", choices: ["MN","MS","MT","MA"], correct: 0 },
  { question: "Capital of Massachusetts?", choices: ["Boston","Worcester","Cambridge","Springfield"], correct: 0 },
  { question: "Capital of Washington (state)?", choices: ["Seattle","Spokane","Olympia","Tacoma"], correct: 2 },
  { question: "Capital of Oregon?", choices: ["Portland","Eugene","Salem","Bend"], correct: 2 },
  { question: "Capital of Arizona?", choices: ["Tucson","Phoenix","Mesa","Flagstaff"], correct: 1 },
  { question: "Capital of Colorado?", choices: ["Denver","Colorado Springs","Boulder","Aurora"], correct: 0 },
  { question: "Capital of Nevada?", choices: ["Las Vegas","Reno","Carson City","Henderson"], correct: 2 },
  { question: "Capital of Hawaii?", choices: ["Honolulu","Hilo","Kailua","Kaneohe"], correct: 0 },
  { question: "Capital of Alaska?", choices: ["Anchorage","Fairbanks","Juneau","Sitka"], correct: 2 },
  { question: "Capital of Montana?", choices: ["Billings","Bozeman","Helena","Missoula"], correct: 2 },
  { question: "Capital of Idaho?", choices: ["Boise","Idaho Falls","Pocatello","Twin Falls"], correct: 0 },
  { question: "Capital of Utah?", choices: ["Salt Lake City","Provo","Ogden","St. George"], correct: 0 },
  { question: "Capital of New Mexico?", choices: ["Albuquerque","Santa Fe","Las Cruces","Roswell"], correct: 1 },
  { question: "Capital of North Carolina?", choices: ["Charlotte","Raleigh","Greensboro","Asheville"], correct: 1 },
  { question: "Capital of South Carolina?", choices: ["Charleston","Columbia","Greenville","Myrtle Beach"], correct: 1 },
  { question: "Nickname of Indiana?", choices: ["Hoosier State","Buckeye State","Hawkeye State","Volunteer State"], correct: 0 },
  { question: "Nickname of Tennessee?", choices: ["Show Me State","Volunteer State","Tar Heel State","Sooner State"], correct: 1 },
  { question: "Abbreviation for Connecticut?", choices: ["CN","CO","CT","CC"], correct: 2 },
  { question: "Abbreviation for Colorado?", choices: ["CL","CO","CR","CD"], correct: 1 },
  { question: "Abbreviation for Wisconsin?", choices: ["WS","WI","WC","WN"], correct: 1 },
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
