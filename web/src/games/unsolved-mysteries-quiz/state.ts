import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface UnsolvedMysteriesQuizSettings { questions: "10" | "20" | "30"; }
export interface UnsolvedMysteriesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type UnsolvedMysteriesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "D.B. Cooper hijacked a flight in?", choices: ["1971","1973","1975","1977"], correct: 0 },
  { question: "D.B. Cooper jumped from a Boeing?", choices: ["727","747","737","757"], correct: 0 },
  { question: "Jack the Ripper killed in which London district?", choices: ["Whitechapel","Soho","Kensington","Mayfair"], correct: 0 },
  { question: "Jack the Ripper crimes were in?", choices: ["1888","1898","1908","1918"], correct: 0 },
  { question: "The Black Dahlia victim was?", choices: ["Elizabeth Short","Marilyn Monroe","Patty Hearst","Lana Turner"], correct: 0 },
  { question: "The Black Dahlia case was in?", choices: ["Los Angeles","NYC","Chicago","Miami"], correct: 0 },
  { question: "The Zodiac Killer terrorized?", choices: ["Northern California","NYC","Chicago","Texas"], correct: 0 },
  { question: "The Zodiac Killer sent ciphers to?", choices: ["Newspapers","Police","FBI","White House"], correct: 0 },
  { question: "JonBenet Ramsey was killed in?", choices: ["1996","1998","2000","1994"], correct: 0 },
  { question: "JonBenet's family lived in?", choices: ["Boulder, CO","Denver, CO","Aspen, CO","Vail, CO"], correct: 0 },
  { question: "Amelia Earhart disappeared in?", choices: ["1937","1927","1947","1957"], correct: 0 },
  { question: "Earhart was attempting to?", choices: ["Circumnavigate the globe","Cross the Atlantic","Reach the North Pole","Fly to Hawaii"], correct: 0 },
  { question: "The Mary Celeste was found in?", choices: ["1872","1812","1900","1850"], correct: 0 },
  { question: "The Mary Celeste was a?", choices: ["Cargo ship","Pirate vessel","Whaler","Naval ship"], correct: 0 },
  { question: "The Roanoke Colony vanished by?", choices: ["1590","1620","1492","1700"], correct: 0 },
  { question: "Roanoke's only clue was the carving?", choices: ["CROATOAN","HELP","FREE","AMERICA"], correct: 0 },
  { question: "The Tamam Shud / Somerton Man case was in?", choices: ["Australia","UK","India","Egypt"], correct: 0 },
  { question: "Lizzie Borden was tried for axing her?", choices: ["Father and stepmother","Husband","Children","Sister"], correct: 0 },
  { question: "Lizzie Borden was?", choices: ["Acquitted","Convicted","Executed","Pardoned"], correct: 0 },
  { question: "The Somerton Man was found in?", choices: ["1948","1928","1968","1908"], correct: 0 },
  { question: "Madeleine McCann disappeared in?", choices: ["Portugal","Spain","UK","Italy"], correct: 0 },
  { question: "Madeleine McCann disappeared in the year?", choices: ["2007","2010","2015","2003"], correct: 0 },
  { question: "The Hinterkaifeck murders were in?", choices: ["Germany","Austria","France","UK"], correct: 0 },
  { question: "The Dyatlov Pass incident was in?", choices: ["Soviet Union (Urals)","Alaska","Tibet","Patagonia"], correct: 0 },
  { question: "Dyatlov Pass occurred in?", choices: ["1959","1969","1979","1989"], correct: 0 },
  { question: "The Wow! Signal was detected by?", choices: ["A radio telescope","An optical telescope","Sonar","Radar"], correct: 0 },
  { question: "The Wow! Signal year was?", choices: ["1977","1965","1985","1995"], correct: 0 },
  { question: "The Cleveland Torso Murderer terrorized?", choices: ["1930s Cleveland","1970s NYC","1900s Chicago","1950s LA"], correct: 0 },
  { question: "The Voynich Manuscript is famous for being?", choices: ["Undeciphered","Forged","Lost","Burned"], correct: 0 },
  { question: "The Bermuda Triangle is roughly between Florida, Bermuda and?", choices: ["Puerto Rico","Cuba","Bahamas","Haiti"], correct: 0 },
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
