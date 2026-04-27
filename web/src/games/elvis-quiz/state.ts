import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ElvisQuizSettings { questions: "10" | "20" | "30"; }
export interface ElvisQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ElvisQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Elvis Presley's birth year?", choices: ["1933", "1935", "1937", "1939"], correct: 1 },
  { question: "Elvis's hometown of birth?", choices: ["Memphis", "Tupelo", "Nashville", "New Orleans"], correct: 1 },
  { question: "What state was Elvis born in?", choices: ["Tennessee", "Mississippi", "Louisiana", "Alabama"], correct: 1 },
  { question: "Elvis's famous home?", choices: ["Graceland", "Neverland", "Hartland", "Sandalwood"], correct: 0 },
  { question: "Graceland is in?", choices: ["Memphis", "Nashville", "Tupelo", "Atlanta"], correct: 0 },
  { question: "Year of Elvis's death?", choices: ["1975", "1977", "1979", "1981"], correct: 1 },
  { question: "Elvis's nickname?", choices: ["The King", "The Boss", "The Voice", "The Chairman"], correct: 0 },
  { question: "Elvis's iconic gospel-rock fusion song?", choices: ["Heartbreak Hotel", "Hound Dog", "Suspicious Minds", "Jailhouse Rock"], correct: 1 },
  { question: "Elvis's first major hit?", choices: ["Heartbreak Hotel", "Hound Dog", "Love Me Tender", "Blue Suede Shoes"], correct: 0 },
  { question: "Elvis's wife?", choices: ["Priscilla Beaulieu", "Lisa Marie", "Ginger Alden", "Linda Thompson"], correct: 0 },
  { question: "Elvis's only child?", choices: ["Lisa Marie Presley", "Riley Keough", "Priscilla Jr.", "Elvis Jr."], correct: 0 },
  { question: "Elvis served in which branch?", choices: ["Army", "Navy", "Air Force", "Marines"], correct: 0 },
  { question: "Elvis's manager?", choices: ["Colonel Tom Parker", "Sam Phillips", "Phil Spector", "Phil Walden"], correct: 0 },
  { question: "Elvis's record label early career?", choices: ["Sun Records", "Atlantic", "Motown", "Stax"], correct: 0 },
  { question: "Elvis's main label after Sun?", choices: ["Atlantic", "RCA Victor", "Capitol", "Columbia"], correct: 1 },
  { question: "'Jailhouse Rock' was a 1957 Elvis?", choices: ["Single", "Film", "Both", "Album only"], correct: 2 },
  { question: "Elvis '68 Comeback Special channel?", choices: ["NBC", "CBS", "ABC", "BBC"], correct: 0 },
  { question: "Elvis's iconic outfit color in '68 special?", choices: ["White", "Black leather", "Blue", "Red"], correct: 1 },
  { question: "Vegas residency began in?", choices: ["1968", "1969", "1971", "1973"], correct: 1 },
  { question: "Elvis movie 'Blue Hawaii' year?", choices: ["1959", "1961", "1963", "1965"], correct: 1 },
  { question: "How many movies did Elvis star in?", choices: ["20", "25", "31", "40"], correct: 2 },
  { question: "'Suspicious Minds' year?", choices: ["1965", "1968", "1969", "1972"], correct: 2 },
  { question: "Elvis met President Nixon in?", choices: ["1968", "1970", "1972", "1974"], correct: 1 },
  { question: "Elvis's iconic dance move?", choices: ["The Twist", "Hip swivel", "The Mashed Potato", "The Watusi"], correct: 1 },
  { question: "Elvis's most famous gospel song?", choices: ["How Great Thou Art", "Amazing Grace", "Old Rugged Cross", "Peace in the Valley"], correct: 0 },
  { question: "Elvis's last single before death?", choices: ["Way Down", "Burning Love", "Always on My Mind", "Suspicious Minds"], correct: 0 },
  { question: "Elvis received Grammys for which genre?", choices: ["Rock", "Gospel", "Country", "Pop"], correct: 1 },
  { question: "Elvis's middle name?", choices: ["Aaron", "Andrew", "Edward", "Daniel"], correct: 0 },
  { question: "'Hound Dog' was originally recorded by?", choices: ["Big Mama Thornton", "Bessie Smith", "Ma Rainey", "Etta James"], correct: 0 },
  { question: "'Love Me Tender' was based on what melody?", choices: ["Aura Lee", "Greensleeves", "Danny Boy", "Auld Lang Syne"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ElvisQuizSettings): ElvisQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ElvisQuizState, action: ElvisQuizAction): ElvisQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ElvisQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
