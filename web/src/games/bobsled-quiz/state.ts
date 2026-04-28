import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BobsledQuizSettings { questions: "10" | "20"; }
export interface BobsledQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BobsledQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many people typically race in an Olympic bobsled?", choices: ["1 or 2", "2 or 4", "3 or 5", "5 or 6"], correct: 1 },
  { question: "Where did bobsled originate?", choices: ["Switzerland", "Norway", "Canada", "Austria"], correct: 0 },
  { question: "When did bobsled debut at the Olympics?", choices: ["1908", "1924", "1932", "1948"], correct: 1 },
  { question: "Which country famously had a Caribbean bobsled team?", choices: ["Cuba", "Bahamas", "Jamaica", "Trinidad"], correct: 2 },
  { question: "In what year did Jamaica enter their first Olympic bobsled?", choices: ["1984", "1988", "1992", "1994"], correct: 1 },
  { question: "Which film popularized Jamaican bobsled?", choices: ["Cool Runnings", "Eddie the Eagle", "The Mighty Ducks", "Slap Shot"], correct: 0 },
  { question: "What is a typical top speed in Olympic bobsled?", choices: ["80 km/h", "120 km/h", "150 km/h", "200 km/h"], correct: 1 },
  { question: "Which related sport uses single-person face-down sleds?", choices: ["Skeleton", "Luge", "Curling", "Tobogganing"], correct: 0 },
  { question: "Which related sport features single rider face-up?", choices: ["Skeleton", "Luge", "Bobsled", "Snocross"], correct: 1 },
  { question: "Bobsled tracks are made of?", choices: ["Snow", "Sand", "Refrigerated concrete with ice", "Steel"], correct: 2 },
  { question: "How long is an Olympic bobsled track?", choices: ["500m", "1000m", "1500m", "2000m"], correct: 2 },
  { question: "What is a typical bobsled track vertical drop?", choices: ["50m", "100m", "120m+", "300m"], correct: 2 },
  { question: "Which country dominates bobsled medal counts?", choices: ["USA", "Switzerland", "Germany", "Italy"], correct: 2 },
  { question: "Women's bobsled debuted at the Olympics in?", choices: ["1998", "2002", "2006", "2010"], correct: 1 },
  { question: "Skeleton was reintroduced as Olympic in?", choices: ["1992", "1998", "2002", "2010"], correct: 2 },
  { question: "How many turns are typical on Olympic bobsled tracks?", choices: ["8-10", "12-14", "15-20", "25+"], correct: 2 },
  { question: "What's the name of the front bobsled occupant?", choices: ["Pilot", "Driver", "Captain", "Pilot or driver"], correct: 3 },
  { question: "Which Olympics introduced the monobob (1-woman bobsled)?", choices: ["2018 PyeongChang", "2022 Beijing", "2014 Sochi", "2010 Vancouver"], correct: 1 },
  { question: "Who is a famous American bobsledder of recent years?", choices: ["Steven Holcomb", "Apolo Ohno", "Shaun White", "Bode Miller"], correct: 0 },
  { question: "Which sport is bobsled most adjacent to in winter Olympics?", choices: ["Curling", "Luge and skeleton", "Cross-country skiing", "Speed skating"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BobsledQuizSettings): BobsledQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BobsledQuizState, action: BobsledQuizAction): BobsledQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BobsledQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
