import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ElvisQuizSettings { questions: "10" | "20" | "30"; }
export interface ElvisQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ElvisQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Elvis Presley's birth year?", choices: ["1933", "1935", "1937", "1939"], correct: 1 },
  { question: "Elvis's hometown of birth?", choices: ["Memphis", "Tupelo", "Nashville", "New Orleans"], correct: 1 },
  { question: "What state was Elvis born in?", choices: ["Tennessee", "Mississippi", "Louisiana", "Alabama"], correct: 1 },
  { question: "Elvis's famous home in Memphis?", choices: ["Graceland", "Neverland", "Hartland", "Sandalwood"], correct: 0 },
  { question: "Elvis is nicknamed?", choices: ["The King of Rock and Roll", "The Boss", "The Voice", "The Godfather of Soul"], correct: 0 },
  { question: "Elvis's record label that broke him?", choices: ["Sun Records", "RCA", "Atlantic", "Motown"], correct: 0 },
  { question: "Elvis's longtime manager?", choices: ["Colonel Tom Parker", "Brian Epstein", "Allen Klein", "Phil Spector"], correct: 0 },
  { question: "Elvis's wife was?", choices: ["Priscilla Beaulieu", "Ann-Margret", "Linda Thompson", "Ginger Alden"], correct: 0 },
  { question: "Elvis's daughter?", choices: ["Lisa Marie Presley", "Riley Keough", "Marie Presley", "Cilla"], correct: 0 },
  { question: "Elvis served in the U.S. military as?", choices: ["Army (1958-1960)", "Navy", "Air Force", "Marines"], correct: 0 },
  { question: "Where was Elvis stationed in Germany?", choices: ["Friedberg", "Berlin", "Munich", "Frankfurt"], correct: 0 },
  { question: "Elvis died in?", choices: ["1977", "1979", "1975", "1980"], correct: 0 },
  { question: "Where did Elvis die?", choices: ["Graceland (Memphis)", "Las Vegas", "Hollywood", "Nashville"], correct: 0 },
  { question: "Elvis's first #1 hit?", choices: ["Heartbreak Hotel (1956)", "Hound Dog", "Love Me Tender", "Jailhouse Rock"], correct: 0 },
  { question: "Elvis's first #1 movie?", choices: ["Love Me Tender (1956)", "Jailhouse Rock", "King Creole", "Blue Hawaii"], correct: 0 },
  { question: "Elvis's iconic 1968 TV special is called?", choices: ["The '68 Comeback Special", "Aloha from Hawaii", "Elvis on Tour", "The Last Concert"], correct: 0 },
  { question: "Elvis's 1973 satellite-broadcast concert?", choices: ["Aloha from Hawaii", "Comeback Special", "Live in Vegas", "On Tour"], correct: 0 },
  { question: "Elvis's famous rhinestone outfit was a?", choices: ["Jumpsuit", "Suit and tie", "Tuxedo", "Cape only"], correct: 0 },
  { question: "Elvis's twin brother's name?", choices: ["Jesse Garon Presley (stillborn)", "John Aaron", "Vernon Jr.", "Aaron"], correct: 0 },
  { question: "Elvis's father's name?", choices: ["Vernon", "Aaron", "Jesse", "Joe"], correct: 0 },
  { question: "Elvis's mother's name?", choices: ["Gladys", "Patsy", "Edith", "Mae"], correct: 0 },
  { question: "Elvis's middle name?", choices: ["Aaron / Aron", "James", "Robert", "Jesse"], correct: 0 },
  { question: "Elvis's signature hairstyle?", choices: ["Pompadour", "Crew cut", "Mohawk", "Mullet"], correct: 0 },
  { question: "Elvis's iconic film 'Jailhouse Rock' year?", choices: ["1957", "1958", "1959", "1960"], correct: 0 },
  { question: "Famous TV host who introduced Elvis to mass U.S. audience?", choices: ["Ed Sullivan", "Jack Paar", "Steve Allen", "Johnny Carson"], correct: 0 },
  { question: "Elvis was born on which date?", choices: ["January 8", "August 16", "December 25", "July 4"], correct: 0 },
  { question: "Elvis is buried at?", choices: ["Graceland (Meditation Garden)", "Forest Lawn", "Arlington", "Tupelo"], correct: 0 },
  { question: "Elvis's signature white guitar was a?", choices: ["Gibson J-200", "Fender Stratocaster", "Gretsch", "Martin"], correct: 0 },
  { question: "Elvis's hit movie set in Hawaii?", choices: ["Blue Hawaii", "Paradise Hawaiian Style", "Both", "Girls! Girls! Girls!"], correct: 2 },
  { question: "Elvis's posthumous Grammy Lifetime Achievement?", choices: ["Yes (awarded 1971)", "No", "Only Hall of Fame", "Pulitzer instead"], correct: 0 },
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
