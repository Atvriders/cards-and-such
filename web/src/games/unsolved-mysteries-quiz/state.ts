import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface UnsolvedMysteriesQuizSettings { questions: "10" | "20" | "30"; }
export interface UnsolvedMysteriesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type UnsolvedMysteriesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "D.B. Cooper hijacked a flight in?", choices: ["1971","1973","1975","1977"], correct: 0 },
  { question: "D.B. Cooper jumped from a?", choices: ["Boeing 727","DC-10","747","737"], correct: 0 },
  { question: "Jack the Ripper killed in?", choices: ["London (Whitechapel)","NYC","Paris","Berlin"], correct: 0 },
  { question: "Jack the Ripper crimes were in?", choices: ["1888","1898","1908","1918"], correct: 0 },
  { question: "The Zodiac Killer operated in?", choices: ["NY","LA","Northern California","Florida"], correct: 2 },
  { question: "The Voynich Manuscript is famous for?", choices: ["Unknown writing system","Hidden treasure map","Pirate code","Lost cookbook"], correct: 0 },
  { question: "The Dyatlov Pass incident was in?", choices: ["Alps","Ural Mountains","Andes","Himalayas"], correct: 1 },
  { question: "The Dyatlov Pass deaths occurred in?", choices: ["1949","1959","1969","1979"], correct: 1 },
  { question: "Roanoke Colony disappeared in?", choices: ["1487","1590","1620","1665"], correct: 1 },
  { question: "The word found at Roanoke was?", choices: ["CROATOAN","HELP","WHEREAMI","DEAD"], correct: 0 },
  { question: "Amelia Earhart disappeared in?", choices: ["1929","1937","1941","1945"], correct: 1 },
  { question: "Earhart's last flight was?", choices: ["NY-Paris","Around the world","LA-Hawaii","Atlantic crossing"], correct: 1 },
  { question: "The Mary Celeste was a?", choices: ["Drifting derelict ship","Sunken treasure ship","War ship","Pirate ship"], correct: 0 },
  { question: "The Mary Celeste was found in?", choices: ["1872","1882","1892","1902"], correct: 0 },
  { question: "The Tunguska event occurred in?", choices: ["1908","1918","1928","1938"], correct: 0 },
  { question: "Tunguska is in?", choices: ["Russia/Siberia","Canada","Alaska","Mongolia"], correct: 0 },
  { question: "The Black Dahlia was?", choices: ["Elizabeth Short","Jane Doe","Marilyn Monroe","Bettie Page"], correct: 0 },
  { question: "The Black Dahlia case is from?", choices: ["1937","1947","1957","1967"], correct: 1 },
  { question: "JonBenét Ramsey case is from?", choices: ["1986","1996","2006","2016"], correct: 1 },
  { question: "The Hinterkaifeck murders were in?", choices: ["Germany","Austria","France","Holland"], correct: 0 },
  { question: "The Bermuda Triangle is between?", choices: ["Florida, Bermuda, Puerto Rico","Cuba, Florida, Bahamas","Brazil, Florida, Bermuda","UK, Bermuda, Spain"], correct: 0 },
  { question: "Anastasia Romanov mystery concerned?", choices: ["Did she survive 1918 execution","Royal jewelry","Lost letters","Coronation"], correct: 0 },
  { question: "Crash at Roswell was in?", choices: ["1937","1947","1957","1967"], correct: 1 },
  { question: "The Lost Colony of Roanoke is in modern?", choices: ["Virginia","North Carolina","Georgia","Florida"], correct: 1 },
  { question: "The Hope Diamond legend says it brings?", choices: ["Bad luck","Good luck","Wealth","Health"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: UnsolvedMysteriesQuizSettings): UnsolvedMysteriesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: UnsolvedMysteriesQuizState, action: UnsolvedMysteriesQuizAction): UnsolvedMysteriesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: UnsolvedMysteriesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
