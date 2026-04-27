import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PrinceQuizSettings { questions: "10" | "20" | "30"; }
export interface PrinceQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PrinceQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Prince's birth name?", choices: ["Prince Rogers Nelson", "Prince Williams", "Roger Prince", "Prince Anderson"], correct: 0 },
  { question: "Prince's hometown?", choices: ["Minneapolis", "Detroit", "Chicago", "Atlanta"], correct: 0 },
  { question: "Year of birth?", choices: ["1956", "1958", "1960", "1962"], correct: 1 },
  { question: "Year of death?", choices: ["2014", "2016", "2018", "2020"], correct: 1 },
  { question: "Cause of death?", choices: ["Accidental fentanyl overdose", "Cancer", "Heart attack", "Stroke"], correct: 0 },
  { question: "Prince's home/studio compound?", choices: ["Paisley Park", "Graceland", "Neverland", "Pleasure Dome"], correct: 0 },
  { question: "Most famous album?", choices: ["Purple Rain", "1999", "Sign o' the Times", "Lovesexy"], correct: 0 },
  { question: "'Purple Rain' year?", choices: ["1982", "1984", "1986", "1988"], correct: 1 },
  { question: "Was 'Purple Rain' both album and film?", choices: ["Yes", "Album only", "Film only", "TV special only"], correct: 0 },
  { question: "Prince played guitar in what style?", choices: ["Funk", "Rock", "Both fluently", "Mainly jazz"], correct: 2 },
  { question: "Prince's backing band?", choices: ["The Revolution", "The E Street Band", "The Heartbreakers", "Wings"], correct: 0 },
  { question: "Prince's symbol period began in?", choices: ["1991", "1993", "1995", "1997"], correct: 1 },
  { question: "Prince's nickname during symbol era?", choices: ["The Artist", "TAFKAP", "Both", "Camille"], correct: 2 },
  { question: "What does TAFKAP stand for?", choices: ["The Artist Formerly Known As Prince", "The Artist For Kingdom And Power", "The Artist From Kentucky And Paris", "The Artist Forever Known As Prince"], correct: 0 },
  { question: "'Little Red Corvette' year?", choices: ["1981", "1982", "1984", "1985"], correct: 1 },
  { question: "'When Doves Cry' is from?", choices: ["1999", "Purple Rain", "Sign o' the Times", "Diamonds and Pearls"], correct: 1 },
  { question: "'Kiss' year?", choices: ["1984", "1986", "1988", "1990"], correct: 1 },
  { question: "Prince wrote 'Manic Monday' for?", choices: ["The Bangles", "Cyndi Lauper", "Madonna", "Stevie Nicks"], correct: 0 },
  { question: "Prince wrote 'Nothing Compares 2 U', made famous by?", choices: ["Sinead O'Connor", "Whitney Houston", "Mariah Carey", "Celine Dion"], correct: 0 },
  { question: "Prince's protégé Apollonia featured in?", choices: ["Purple Rain", "Sign o' the Times", "Under the Cherry Moon", "Graffiti Bridge"], correct: 0 },
  { question: "How many Grammy Awards did Prince win?", choices: ["3", "5", "7", "10"], correct: 2 },
  { question: "Prince won an Oscar for?", choices: ["Purple Rain (Original Song Score)", "Best Picture", "Best Director", "He didn't"], correct: 0 },
  { question: "Prince Rock and Roll Hall of Fame induction?", choices: ["2002", "2004", "2006", "2008"], correct: 1 },
  { question: "'Cream' was a hit from which album?", choices: ["Diamonds and Pearls", "Purple Rain", "1999", "Lovesexy"], correct: 0 },
  { question: "'Raspberry Beret' year?", choices: ["1983", "1985", "1987", "1989"], correct: 1 },
  { question: "Prince's super bowl halftime show year?", choices: ["2005", "2007", "2009", "2011"], correct: 1 },
  { question: "Prince Super Bowl famously rained during?", choices: ["Purple Rain", "Kiss", "1999", "Cream"], correct: 0 },
  { question: "First label?", choices: ["Warner Bros", "Atlantic", "Motown", "Columbia"], correct: 0 },
  { question: "Did Prince play multiple instruments?", choices: ["Yes, dozens", "Just guitar", "Just keyboards", "Just drums"], correct: 0 },
  { question: "Prince's height?", choices: ["5'2\"", "5'7\"", "6'0\"", "6'4\""], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PrinceQuizSettings): PrinceQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PrinceQuizState, action: PrinceQuizAction): PrinceQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PrinceQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
