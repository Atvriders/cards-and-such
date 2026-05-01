import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BankHeistsQuizSettings { questions: "10" | "20"; }
export interface BankHeistsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BankHeistsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {"question": "Largest U.S. bank heist by amount?", "choices": ["Dunbar Armored 1997", "Brinks 1950", "First National", "Wells Fargo"], "correct": 0},
  {"question": "Brinks 1950 heist was in?", "choices": ["Boston", "NYC", "Chicago", "LA"], "correct": 0},
  {"question": "Dunbar 1997 heist took roughly?", "choices": ["$18.9M", "$5M", "$100M", "$1M"], "correct": 0},
  {"question": "Loomis Fargo 1997 heist was in?", "choices": ["North Carolina", "Texas", "Florida", "NY"], "correct": 0},
  {"question": "Banco Central heist 2005 was in?", "choices": ["Brazil", "Argentina", "Mexico", "Chile"], "correct": 0},
  {"question": "Brazilian heist used what method?", "choices": ["Tunnel", "Helicopter", "Hostages", "Hack"], "correct": 0},
  {"question": "Northern Bank 2004 heist was in?", "choices": ["Belfast", "Dublin", "London", "Glasgow"], "correct": 0},
  {"question": "Northern Bank robbery blamed on?", "choices": ["IRA", "UDA", "UVF", "ETA"], "correct": 0},
  {"question": "Securitas depot heist 2006 was in?", "choices": ["Tonbridge, England", "London", "Dublin", "Manchester"], "correct": 0},
  {"question": "Securitas heist took roughly?", "choices": ["£53M", "£10M", "£100M", "£5M"], "correct": 0},
  {"question": "Knightsbridge Safe Deposit heist year?", "choices": ["1987", "1995", "1971", "2003"], "correct": 0},
  {"question": "Baker Street tunnel job was in?", "choices": ["1971", "1980", "1965", "1995"], "correct": 0},
  {"question": "Hatton Garden heist year?", "choices": ["2015", "2010", "2005", "2018"], "correct": 0},
  {"question": "Hatton Garden gang's age trait?", "choices": ["Mostly elderly", "Mostly teens", "Mid-20s", "Cops"], "correct": 0},
  {"question": "United California Bank 1972 heist mastermind?", "choices": ["Amil Dinsio", "Patty Hearst", "Willie Sutton", "DB Cooper"], "correct": 0},
  {"question": "Stockholm 1973 hostage origin of 'Stockholm syndrome'?", "choices": ["Norrmalmstorg", "Hovsta", "Vasa", "Drottninggatan"], "correct": 0},
  {"question": "Patty Hearst joined which group robbing banks?", "choices": ["SLA", "Weather Underground", "Black Panthers", "FALN"], "correct": 0},
  {"question": "Famous quote 'because that's where the money is' attributed to?", "choices": ["Willie Sutton", "Dillinger", "Capone", "Ness"], "correct": 0},
  {"question": "Society of D.B. Cooper involves?", "choices": ["Hijack ransom", "Bank vault", "Tunnel", "Train"], "correct": 0},
  {"question": "Air France 1967 Marseille heist used?", "choices": ["Sewer tunnel", "Helicopter", "Hostages", "Bomb"], "correct": 0},
  {"question": "Albert Spaggiari led which heist?", "choices": ["Nice 1976", "Marseille 1967", "Paris 1980", "Lyon 1990"], "correct": 0},
  {"question": "Spaggiari's note left at scene?", "choices": ["Without weapons, hatred or violence", "Free at last", "C'est la vie", "Adieu"], "correct": 0},
  {"question": "First National Bank of Arizona 1997 heist used?", "choices": ["Bombs", "Tunnel", "Hostages", "Hack"], "correct": 0},
  {"question": "Bank of America 1997 'North Hollywood Shootout' featured?", "choices": ["Body armor", "Hostages", "Tunnel", "Helicopter"], "correct": 0},
  {"question": "North Hollywood shootout year?", "choices": ["1997", "1995", "2000", "1992"], "correct": 0},
  {"question": "Bonnie & Clyde robbed which type primarily?", "choices": ["Small banks/stores", "Big banks", "Trains", "Armored cars"], "correct": 0},
  {"question": "Lufthansa heist 1978 was at?", "choices": ["JFK Airport", "LaGuardia", "O'Hare", "LAX"], "correct": 0},
  {"question": "Lufthansa heist tied to which mob?", "choices": ["Lucchese", "Genovese", "Bonanno", "Gambino"], "correct": 0},
  {"question": "Lufthansa take roughly?", "choices": ["$5–6M", "$1M", "$20M", "$100K"], "correct": 0},
  {"question": "Goodfellas film featured which heist?", "choices": ["Lufthansa", "Brinks", "Hatton", "Securitas"], "correct": 0}
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BankHeistsQuizSettings): BankHeistsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BankHeistsQuizState, action: BankHeistsQuizAction): BankHeistsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BankHeistsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
