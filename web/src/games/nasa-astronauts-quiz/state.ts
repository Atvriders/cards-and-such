import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NasaAstronautsQuizSettings { questions: "10" | "20" | "30"; }
export interface NasaAstronautsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NasaAstronautsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "First American in space?", choices: ["Glenn", "Shepard", "Grissom", "Cooper"], correct: 1 },
  { question: "First American to orbit Earth?", choices: ["Glenn", "Shepard", "Grissom", "Cooper"], correct: 0 },
  { question: "First man on Moon?", choices: ["Aldrin", "Armstrong", "Collins", "Bean"], correct: 1 },
  { question: "Second man on Moon?", choices: ["Aldrin", "Armstrong", "Collins", "Bean"], correct: 0 },
  { question: "Apollo 11's command module pilot?", choices: ["Aldrin", "Armstrong", "Collins", "Bean"], correct: 2 },
  { question: "Apollo 13 commander?", choices: ["Lovell", "Haise", "Swigert", "Conrad"], correct: 0 },
  { question: "\"Houston, we have a problem\" was?", choices: ["Lovell", "Haise", "Swigert", "Both Lovell and Swigert"], correct: 3 },
  { question: "Last man on the Moon?", choices: ["Cernan", "Schmitt", "Mitchell", "Young"], correct: 0 },
  { question: "Apollo 17 geologist?", choices: ["Schmitt", "Mitchell", "Cernan", "Conrad"], correct: 0 },
  { question: "First female American in space?", choices: ["Ride", "Resnik", "Ochoa", "Lucid"], correct: 0 },
  { question: "Sally Ride flew on?", choices: ["Apollo", "Skylab", "Space Shuttle", "Mir"], correct: 2 },
  { question: "Challenger disaster year?", choices: ["1976", "1986", "1996", "2006"], correct: 1 },
  { question: "Columbia disaster year?", choices: ["1993", "2003", "2013", "1983"], correct: 1 },
  { question: "Christa McAuliffe was a?", choices: ["Pilot", "Teacher", "Engineer", "Doctor"], correct: 1 },
  { question: "First African-American in space?", choices: ["Bluford", "Bolden", "Gregory", "Jemison"], correct: 0 },
  { question: "Mae Jemison was first?", choices: ["Asian-Am astronaut", "African-Am woman in space", "Pilot", "Doctor in space"], correct: 1 },
  { question: "John Young commanded which Shuttle mission?", choices: ["STS-1", "STS-7", "STS-26", "STS-51L"], correct: 0 },
  { question: "Buzz Aldrin's real first name?", choices: ["Buzz", "Edwin", "Bob", "Bill"], correct: 1 },
  { question: "Apollo 15 commander?", choices: ["Scott", "Lovell", "Cernan", "Stafford"], correct: 0 },
  { question: "Skylab launched in?", choices: ["1971", "1973", "1975", "1977"], correct: 1 },
  { question: "ISS continuous habitation began?", choices: ["1995", "2000", "2005", "2010"], correct: 1 },
  { question: "Scott Kelly's twin?", choices: ["Mark", "Mike", "Mitch", "Mason"], correct: 0 },
  { question: "Scott Kelly spent ___ days on ISS?", choices: ["100", "200", "340", "500"], correct: 2 },
  { question: "Peggy Whitson is famous for?", choices: ["Most cumulative US time in space", "First woman commander ISS", "Both", "Neither"], correct: 2 },
  { question: "First teacher in space (completed mission)?", choices: ["McAuliffe", "Morgan", "Acaba", "McNair"], correct: 1 },
  { question: "Eugene Cernan was last man on Moon in?", choices: ["Apollo 14", "Apollo 15", "Apollo 16", "Apollo 17"], correct: 3 },
  { question: "Pete Conrad commanded?", choices: ["Apollo 11", "Apollo 12", "Apollo 14", "Apollo 16"], correct: 1 },
  { question: "Apollo 12 LM nickname?", choices: ["Eagle", "Intrepid", "Antares", "Falcon"], correct: 1 },
  { question: "Apollo 11 LM nickname?", choices: ["Eagle", "Intrepid", "Antares", "Falcon"], correct: 0 },
  { question: "Mercury Seven excluded which group?", choices: ["Civilians", "Pilots", "Engineers", "Doctors"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NasaAstronautsQuizSettings): NasaAstronautsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NasaAstronautsQuizState, action: NasaAstronautsQuizAction): NasaAstronautsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NasaAstronautsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
