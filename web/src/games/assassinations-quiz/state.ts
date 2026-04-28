import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AssassinationsQuizSettings { questions: "10" | "20" | "30"; }
export interface AssassinationsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AssassinationsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Lincoln was assassinated by?", choices: ["John Wilkes Booth","Lee Harvey Oswald","Charles Guiteau","Sirhan Sirhan"], correct: 0 },
  { question: "Lincoln was killed at?", choices: ["Ford's Theatre","Pennsylvania Avenue","White House","Capitol"], correct: 0 },
  { question: "JFK was killed in which city?", choices: ["Dallas","Houston","Austin","San Antonio"], correct: 0 },
  { question: "JFK assassination year?", choices: ["1961","1963","1965","1968"], correct: 1 },
  { question: "Archduke Franz Ferdinand was killed in?", choices: ["Vienna","Sarajevo","Belgrade","Budapest"], correct: 1 },
  { question: "Franz Ferdinand was assassinated in?", choices: ["1912","1914","1916","1918"], correct: 1 },
  { question: "Mahatma Gandhi was killed in?", choices: ["1947","1948","1949","1950"], correct: 1 },
  { question: "Gandhi's assassin was?", choices: ["Nathuram Godse","Mohammed Ali","Jawaharlal Nehru","Indira Gandhi"], correct: 0 },
  { question: "MLK Jr. was killed in which city?", choices: ["Atlanta","Memphis","Nashville","Birmingham"], correct: 1 },
  { question: "MLK was killed in?", choices: ["1963","1965","1968","1972"], correct: 2 },
  { question: "RFK was killed at?", choices: ["Hotel Ambassador","Dallas Convention","White House","Senate Office"], correct: 0 },
  { question: "RFK was killed in?", choices: ["1965","1968","1971","1972"], correct: 1 },
  { question: "Julius Caesar was assassinated in?", choices: ["44 BC","100 BC","44 AD","100 AD"], correct: 0 },
  { question: "Brutus was famous for stabbing?", choices: ["Caesar","Cicero","Pompey","Antony"], correct: 0 },
  { question: "Anwar Sadat was?", choices: ["Egyptian president","Israeli PM","Lebanese leader","Saudi king"], correct: 0 },
  { question: "Sadat was assassinated in?", choices: ["1979","1981","1983","1985"], correct: 1 },
  { question: "Indira Gandhi was killed by?", choices: ["Her bodyguards","Pakistani soldiers","Maoists","Terrorists"], correct: 0 },
  { question: "Yitzhak Rabin was?", choices: ["Israeli PM","Egyptian president","Palestinian leader","Lebanese PM"], correct: 0 },
  { question: "Rabin was assassinated in?", choices: ["1993","1995","1997","1999"], correct: 1 },
  { question: "William McKinley was assassinated in?", choices: ["1898","1901","1905","1909"], correct: 1 },
  { question: "McKinley was killed by?", choices: ["Anarchist","Confederate","Spy","Soldier"], correct: 0 },
  { question: "James Garfield was killed in?", choices: ["1881","1885","1889","1893"], correct: 0 },
  { question: "Trotsky was assassinated in?", choices: ["Russia","Mexico","Spain","France"], correct: 1 },
  { question: "Trotsky was killed in?", choices: ["1936","1940","1945","1950"], correct: 1 },
  { question: "John Lennon was killed by?", choices: ["Mark David Chapman","Sirhan Sirhan","James Earl Ray","Lee Harvey Oswald"], correct: 0 },
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
