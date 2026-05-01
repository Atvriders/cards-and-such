import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AssassinationsQuizSettings { questions: "10" | "20" | "30"; }
export interface AssassinationsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AssassinationsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Lincoln was assassinated by?", choices: ["John Wilkes Booth","Lee Harvey Oswald","Charles Guiteau","Sirhan Sirhan"], correct: 0 },
  { question: "Lincoln was shot at?", choices: ["Ford's Theatre","Pennsylvania Avenue","The White House","The Capitol"], correct: 0 },
  { question: "JFK was killed in which city?", choices: ["Dallas","Houston","Austin","San Antonio"], correct: 0 },
  { question: "JFK assassination year?", choices: ["1961","1963","1965","1968"], correct: 1 },
  { question: "JFK was shot from the?", choices: ["Texas School Book Depository","Hotel rooftop","Hospital","White House"], correct: 0 },
  { question: "Lee Harvey Oswald was killed by?", choices: ["Jack Ruby","FBI","Secret Service","Police"], correct: 0 },
  { question: "RFK was assassinated by?", choices: ["Sirhan Sirhan","James Earl Ray","John Hinckley","Booth"], correct: 0 },
  { question: "RFK was shot at the?", choices: ["Ambassador Hotel","Fairmont","Hilton","Plaza"], correct: 0 },
  { question: "Martin Luther King Jr. was assassinated by?", choices: ["James Earl Ray","Sirhan Sirhan","Mark David Chapman","Hinckley"], correct: 0 },
  { question: "MLK was killed in?", choices: ["Memphis","Atlanta","Selma","Birmingham"], correct: 0 },
  { question: "MLK assassination year?", choices: ["1968","1965","1963","1972"], correct: 0 },
  { question: "President Garfield was shot by?", choices: ["Charles Guiteau","Booth","Oswald","Czolgosz"], correct: 0 },
  { question: "President McKinley was killed by?", choices: ["Leon Czolgosz","Guiteau","Booth","Oswald"], correct: 0 },
  { question: "McKinley was shot at the?", choices: ["Pan-American Exposition","White House","Train station","Hotel"], correct: 0 },
  { question: "John Lennon was killed by?", choices: ["Mark David Chapman","Sirhan Sirhan","Charles Manson","Hinckley"], correct: 0 },
  { question: "John Lennon was killed in?", choices: ["NYC","London","LA","Liverpool"], correct: 0 },
  { question: "John Lennon's death year was?", choices: ["1980","1975","1985","1979"], correct: 0 },
  { question: "Reagan was shot by?", choices: ["John Hinckley Jr.","Sirhan","Oswald","Booth"], correct: 0 },
  { question: "Reagan was shot in?", choices: ["1981","1980","1983","1985"], correct: 0 },
  { question: "Hinckley shot Reagan to impress?", choices: ["Jodie Foster","Madonna","Diana Ross","Princess Diana"], correct: 0 },
  { question: "Archduke Franz Ferdinand was killed in?", choices: ["Sarajevo","Vienna","Berlin","Belgrade"], correct: 0 },
  { question: "Franz Ferdinand's death year was?", choices: ["1914","1918","1939","1900"], correct: 0 },
  { question: "Gavrilo Princip belonged to?", choices: ["Black Hand","Red Brigade","Provos","Stasi"], correct: 0 },
  { question: "Mahatma Gandhi was assassinated by?", choices: ["Nathuram Godse","Bose","Nehru","Jinnah"], correct: 0 },
  { question: "Gandhi died in?", choices: ["1948","1947","1950","1945"], correct: 0 },
  { question: "Anwar Sadat was killed during a?", choices: ["Military parade","Wedding","Speech","Hike"], correct: 0 },
  { question: "Yitzhak Rabin was assassinated in?", choices: ["1995","1993","2000","1990"], correct: 0 },
  { question: "Rabin's killer was?", choices: ["Yigal Amir","Sirhan Sirhan","Mossad","Hamas"], correct: 0 },
  { question: "Indira Gandhi was killed by her own?", choices: ["Sikh bodyguards","Husband","Cousin","Cook"], correct: 0 },
  { question: "The Warren Commission investigated?", choices: ["JFK assassination","Lincoln assassination","RFK","MLK"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AssassinationsQuizSettings): AssassinationsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AssassinationsQuizState, action: AssassinationsQuizAction): AssassinationsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AssassinationsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
