import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TvSitcomsQuizSettings { questions: "10" | "20" | "30"; }
export interface TvSitcomsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TvSitcomsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "'Friends' is set in what city?", choices: ["Boston", "New York", "Chicago", "Los Angeles"], correct: 1 },
  { question: "How many main characters in 'Friends'?", choices: ["4", "5", "6", "7"], correct: 2 },
  { question: "Ross's profession?", choices: ["Chef", "Paleontologist", "Actor", "Lawyer"], correct: 1 },
  { question: "Joey's catchphrase?", choices: ["How you doin'?", "Bazinga!", "D'oh!", "Yada yada"], correct: 0 },
  { question: "'Seinfeld' creators?", choices: ["Larry David and Jerry Seinfeld", "Larry David alone", "Jerry Seinfeld alone", "Norman Lear"], correct: 0 },
  { question: "Kramer's first name?", choices: ["Cosmo", "Newman", "Stanley", "Mickey"], correct: 0 },
  { question: "George Costanza's actor?", choices: ["Jason Alexander", "Michael Richards", "Jerry Seinfeld", "Wayne Knight"], correct: 0 },
  { question: "'The Office' (US) is set in?", choices: ["Buffalo, NY", "Scranton, PA", "Cleveland, OH", "Allentown, PA"], correct: 1 },
  { question: "Michael Scott's actor?", choices: ["Steve Carell", "Rainn Wilson", "John Krasinski", "Ed Helms"], correct: 0 },
  { question: "Dwight Schrute's farm?", choices: ["Beet farm", "Corn farm", "Apple orchard", "Pumpkin patch"], correct: 0 },
  { question: "Jim and Pam's daughter named?", choices: ["Cece", "Holly", "Erin", "Phyllis"], correct: 0 },
  { question: "'Cheers' setting?", choices: ["Bar", "Diner", "Coffee shop", "Office"], correct: 0 },
  { question: "Cheers is in what city?", choices: ["New York", "Boston", "Chicago", "Philadelphia"], correct: 1 },
  { question: "Ted Danson's character in Cheers?", choices: ["Sam Malone", "Cliff Clavin", "Norm Peterson", "Frasier Crane"], correct: 0 },
  { question: "Frasier moved to which city in his spinoff?", choices: ["Seattle", "Portland", "San Francisco", "Boston"], correct: 0 },
  { question: "'How I Met Your Mother' narrator?", choices: ["Future Ted", "Marshall", "Future Barney", "Lily"], correct: 0 },
  { question: "Barney's catchphrase?", choices: ["Legen-... wait for it... -dary", "Suit up", "Both", "Bro code"], correct: 2 },
  { question: "'Big Bang Theory' nerds work in?", choices: ["Caltech", "MIT", "Stanford", "UCLA"], correct: 0 },
  { question: "Sheldon's catchphrase?", choices: ["Bazinga", "How you doin'", "Yada yada", "D'oh"], correct: 0 },
  { question: "'Modern Family' family name?", choices: ["Pritchett", "Dunphy", "Both", "Banks"], correct: 2 },
  { question: "'Parks and Recreation' star?", choices: ["Amy Poehler", "Tina Fey", "Maya Rudolph", "Kristen Wiig"], correct: 0 },
  { question: "Leslie Knope's hometown?", choices: ["Pawnee", "Springfield", "Hill Valley", "Stars Hollow"], correct: 0 },
  { question: "'30 Rock' creator/star?", choices: ["Tina Fey", "Amy Poehler", "Lorne Michaels", "Alec Baldwin"], correct: 0 },
  { question: "'Brooklyn Nine-Nine' star?", choices: ["Andy Samberg", "Andre Braugher", "Both lead pair", "Terry Crews"], correct: 0 },
  { question: "'Frasier' brothers?", choices: ["Frasier and Niles", "Frasier and Frank", "Niles and Maris", "Frasier solo"], correct: 0 },
  { question: "'Arrested Development' family name?", choices: ["Bluth", "Fünke", "Sitwell", "Both Bluth and Fünke"], correct: 0 },
  { question: "'I Love Lucy' star?", choices: ["Lucille Ball", "Mary Tyler Moore", "Carol Burnett", "Doris Day"], correct: 0 },
  { question: "'Curb Your Enthusiasm' star?", choices: ["Larry David", "Jerry Seinfeld", "Bob Newhart", "Don Rickles"], correct: 0 },
  { question: "'M*A*S*H' setting?", choices: ["Korean War MASH", "Vietnam", "WW2", "Iraq"], correct: 0 },
  { question: "'Family Guy' family name?", choices: ["Simpson", "Griffin", "Smith", "Bluth"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TvSitcomsQuizSettings): TvSitcomsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TvSitcomsQuizState, action: TvSitcomsQuizAction): TvSitcomsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TvSitcomsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
