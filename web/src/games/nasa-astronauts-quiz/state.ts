import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NasaAstronautsQuizSettings { questions: "10" | "20" | "30"; }
export interface NasaAstronautsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NasaAstronautsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "First American in space?", choices: ["Glenn", "Shepard", "Grissom", "Carpenter"], correct: 1 },
  { question: "First American to orbit Earth?", choices: ["Glenn", "Shepard", "Grissom", "Cooper"], correct: 0 },
  { question: "First man on the Moon?", choices: ["Aldrin", "Armstrong", "Collins", "Lovell"], correct: 1 },
  { question: "Apollo 11 lunar module pilot?", choices: ["Aldrin", "Armstrong", "Collins", "Lovell"], correct: 0 },
  { question: "Apollo 11 command module pilot?", choices: ["Aldrin", "Armstrong", "Collins", "Lovell"], correct: 2 },
  { question: "Year of first Moon landing?", choices: ["1967", "1969", "1971", "1972"], correct: 1 },
  { question: "Apollo 13 commander?", choices: ["Lovell", "Haise", "Swigert", "Borman"], correct: 0 },
  { question: "Last man on the Moon?", choices: ["Cernan", "Schmitt", "Young", "Mitchell"], correct: 0 },
  { question: "First American woman in space?", choices: ["Ride", "Lucid", "Resnik", "McAuliffe"], correct: 0 },
  { question: "First African-American in space?", choices: ["Bluford", "McNair", "Gregory", "Bolden"], correct: 0 },
  { question: "Challenger exploded in?", choices: ["1985", "1986", "1988", "1990"], correct: 1 },
  { question: "Teacher killed on Challenger?", choices: ["McAuliffe", "Resnik", "Ride", "Lucid"], correct: 0 },
  { question: "Columbia disintegrated in?", choices: ["2001", "2003", "2005", "2007"], correct: 1 },
  { question: "Apollo 1 fire killed how many?", choices: ["Two", "Three", "Four", "Five"], correct: 1 },
  { question: "Apollo 1 commander?", choices: ["Grissom", "White", "Chaffee", "Glenn"], correct: 0 },
  { question: "First spacewalk by an American?", choices: ["White", "Aldrin", "Collins", "Cernan"], correct: 0 },
  { question: "Mercury Seven count?", choices: ["Six", "Seven", "Eight", "Nine"], correct: 1 },
  { question: "Apollo 8 first orbited Moon in?", choices: ["1967", "1968", "1969", "1970"], correct: 1 },
  { question: "Skylab launched in?", choices: ["1971", "1973", "1975", "1977"], correct: 1 },
  { question: "First woman to command Shuttle?", choices: ["Collins", "Ride", "Lucid", "Whitson"], correct: 0 },
  { question: "Longest US ISS stay record holder?", choices: ["Whitson", "Lopez-Alegria", "Kelly", "Hadfield"], correct: 2 },
  { question: "Hubble was repaired by Shuttle in?", choices: ["1990", "1993", "1997", "2001"], correct: 1 },
  { question: "Apollo 17 geologist?", choices: ["Schmitt", "Cernan", "Mitchell", "Bean"], correct: 0 },
  { question: "Apollo 11 launched on?", choices: ["Saturn IB", "Saturn V", "Atlas", "Titan"], correct: 1 },
  { question: "John Glenn returned to space age?", choices: ["65", "72", "77", "82"], correct: 2 },
  { question: "Buzz Aldrin's real first name?", choices: ["Edwin", "Buzz", "Robert", "James"], correct: 0 },
  { question: "Number of Apollo Moon landings?", choices: ["Five", "Six", "Seven", "Eight"], correct: 1 },
  { question: "Gemini program preceded?", choices: ["Mercury", "Apollo", "Skylab", "Shuttle"], correct: 1 },
  { question: "First reusable spacecraft?", choices: ["Apollo", "Soyuz", "Space Shuttle", "Dragon"], correct: 2 },
  { question: "NASA founded in?", choices: ["1955", "1958", "1961", "1965"], correct: 1 },
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
