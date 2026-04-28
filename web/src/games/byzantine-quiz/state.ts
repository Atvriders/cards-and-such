import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ByzantineQuizSettings { questions: "10" | "20" | "30"; }
export interface ByzantineQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ByzantineQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Byzantine Empire was the eastern half of the?",
    "choices": [
      "Persian Empire",
      "Roman Empire",
      "Greek city-states",
      "Mongol Empire"
    ],
    "correct": 1
  },
  {
    "question": "Capital city of the Byzantine Empire?",
    "choices": [
      "Rome",
      "Constantinople",
      "Athens",
      "Alexandria"
    ],
    "correct": 1
  },
  {
    "question": "Justinian's law code is called?",
    "choices": [
      "Twelve Tables",
      "Corpus Juris Civilis",
      "Magna Carta",
      "Code Napoleon"
    ],
    "correct": 1
  },
  {
    "question": "Hagia Sophia was built under?",
    "choices": [
      "Constantine",
      "Justinian",
      "Heraclius",
      "Basil II"
    ],
    "correct": 1
  },
  {
    "question": "Greek fire was a?",
    "choices": [
      "Festival",
      "Naval incendiary weapon",
      "Religion",
      "Coin"
    ],
    "correct": 1
  },
  {
    "question": "Empire fell in?",
    "choices": [
      "1099",
      "1453",
      "1517",
      "1204"
    ],
    "correct": 1
  },
  {
    "question": "Iconoclasm was about?",
    "choices": [
      "Idol-worship debate",
      "Imperial succession",
      "Tax",
      "Trade"
    ],
    "correct": 0
  },
  {
    "question": "Theodora was empress and wife of?",
    "choices": [
      "Constantine",
      "Justinian",
      "Heraclius",
      "Basil"
    ],
    "correct": 1
  },
  {
    "question": "Byzantine state religion was?",
    "choices": [
      "Catholic Christianity",
      "Eastern Orthodox Christianity",
      "Islam",
      "Paganism"
    ],
    "correct": 1
  },
  {
    "question": "Schism of 1054 separated which churches?",
    "choices": [
      "Coptic and Orthodox",
      "Catholic and Orthodox",
      "Lutheran and Catholic",
      "Anglican and Catholic"
    ],
    "correct": 1
  },
  {
    "question": "Fourth Crusade (1204) sacked?",
    "choices": [
      "Jerusalem",
      "Constantinople",
      "Cairo",
      "Baghdad"
    ],
    "correct": 1
  },
  {
    "question": "Byzantine emperors used the title?",
    "choices": [
      "Caesar only",
      "Basileus",
      "Pharaoh",
      "Sultan"
    ],
    "correct": 1
  },
  {
    "question": "Currency of Byzantium widely used?",
    "choices": [
      "Denarius",
      "Solidus / nomisma",
      "Ducat",
      "Florin"
    ],
    "correct": 1
  },
  {
    "question": "Komnenos dynasty ruled in the?",
    "choices": [
      "6th century",
      "11th-12th centuries",
      "14th century",
      "15th century"
    ],
    "correct": 1
  },
  {
    "question": "Last Byzantine emperor was?",
    "choices": [
      "Constantine XI",
      "Justinian II",
      "Basil II",
      "Heraclius"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ByzantineQuizSettings): ByzantineQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ByzantineQuizState, action: ByzantineQuizAction): ByzantineQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ByzantineQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
