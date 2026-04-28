import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MafiaQuizSettings { questions: "10" | "20" | "30"; }
export interface MafiaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MafiaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Mafia originated in?", choices: ["Sicily","Naples","Rome","Calabria"], correct: 0 },
  { question: "Cosa Nostra means?", choices: ["Our thing","Our family","Our home","Our business"], correct: 0 },
  { question: "Lucky Luciano organized the?", choices: ["Five Families","FBI","Senate","Casino"], correct: 0 },
  { question: "The Five Families are in?", choices: ["NY","Chicago","LA","Detroit"], correct: 0 },
  { question: "The Castellammarese War was in?", choices: ["1920s","1930-31","1940s","1950s"], correct: 1 },
  { question: "The Apalachin meeting was in?", choices: ["1947","1957","1967","1977"], correct: 1 },
  { question: "John Gotti was head of which family?", choices: ["Gambino","Genovese","Bonanno","Lucchese"], correct: 0 },
  { question: "John Gotti's nickname was?", choices: ["Teflon Don","The Boss","Lucky","The Gentleman"], correct: 0 },
  { question: "Al Capone ran the Outfit in?", choices: ["NY","Chicago","Detroit","Boston"], correct: 1 },
  { question: "Al Capone was convicted for?", choices: ["Murder","Tax evasion","Bootlegging","Robbery"], correct: 1 },
  { question: "Bugsy Siegel built the?", choices: ["Flamingo (Las Vegas)","Stardust","Caesars","Tropicana"], correct: 0 },
  { question: "Frank Costello was?", choices: ["Prime minister","Boss of Genovese family","Sicilian don","FBI agent"], correct: 1 },
  { question: "The 'Five Families' are: Gambino, Genovese, Bonanno, Lucchese, and?", choices: ["Colombo","Maranzano","Dewey","Capone"], correct: 0 },
  { question: "The 'Mustache Petes' were?", choices: ["Old-school Sicilian bosses","Disguises","Police","FBI"], correct: 0 },
  { question: "The 'Sammy the Bull' Gravano testified against?", choices: ["Capone","Gotti","Luciano","Anastasia"], correct: 1 },
  { question: "RICO Act was passed in?", choices: ["1960","1970","1980","1990"], correct: 1 },
  { question: "The Pizza Connection trial was about?", choices: ["Heroin trafficking","Gambling","Tax fraud","Loan sharking"], correct: 0 },
  { question: "Albert Anastasia was assassinated in a?", choices: ["Restaurant","Barbershop","Bar","Hotel"], correct: 1 },
  { question: "Joe Bonanno wrote his memoir titled?", choices: ["A Man of Honor","Five Families","Mafia","Cosa Nostra"], correct: 0 },
  { question: "The 'Saint Valentine's Day Massacre' was in?", choices: ["1929","1939","1949","1959"], correct: 0 },
  { question: "The Saint Valentine's Day Massacre was in?", choices: ["NYC","Chicago","Boston","Detroit"], correct: 1 },
  { question: "Vito Genovese was head of which family?", choices: ["Genovese","Gambino","Bonanno","Colombo"], correct: 0 },
  { question: "Salvatore Maranzano was killed in?", choices: ["1931","1941","1951","1961"], correct: 0 },
  { question: "The Commission was created by?", choices: ["Luciano","Capone","Gotti","Maranzano"], correct: 0 },
  { question: "Henry Hill was the basis for?", choices: ["Goodfellas","Godfather","Casino","Sopranos"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MafiaQuizSettings): MafiaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MafiaQuizState, action: MafiaQuizAction): MafiaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MafiaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
