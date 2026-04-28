import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ParalympicsQuizSettings { questions: "10" | "20"; }
export interface ParalympicsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ParalympicsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what year were the first Paralympic Games held?", choices: ["1948", "1960", "1972", "1984"], correct: 1 },
  { question: "Where were the first official Paralympic Games held?", choices: ["Tokyo", "Rome", "London", "Stoke Mandeville"], correct: 1 },
  { question: "Who is considered the founder of the Paralympic movement?", choices: ["Pierre de Coubertin", "Ludwig Guttmann", "Avery Brundage", "Juan Antonio Samaranch"], correct: 1 },
  { question: "Where were the first Winter Paralympics held in 1976?", choices: ["Lake Placid", "Innsbruck", "Örnsköldsvik, Sweden", "Sapporo"], correct: 2 },
  { question: "What is the Paralympic motto?", choices: ["Faster, Higher, Stronger", "Spirit in Motion", "Strength Within", "Beyond Limits"], correct: 1 },
  { question: "Which country has won the most Paralympic medals overall?", choices: ["Germany", "USA", "UK", "Netherlands"], correct: 1 },
  { question: "Where were the 2012 Paralympic Games held?", choices: ["Beijing", "London", "Rio", "Athens"], correct: 1 },
  { question: "Where were the 2016 Paralympic Games held?", choices: ["London", "Rio de Janeiro", "Sydney", "Athens"], correct: 1 },
  { question: "How many sports are in the Summer Paralympics?", choices: ["Around 10", "Around 22", "Around 30", "Around 50"], correct: 1 },
  { question: "What term replaced 'wheelchair-bound' in modern Paralympic media?", choices: ["Wheelchair user", "Disabled", "Cripple", "Special"], correct: 0 },
  { question: "Which sport features visually impaired athletes with bells in the ball?", choices: ["Wheelchair tennis", "Goalball", "Boccia", "Sitting volleyball"], correct: 1 },
  { question: "Where were the 2020 Paralympic Games held (postponed to 2021)?", choices: ["Tokyo", "Beijing", "Paris", "Sydney"], correct: 0 },
  { question: "Which Paralympian is known as 'Blade Runner'?", choices: ["Tatyana McFadden", "Oscar Pistorius", "Jonnie Peacock", "Markus Rehm"], correct: 1 },
  { question: "Where were the 2024 Paralympic Games held?", choices: ["Paris", "Los Angeles", "Brisbane", "Tokyo"], correct: 0 },
  { question: "Boccia is similar to which mainstream game?", choices: ["Bocce/petanque", "Bowling", "Curling", "Tennis"], correct: 0 },
  { question: "Which is NOT a Paralympic event?", choices: ["Wheelchair rugby", "Sitting volleyball", "Pole vault", "Goalball"], correct: 2 },
  { question: "Sled hockey is a Winter Paralympic sport. True or false?", choices: ["True", "False", "Only in Europe", "Only in USA"], correct: 0 },
  { question: "Where were the 2008 Paralympic Games held?", choices: ["Athens", "Beijing", "Sydney", "London"], correct: 1 },
  { question: "Where were the 2014 Winter Paralympics held?", choices: ["Vancouver", "Pyeongchang", "Sochi", "Beijing"], correct: 2 },
  { question: "What is the symbol of the Paralympic Games?", choices: ["Five rings", "Three Agitos", "Olive branch", "Dove"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ParalympicsQuizSettings): ParalympicsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ParalympicsQuizState, action: ParalympicsQuizAction): ParalympicsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ParalympicsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
