import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BankHeistsQuizSettings { questions: "10" | "20"; }
export interface BankHeistsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BankHeistsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Banco Central in Fortaleza (Brazil, 2005) was robbed via?",
    "choices": [
      "Tunnel",
      "Helicopter",
      "Inside man",
      "Disguises"
    ],
    "correct": 0
  },
  {
    "question": "Roughly how much did the Banco Central thieves take?",
    "choices": [
      "$5 million",
      "$30 million",
      "$70 million",
      "$200 million"
    ],
    "correct": 2
  },
  {
    "question": "Butch Cassidy was leader of?",
    "choices": [
      "The Wild Bunch",
      "The Dalton Gang",
      "The James-Younger Gang",
      "The Doolin-Dalton Gang"
    ],
    "correct": 0
  },
  {
    "question": "Antwerp Diamond Centre robbed in?",
    "choices": [
      "1999",
      "2003",
      "2008",
      "2013"
    ],
    "correct": 1
  },
  {
    "question": "Heist ringleader of Antwerp?",
    "choices": [
      "Leonardo Notarbartolo",
      "Carlo Gambino",
      "Bernie Madoff",
      "Charles Manson"
    ],
    "correct": 0
  },
  {
    "question": "Northern Bank robbery (Belfast 2004) — accused group?",
    "choices": [
      "IRA",
      "UVF",
      "ETA",
      "Mafia"
    ],
    "correct": 0
  },
  {
    "question": "British Bank of the Middle East was hit in?",
    "choices": [
      "Beirut 1976",
      "Cairo 1980",
      "Tehran 1979",
      "Dubai 1985"
    ],
    "correct": 0
  },
  {
    "question": "1997 North Hollywood shootout was tied to a?",
    "choices": [
      "Bank robbery",
      "Diamond heist",
      "Casino heist",
      "Train robbery"
    ],
    "correct": 0
  },
  {
    "question": "Which 1995 Pacino/De Niro film features a bank/armored car heist?",
    "choices": [
      "Heat",
      "Casino",
      "Goodfellas",
      "Donnie Brasco"
    ],
    "correct": 0
  },
  {
    "question": "1973 Stockholm robbery led to which term?",
    "choices": [
      "Gaslighting",
      "Stockholm Syndrome",
      "Karen",
      "Lima Effect"
    ],
    "correct": 1
  },
  {
    "question": "Brink's-Mat (UK 1983) main loot?",
    "choices": [
      "Cash",
      "Gold bullion",
      "Diamonds",
      "Bonds"
    ],
    "correct": 1
  },
  {
    "question": "Loomis Fargo (US 1997) — winner of which TV-style nickname?",
    "choices": [
      "Hillbilly Heist",
      "Big Easy Heist",
      "Iceman Heist",
      "Bayou Job"
    ],
    "correct": 0
  },
  {
    "question": "Approximate value of Brink's-Mat haul?",
    "choices": [
      "£1m",
      "£26m",
      "£100m",
      "£500m"
    ],
    "correct": 1
  },
  {
    "question": "Knightsbridge Security Deposit (1987) involved?",
    "choices": [
      "Tunnel",
      "Inside-fake-customer",
      "Insider customer (Valerio Viccei)",
      "Heist by night cleaners"
    ],
    "correct": 2
  }
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
