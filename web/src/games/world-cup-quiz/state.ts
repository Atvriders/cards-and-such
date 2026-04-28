import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WorldCupQuizSettings { questions: "10" | "20" | "30"; }
export interface WorldCupQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WorldCupQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who won the first FIFA World Cup in 1930?",
    "choices": [
      "Brazil",
      "Uruguay",
      "Argentina",
      "Italy"
    ],
    "correct": 1
  },
  {
    "question": "Which country has won the most World Cups?",
    "choices": [
      "Germany",
      "Italy",
      "Brazil",
      "Argentina"
    ],
    "correct": 2
  },
  {
    "question": "Who scored the famous 'Hand of God' goal?",
    "choices": [
      "Pelé",
      "Maradona",
      "Zidane",
      "Romário"
    ],
    "correct": 1
  },
  {
    "question": "Where was the 2014 World Cup held?",
    "choices": [
      "Brazil",
      "South Africa",
      "Russia",
      "Germany"
    ],
    "correct": 0
  },
  {
    "question": "Which player won the Golden Ball at 2022 World Cup?",
    "choices": [
      "Mbappé",
      "Messi",
      "Modrić",
      "Neymar"
    ],
    "correct": 1
  },
  {
    "question": "How often is the World Cup held?",
    "choices": [
      "Every 2 years",
      "Every 3 years",
      "Every 4 years",
      "Every 5 years"
    ],
    "correct": 2
  },
  {
    "question": "Who won the 2018 World Cup?",
    "choices": [
      "Croatia",
      "France",
      "Brazil",
      "Belgium"
    ],
    "correct": 1
  },
  {
    "question": "Who is the all-time top World Cup scorer?",
    "choices": [
      "Klose",
      "Ronaldo",
      "Pelé",
      "Müller"
    ],
    "correct": 0
  },
  {
    "question": "Which team did Zidane head-butt in 2006 final?",
    "choices": [
      "Italy",
      "Brazil",
      "Spain",
      "Germany"
    ],
    "correct": 0
  },
  {
    "question": "Where was the 2010 World Cup held?",
    "choices": [
      "South Africa",
      "Brazil",
      "Germany",
      "Japan"
    ],
    "correct": 0
  },
  {
    "question": "Who won the 2002 World Cup?",
    "choices": [
      "Germany",
      "Brazil",
      "France",
      "Italy"
    ],
    "correct": 1
  },
  {
    "question": "Which year did Italy win their fourth title?",
    "choices": [
      "1998",
      "2002",
      "2006",
      "2010"
    ],
    "correct": 2
  },
  {
    "question": "Who hosted the 1994 World Cup?",
    "choices": [
      "USA",
      "Mexico",
      "France",
      "Italy"
    ],
    "correct": 0
  },
  {
    "question": "Argentina's 1986 captain was?",
    "choices": [
      "Kempes",
      "Maradona",
      "Batistuta",
      "Passarella"
    ],
    "correct": 1
  },
  {
    "question": "Who won the Golden Boot in 2014?",
    "choices": [
      "Messi",
      "James Rodríguez",
      "Neymar",
      "Müller"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WorldCupQuizSettings): WorldCupQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WorldCupQuizState, action: WorldCupQuizAction): WorldCupQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WorldCupQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
