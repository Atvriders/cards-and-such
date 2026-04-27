import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LedZeppelinQuizSettings { questions: "10" | "20" | "30"; }
export interface LedZeppelinQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LedZeppelinQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Led Zeppelin formed in?", choices: ["1966", "1968", "1970", "1972"], correct: 1 },
  { question: "Led Zeppelin's lead guitarist/founder?", choices: ["Jimmy Page", "Robert Plant", "John Paul Jones", "John Bonham"], correct: 0 },
  { question: "Lead vocalist?", choices: ["Robert Plant", "John Paul Jones", "Jimmy Page", "John Bonham"], correct: 0 },
  { question: "Bassist/keyboardist?", choices: ["John Paul Jones", "John Bonham", "Robert Plant", "Jimmy Page"], correct: 0 },
  { question: "Drummer?", choices: ["John Bonham", "Keith Moon", "Charlie Watts", "Mitch Mitchell"], correct: 0 },
  { question: "Jimmy Page's previous band?", choices: ["The Yardbirds", "Cream", "The Hollies", "The Animals"], correct: 0 },
  { question: "First album title?", choices: ["Led Zeppelin", "Led Zeppelin I", "Both (same)", "Led Zeppelin Debut"], correct: 2 },
  { question: "First album year?", choices: ["1968", "1969", "1971", "1973"], correct: 1 },
  { question: "Most famous song?", choices: ["Stairway to Heaven", "Black Dog", "Whole Lotta Love", "Kashmir"], correct: 0 },
  { question: "'Stairway to Heaven' is on which album?", choices: ["Led Zeppelin IV", "Houses of the Holy", "Physical Graffiti", "Led Zeppelin III"], correct: 0 },
  { question: "Year of Led Zeppelin IV?", choices: ["1971", "1972", "1973", "1974"], correct: 0 },
  { question: "Manager?", choices: ["Peter Grant", "Andrew Oldham", "Brian Epstein", "Allen Klein"], correct: 0 },
  { question: "Record label launched by Zeppelin?", choices: ["Swan Song", "Apple", "Rolling Stones Records", "Mercury"], correct: 0 },
  { question: "John Bonham died in?", choices: ["1978", "1980", "1982", "1984"], correct: 1 },
  { question: "Bonham's death cause?", choices: ["Asphyxiation/alcohol", "Drug overdose", "Heart attack", "Car crash"], correct: 0 },
  { question: "Year Zeppelin officially disbanded?", choices: ["1979", "1980", "1981", "1982"], correct: 1 },
  { question: "'Kashmir' is on which album?", choices: ["Physical Graffiti", "Houses of the Holy", "Presence", "In Through the Out Door"], correct: 0 },
  { question: "'Whole Lotta Love' year?", choices: ["1969", "1970", "1971", "1972"], correct: 0 },
  { question: "'Black Dog' opens which album?", choices: ["Led Zeppelin IV", "Houses of the Holy", "Led Zeppelin III", "Physical Graffiti"], correct: 0 },
  { question: "Zeppelin reunion at Live Aid?", choices: ["1985", "1990", "1995", "2000"], correct: 0 },
  { question: "O2 Arena reunion year?", choices: ["2005", "2007", "2009", "2011"], correct: 1 },
  { question: "Drummer at O2 reunion?", choices: ["Jason Bonham", "Phil Collins", "Carmine Appice", "Tommy Lee"], correct: 0 },
  { question: "'Immigrant Song' is on?", choices: ["Led Zeppelin III", "Led Zeppelin II", "Led Zeppelin IV", "Houses of the Holy"], correct: 0 },
  { question: "Zeppelin film released in 1976?", choices: ["The Song Remains the Same", "When the Levee Breaks", "Celebration Day", "How the West Was Won"], correct: 0 },
  { question: "Robert Plant's collab partner in 2000s?", choices: ["Alison Krauss", "Sheryl Crow", "Stevie Nicks", "Annie Lennox"], correct: 0 },
  { question: "Plant/Krauss album?", choices: ["Raising Sand", "Honey Wheat", "Good Old Days", "Bluegrass Heart"], correct: 0 },
  { question: "Zeppelin lawsuit over 'Stairway' intro alleged similarity to?", choices: ["Spirit's 'Taurus'", "Genesis's song", "Black Sabbath", "Cream"], correct: 0 },
  { question: "Page's twin-neck guitar?", choices: ["Gibson EDS-1275", "Gibson SG", "Fender Strat", "Les Paul"], correct: 0 },
  { question: "How many Led Zeppelin studio albums?", choices: ["7", "8", "9", "10"], correct: 1 },
  { question: "Final Zeppelin studio album?", choices: ["In Through the Out Door", "Coda", "Presence", "Physical Graffiti"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: LedZeppelinQuizSettings): LedZeppelinQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LedZeppelinQuizState, action: LedZeppelinQuizAction): LedZeppelinQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LedZeppelinQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
