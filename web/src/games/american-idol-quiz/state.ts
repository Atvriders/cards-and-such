import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AmericanIdolQuizSettings { questions: "10" | "20" | "30"; }
export interface AmericanIdolQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AmericanIdolQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who won the first season of American Idol in 2002?", choices: ["Justin Guarini","Ruben Studdard","Kelly Clarkson","Clay Aiken"], correct: 2 },
  { question: "Which Season 4 winner became a country superstar?", choices: ["Carrie Underwood","Bo Bice","Vonzell Solomon","Anthony Fedorov"], correct: 0 },
  { question: "Who was the original British host?", choices: ["Ryan Seacrest","Brian Dunkleman","Simon Cowell","Cat Deeley"], correct: 1 },
  { question: "Simon Cowell judged for how many seasons?", choices: ["7","9","11","12"], correct: 1 },
  { question: "Jennifer Hudson placed which in Season 3?", choices: ["7th","5th","3rd","2nd"], correct: 0 },
  { question: "The show originally aired on which network?", choices: ["NBC","ABC","Fox","CBS"], correct: 2 },
  { question: "Adam Lambert was runner-up in which season?", choices: ["7","8","9","10"], correct: 1 },
  { question: "What was the show's parent UK format?", choices: ["X Factor","Pop Idol","The Voice","Big Brother"], correct: 1 },
  { question: "Phillip Phillips's coronation song was?", choices: ["Home","Gone Gone Gone","Raging Fire","Where We Came From"], correct: 0 },
  { question: "Which judge famously called himself 'The Dawg Pound' leader?", choices: ["Randy Jackson","Paula Abdul","Steven Tyler","Keith Urban"], correct: 0 },
  { question: "Sanjaya Malakar is famous from which season?", choices: ["5","6","7","8"], correct: 1 },
  { question: "American Idol moved to which network in 2018?", choices: ["NBC","CBS","ABC","The CW"], correct: 2 },
  { question: "Who won Season 17 (first ABC season)?", choices: ["Maddie Poppe","Laine Hardy","Just Sam","Chayce Beckham"], correct: 1 },
  { question: "The producer who created Idol was?", choices: ["Simon Cowell","Simon Fuller","Mark Burnett","Nigel Lythgoe"], correct: 1 },
  { question: "William Hung's audition song was?", choices: ["Believe","She Bangs","Let's Get It Started","I Will Survive"], correct: 1 },
  { question: "Which Idol won Best Original Song at the Oscars (2007)?", choices: ["Carrie Underwood","Jennifer Hudson","Fantasia","Kelly Clarkson"], correct: 1 },
  { question: "Idol's longtime announcer was?", choices: ["Don LaFontaine","Ryan Seacrest","Don Pardo","Ed Powell"], correct: 0 },
  { question: "Fantasia Barrino won which season?", choices: ["2","3","4","5"], correct: 1 },
  { question: "Which judge replaced Simon Cowell in 2011?", choices: ["Jennifer Lopez","Steven Tyler","Both","Mariah Carey"], correct: 2 },
  { question: "Lionel Richie joined the ABC reboot panel along with?", choices: ["Katy Perry & Luke Bryan","JLo & Keith","Mariah & Nicki","Harry Connick Jr."], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AmericanIdolQuizSettings): AmericanIdolQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AmericanIdolQuizState, action: AmericanIdolQuizAction): AmericanIdolQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AmericanIdolQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
