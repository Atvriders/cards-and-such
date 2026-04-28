import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VoiceShowQuizSettings { questions: "10" | "20" | "30"; }
export interface VoiceShowQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VoiceShowQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Voice is based on a format from which country?", choices: ["UK","Netherlands","Sweden","USA"], correct: 1 },
  { question: "The Voice premiered on NBC in what year?", choices: ["2008","2010","2011","2013"], correct: 2 },
  { question: "Which coach has the most wins on The Voice?", choices: ["Adam Levine","Christina Aguilera","Blake Shelton","John Legend"], correct: 2 },
  { question: "What is the iconic chair feature?", choices: ["It plays music","It spins","It glows","It vibrates"], correct: 1 },
  { question: "Carson Daly hosts The Voice — true or false?", choices: ["True","False, it's Ryan Seacrest","False, it's Nick Cannon","False, it's Jenna Bush"], correct: 0 },
  { question: "Which round eliminates contestants in head-to-head duets?", choices: ["Knockouts","Battles","Playoffs","Lives"], correct: 1 },
  { question: "Adam Levine left The Voice in what year?", choices: ["2018","2019","2020","2021"], correct: 1 },
  { question: "Which Latin superstar joined as coach in 2019?", choices: ["Shakira","Marc Anthony","Gloria Estefan","Jennifer Lopez"], correct: 0 },
  { question: "Cassadee Pope, Season 3 winner, came from which genre?", choices: ["Country","Pop punk","R&B","Folk"], correct: 1 },
  { question: "Reba McEntire joined as coach in?", choices: ["2022","2023","2024","2025"], correct: 1 },
  { question: "Original coaches included CeeLo Green, Christina, Adam, and?", choices: ["Pharrell","Blake Shelton","Usher","Maroon 5's Mickey"], correct: 1 },
  { question: "Which judge famously called Coach Blake's country bias 'sneaky'?", choices: ["Adam","John Legend","Kelly Clarkson","Pharrell"], correct: 0 },
  { question: "What is a 'block' on The Voice?", choices: ["Stops a coach from getting a singer","Eliminates a singer","Saves a singer","Steals a singer"], correct: 0 },
  { question: "Pharrell Williams was a coach for how many seasons?", choices: ["3","4","5","7"], correct: 2 },
  { question: "Kelly Clarkson joined The Voice in?", choices: ["2016","2017","2018","2019"], correct: 2 },
  { question: "The Battle Rounds use what to determine winners?", choices: ["Audience vote","Coach decision","Other coaches","Random"], correct: 1 },
  { question: "Niall Horan first joined The Voice in?", choices: ["2021","2022","2023","2024"], correct: 2 },
  { question: "Which Season 3 winner is a country singer-songwriter?", choices: ["Cassadee Pope","Danielle Bradbery","Craig Wayne Boyd","Sundance Head"], correct: 0 },
  { question: "John Legend won Season 16 with which contestant?", choices: ["Maelyn Jarmon","Chevel Shepherd","Brynn Cartelli","Jordan Smith"], correct: 0 },
  { question: "Coaches sit during blind auditions facing?", choices: ["Audience","Each other","Away from contestant","Toward contestant"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VoiceShowQuizSettings): VoiceShowQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VoiceShowQuizState, action: VoiceShowQuizAction): VoiceShowQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VoiceShowQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
