import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AdamSandlerQuizSettings { questions: "10" | "20" | "30"; }
export interface AdamSandlerQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AdamSandlerQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Billy Madison year?", choices: ["1993", "1995", "1997", "1999"], correct: 1 },
  { question: "Happy Gilmore year?", choices: ["1995", "1996", "1998", "2000"], correct: 1 },
  { question: "Happy Gilmore's sport?", choices: ["Hockey then Golf", "Tennis", "Baseball", "Football"], correct: 0 },
  { question: "Sandler's production company?", choices: ["Happy Madison", "Sandler Films", "Big Daddy", "NetflixSan"], correct: 0 },
  { question: "Big Daddy year?", choices: ["1997", "1999", "2001", "2003"], correct: 1 },
  { question: "Wedding Singer year?", choices: ["1996", "1998", "2000", "2002"], correct: 1 },
  { question: "Wedding Singer co-star?", choices: ["Drew Barrymore", "Jennifer Aniston", "Salma Hayek", "Cameron Diaz"], correct: 0 },
  { question: "Punch-Drunk Love (2002) director?", choices: ["Paul Thomas Anderson", "Wes Anderson", "Spike Jonze", "Tarantino"], correct: 0 },
  { question: "Uncut Gems (2019) directors?", choices: ["Safdie Brothers", "Coen Brothers", "Russo Brothers", "Wachowskis"], correct: 0 },
  { question: "Uncut Gems setting?", choices: ["NYC Diamond District", "LA", "Chicago", "Las Vegas"], correct: 0 },
  { question: "50 First Dates co-star?", choices: ["Drew Barrymore", "Jennifer Aniston", "Salma Hayek", "Kate Beckinsale"], correct: 0 },
  { question: "50 First Dates location?", choices: ["Hawaii", "Caribbean", "Florida", "Mexico"], correct: 0 },
  { question: "The Waterboy year?", choices: ["1996", "1998", "2000", "2002"], correct: 1 },
  { question: "Waterboy's coach is named?", choices: ["Klein", "Coach Klein", "Beaulieu", "Coach Klein/Bobby's mom Helen"], correct: 1 },
  { question: "Anger Management co-star?", choices: ["Jack Nicholson", "Robert De Niro", "Al Pacino", "Robin Williams"], correct: 0 },
  { question: "Click (2006) co-star?", choices: ["Kate Beckinsale", "Jennifer Aniston", "Salma Hayek", "Drew Barrymore"], correct: 0 },
  { question: "Mr. Deeds year?", choices: ["2000", "2002", "2004", "2006"], correct: 1 },
  { question: "Sandler joined SNL in?", choices: ["1988", "1990", "1992", "1994"], correct: 1 },
  { question: "Famous SNL recurring 'song' character?", choices: ["Opera Man", "Cajun Man", "Both", "Hanukkah Song"], correct: 2 },
  { question: "Hanukkah Song debuted on?", choices: ["SNL Weekend Update", "Concert tour", "Album", "Movie"], correct: 0 },
  { question: "Pixels (2015) features Sandler vs?", choices: ["Aliens (8-bit games)", "Robots", "Vampires", "Zombies"], correct: 0 },
  { question: "Murder Mystery co-star?", choices: ["Jennifer Aniston", "Drew Barrymore", "Salma Hayek", "Kate Beckinsale"], correct: 0 },
  { question: "Sandler's Netflix multi-film deal year?", choices: ["2012", "2014", "2017", "2020"], correct: 1 },
  { question: "Hubie Halloween year?", choices: ["2018", "2020", "2022", "2024"], correct: 1 },
  { question: "Sandy Wexler is set in what era?", choices: ["1990s LA talent agent", "1970s", "1980s", "2000s"], correct: 0 },
  { question: "Reign Over Me (2007) co-star?", choices: ["Don Cheadle", "Will Smith", "Denzel Washington", "Eddie Murphy"], correct: 0 },
  { question: "Spanglish year?", choices: ["2002", "2004", "2006", "2008"], correct: 1 },
  { question: "Funny People director?", choices: ["Judd Apatow", "Dennis Dugan", "Frank Coraci", "Steven Brill"], correct: 0 },
  { question: "Hotel Transylvania — Sandler voices?", choices: ["Dracula", "Frankenstein", "Wolf", "Mummy"], correct: 0 },
  { question: "Sandler's standup album 'They're All Gonna Laugh at You' won?", choices: ["Grammy nom", "Oscar", "Razzie", "Tony"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AdamSandlerQuizSettings): AdamSandlerQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AdamSandlerQuizState, action: AdamSandlerQuizAction): AdamSandlerQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AdamSandlerQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
