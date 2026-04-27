import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CountryMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface CountryMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CountryMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Johnny Cash's nickname was?", choices: ["The Killer", "The Man in Black", "The Possum", "The Hag"], correct: 1 },
  { question: "'I Walk the Line' is by?", choices: ["Hank Williams", "Johnny Cash", "Merle Haggard", "Willie Nelson"], correct: 1 },
  { question: "Hank Williams died at age?", choices: ["27", "29", "33", "41"], correct: 1 },
  { question: "George Strait's nickname is?", choices: ["The King of Country", "The Hag", "The Possum", "The Boss"], correct: 0 },
  { question: "Dolly Parton wrote 'I Will Always Love You' for?", choices: ["A film", "A divorce", "Porter Wagoner", "A friend's wedding"], correct: 2 },
  { question: "Garth Brooks's bestselling album is?", choices: ["No Fences", "Ropin' the Wind", "The Hits", "Double Live"], correct: 1 },
  { question: "Shania Twain is from which country?", choices: ["USA", "Canada", "Australia", "UK"], correct: 1 },
  { question: "The Grand Ole Opry is in?", choices: ["Memphis", "Nashville", "Branson", "Louisville"], correct: 1 },
  { question: "Willie Nelson's signature guitar is named?", choices: ["Lucille", "Trigger", "Old Faithful", "Betsy"], correct: 1 },
  { question: "Patsy Cline's hit 'Crazy' was written by?", choices: ["Roger Miller", "Willie Nelson", "Hank Cochran", "Harlan Howard"], correct: 1 },
  { question: "Loretta Lynn's biopic was titled?", choices: ["Walk the Line", "Coal Miner's Daughter", "Sweet Dreams", "The Glen Campbell Story"], correct: 1 },
  { question: "Carrie Underwood won which TV show?", choices: ["The Voice", "American Idol", "Nashville Star", "X Factor"], correct: 1 },
  { question: "Tim McGraw's wife is?", choices: ["Reba McEntire", "Faith Hill", "Trisha Yearwood", "Martina McBride"], correct: 1 },
  { question: "Kenny Rogers's 'The Gambler' came out in?", choices: ["1973", "1976", "1978", "1982"], correct: 2 },
  { question: "Brad Paisley plays?", choices: ["Steel guitar", "Banjo", "Telecaster", "Fiddle"], correct: 2 },
  { question: "The Dixie Chicks are now known as?", choices: ["The Chicks", "Trio", "Pistol Annies", "Lady A"], correct: 0 },
  { question: "Eric Church's hometown is in?", choices: ["Texas", "North Carolina", "Tennessee", "Oklahoma"], correct: 1 },
  { question: "Reba McEntire is from which state?", choices: ["Texas", "Oklahoma", "Arkansas", "Tennessee"], correct: 1 },
  { question: "Alan Jackson sang 'Where Were You' about?", choices: ["A breakup", "September 11", "His mother", "His hometown"], correct: 1 },
  { question: "Toby Keith's anthem was?", choices: ["Should've Been a Cowboy", "How Do You Like Me Now?!", "Courtesy of the Red, White and Blue", "American Soldier"], correct: 2 },
  { question: "Tammy Wynette's biggest hit is?", choices: ["Stand by Your Man", "D-I-V-O-R-C-E", "Apartment #9", "I Don't Wanna Play House"], correct: 0 },
  { question: "Hank Williams Jr.'s nickname is?", choices: ["Junior", "Bocephus", "The Possum", "The Outlaw"], correct: 1 },
  { question: "The 'Outlaw country' movement included?", choices: ["Buck Owens & Don Rich", "Willie & Waylon", "Reba & Faith", "George & Tammy"], correct: 1 },
  { question: "Bluegrass was pioneered by?", choices: ["Earl Scruggs", "Bill Monroe", "Lester Flatt", "Doc Watson"], correct: 1 },
  { question: "Luke Bryan emcees which awards show?", choices: ["CMA", "ACM", "Grammy", "BMI"], correct: 1 },
  { question: "Miranda Lambert was first runner-up on?", choices: ["Nashville Star", "American Idol", "The Voice", "Star Search"], correct: 0 },
  { question: "Keith Urban is from?", choices: ["USA", "UK", "New Zealand", "Australia (raised)"], correct: 3 },
  { question: "Florida Georgia Line is a?", choices: ["Solo act", "Trio", "Duo", "Quartet"], correct: 2 },
  { question: "Chris Stapleton's breakout album was?", choices: ["From A Room", "Traveller", "Starting Over", "Higher"], correct: 1 },
  { question: "Morgan Wallen's 'Dangerous: The Double Album' came out in?", choices: ["2019", "2020", "2021", "2022"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CountryMusicQuizSettings): CountryMusicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CountryMusicQuizState, action: CountryMusicQuizAction): CountryMusicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CountryMusicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
