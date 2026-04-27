import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface UsPresidentsQuizSettings { questions: "10" | "20" | "30"; }
export interface UsPresidentsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type UsPresidentsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "First US President?", choices: ["Adams", "Washington", "Jefferson", "Madison"], correct: 1 },
  { question: "Author of Declaration of Independence?", choices: ["Adams", "Madison", "Jefferson", "Franklin"], correct: 2 },
  { question: "Lincoln was the ___ president?", choices: ["14th", "15th", "16th", "17th"], correct: 2 },
  { question: "FDR served how many terms?", choices: ["Two", "Three", "Four", "Five"], correct: 2 },
  { question: "JFK was assassinated in?", choices: ["Dallas", "Houston", "Memphis", "Los Angeles"], correct: 0 },
  { question: "Truman dropped atomic bombs on?", choices: ["Pearl Harbor", "Tokyo & Kyoto", "Hiroshima & Nagasaki", "Berlin & Hamburg"], correct: 2 },
  { question: "Reagan was president from?", choices: ["1977-1981", "1981-1989", "1985-1993", "1989-1993"], correct: 1 },
  { question: "Obama took office in?", choices: ["2005", "2009", "2013", "2017"], correct: 1 },
  { question: "First African-American president?", choices: ["Lincoln", "Carter", "Obama", "Biden"], correct: 2 },
  { question: "Theodore Roosevelt's political symbol led to what stuffed toy?", choices: ["Teddy bear", "Lincoln log", "Hoover doll", "Wilson tiger"], correct: 0 },
  { question: "Nixon resigned over?", choices: ["Iran-Contra", "Watergate", "Vietnam", "Whitewater"], correct: 1 },
  { question: "JFK's VP?", choices: ["Humphrey", "LBJ", "Carter", "Mondale"], correct: 1 },
  { question: "Carter was president?", choices: ["1973-1977", "1977-1981", "1981-1985", "1969-1973"], correct: 1 },
  { question: "Eisenhower commanded D-Day in?", choices: ["1942", "1944", "1945", "1943"], correct: 1 },
  { question: "First president to be impeached?", choices: ["Lincoln", "Andrew Johnson", "Grant", "Hayes"], correct: 1 },
  { question: "Clinton was impeached in?", choices: ["1995", "1998", "2001", "2003"], correct: 1 },
  { question: "Trump was the ___ president?", choices: ["43rd", "44th", "45th", "46th"], correct: 2 },
  { question: "Biden was VP under?", choices: ["Bush", "Obama", "Clinton", "Carter"], correct: 1 },
  { question: "George Washington's home is at?", choices: ["Monticello", "Mount Vernon", "Hyde Park", "Hermitage"], correct: 1 },
  { question: "Jefferson's home was?", choices: ["Mount Vernon", "Monticello", "Hyde Park", "Hermitage"], correct: 1 },
  { question: "Andrew Jackson was nicknamed?", choices: ["Old Hickory", "Old Rough", "Honest Abe", "Tippecanoe"], correct: 0 },
  { question: "Teddy Roosevelt led which charge?", choices: ["Bull Run", "Rough Riders / San Juan Hill", "Gettysburg", "Antietam"], correct: 1 },
  { question: "Wilson led the US into?", choices: ["WWI", "WWII", "Korea", "Vietnam"], correct: 0 },
  { question: "Hoover was president during?", choices: ["Crash of 1929", "WW1", "WW2", "Korean War"], correct: 0 },
  { question: "LBJ's \"Great Society\" focused on?", choices: ["Civil rights & welfare", "Tax cuts", "Foreign aid", "Tariffs"], correct: 0 },
  { question: "Ford pardoned?", choices: ["Nixon", "Carter", "Agnew", "Reagan"], correct: 0 },
  { question: "George H.W. Bush led?", choices: ["Vietnam", "Gulf War", "Korean War", "Iraq War"], correct: 1 },
  { question: "George W. Bush served?", choices: ["1993-2001", "2001-2009", "2005-2013", "2009-2017"], correct: 1 },
  { question: "Lincoln was assassinated by?", choices: ["Booth", "Oswald", "Czolgosz", "Guiteau"], correct: 0 },
  { question: "Garfield was assassinated by?", choices: ["Booth", "Oswald", "Czolgosz", "Guiteau"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: UsPresidentsQuizSettings): UsPresidentsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: UsPresidentsQuizState, action: UsPresidentsQuizAction): UsPresidentsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: UsPresidentsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
