import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OlympicQuizSettings { questions: "10" | "20" | "30"; }
export interface OlympicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OlympicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what country did the ancient Olympics begin?", choices: ["Greece","Rome","Egypt","Persia"], correct: 0 },
  { question: "In what year did modern Olympics begin?", choices: ["1896","1900","1888","1904"], correct: 0 },
  { question: "Where were the first modern Olympics held?", choices: ["Athens","Paris","London","Rome"], correct: 0 },
  { question: "How often are Summer Olympics held?", choices: ["Every 4 years","Every 2 years","Every year","Every 5 years"], correct: 0 },
  { question: "How often are Winter Olympics held?", choices: ["Every 4 years","Every 2 years","Every year","Same as summer (since 1994 staggered)"], correct: 0 },
  { question: "Who founded modern Olympics?", choices: ["Pierre de Coubertin","Just Coubertin","Both","French baron"], correct: 2 },
  { question: "What's the Olympic motto?", choices: ["Faster, Higher, Stronger - Together","Just three","Both","Just motto"], correct: 2 },
  { question: "What's the Olympic flag?", choices: ["Five interlocking rings on white","Just rings","Both","Just symbol"], correct: 2 },
  { question: "What do the 5 rings represent?", choices: ["Five continents","Just rings","Both","Just symbolism"], correct: 2 },
  { question: "What colors are the rings?", choices: ["Blue, yellow, black, green, red","Just colors","Both","Just five"], correct: 2 },
  { question: "Who's the most decorated Olympian?", choices: ["Michael Phelps","Just Phelps","Both","Just swimmer"], correct: 2 },
  { question: "How many Olympic medals does Phelps have?", choices: ["28","23","24","30"], correct: 0 },
  { question: "How many gold medals does Phelps have?", choices: ["23","20","25","18"], correct: 0 },
  { question: "Who's the fastest man (100m record)?", choices: ["Usain Bolt","Just Bolt","Both","Other"], correct: 2 },
  { question: "What's Bolt's 100m record?", choices: ["9.58","9.69","9.79","9.49"], correct: 0 },
  { question: "How many gold medals does Bolt have?", choices: ["8","9","7","10"], correct: 0 },
  { question: "What's the marathon distance?", choices: ["42.195 km","26.2 miles","Both","Just 42 km"], correct: 2 },
  { question: "In what year did Tokyo first host Summer Olympics?", choices: ["1964","1968","1972","1960"], correct: 0 },
  { question: "Where were 2020 Summer Olympics held (held 2021)?", choices: ["Tokyo","London","Rio","Beijing"], correct: 0 },
  { question: "Where were 2024 Olympics held?", choices: ["Paris","LA","Brisbane","Tokyo"], correct: 0 },
  { question: "Where will 2028 Olympics be held?", choices: ["Los Angeles","Brisbane","Paris","London"], correct: 0 },
  { question: "What's the Olympic torch relay?", choices: ["Carrying flame from Olympia to host","Just relay","Both","Tradition"], correct: 2 },
  { question: "What's the Decathlon?", choices: ["10 events over 2 days","Just 10","Both","Track and field combined"], correct: 2 },
  { question: "What's the Heptathlon?", choices: ["Women's 7-event combined","Just 7","Both","Multi-event"], correct: 2 },
  { question: "What's the Iron Curtain era boycott Olympics?", choices: ["1980 Moscow (US-led boycott), 1984 LA (Soviet boycott)","Just one","Both","Both boycotts"], correct: 3 },
  { question: "What 1972 Olympics had a tragedy?", choices: ["Munich (Israeli athletes killed)","Just Munich","Both","Just terror"], correct: 2 },
  { question: "What sport debuted at Tokyo 2020?", choices: ["Skateboarding, Surfing, Sport Climbing, Karate","Just one","Multiple","All listed"], correct: 3 },
  { question: "What was the original modern Olympic sports list size?", choices: ["~9 sports","~5","~15","~20"], correct: 0 },
  { question: "Who lit the torch at Atlanta 1996?", choices: ["Muhammad Ali","Just Ali","Both","Boxer"], correct: 2 },
  { question: "What's the Paralympics?", choices: ["Olympics for athletes with disabilities","Just disability sport","Both","After Olympics"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OlympicQuizSettings): OlympicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OlympicQuizState, action: OlympicQuizAction): OlympicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OlympicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
