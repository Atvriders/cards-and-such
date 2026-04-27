import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RomeQuizSettings { questions: "10" | "20"; }
export interface RomeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RomeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Colosseum was completed in?",
    "choices": [
      "AD 80",
      "AD 200",
      "AD 500",
      "AD 1000"
    ],
    "correct": 0
  },
  {
    "question": "Vatican City is located in?",
    "choices": [
      "Florence",
      "Rome",
      "Milan",
      "Naples"
    ],
    "correct": 1
  },
  {
    "question": "The Roman Forum was the center of?",
    "choices": [
      "military training",
      "public life",
      "banking only",
      "markets only"
    ],
    "correct": 1
  },
  {
    "question": "The Pantheon's most famous feature is its?",
    "choices": [
      "frescoes",
      "dome",
      "spire",
      "stained glass"
    ],
    "correct": 1
  },
  {
    "question": "Spanish Steps connect to which church?",
    "choices": [
      "Saint Peter's",
      "Trinità dei Monti",
      "Saint John Lateran",
      "Sistine Chapel"
    ],
    "correct": 1
  },
  {
    "question": "The Trevi Fountain is famous for tossing?",
    "choices": [
      "bread",
      "coins",
      "flowers",
      "stones"
    ],
    "correct": 1
  },
  {
    "question": "Romulus & Remus founded Rome in?",
    "choices": [
      "753 BC",
      "500 BC",
      "100 AD",
      "27 BC"
    ],
    "correct": 0
  },
  {
    "question": "Sistine Chapel ceiling was painted by?",
    "choices": [
      "Raphael",
      "Michelangelo",
      "Donatello",
      "Caravaggio"
    ],
    "correct": 1
  },
  {
    "question": "Caesar was assassinated in?",
    "choices": [
      "44 BC",
      "27 BC",
      "100 BC",
      "60 AD"
    ],
    "correct": 0
  },
  {
    "question": "The seven hills of Rome include?",
    "choices": [
      "Aventine",
      "Olympus",
      "Vesuvius",
      "Etna"
    ],
    "correct": 0
  },
  {
    "question": "Tiber River flows through?",
    "choices": [
      "Florence",
      "Rome",
      "Naples",
      "Venice"
    ],
    "correct": 1
  },
  {
    "question": "Castel Sant'Angelo was originally a?",
    "choices": [
      "mausoleum",
      "temple",
      "theater",
      "library"
    ],
    "correct": 0
  },
  {
    "question": "Trastevere is known for?",
    "choices": [
      "banking",
      "cobblestoned trattorias & nightlife",
      "industry",
      "ports"
    ],
    "correct": 1
  },
  {
    "question": "Piazza Navona has fountains by?",
    "choices": [
      "Bernini",
      "Michelangelo",
      "Donatello",
      "Raphael"
    ],
    "correct": 0
  },
  {
    "question": "The Appian Way is an?",
    "choices": [
      "aqueduct",
      "ancient road",
      "tomb",
      "arena"
    ],
    "correct": 1
  },
  {
    "question": "The Lateran Treaty established Vatican City in?",
    "choices": [
      "1900",
      "1929",
      "1945",
      "1965"
    ],
    "correct": 1
  },
  {
    "question": "St Peter's Basilica was designed in part by?",
    "choices": [
      "Da Vinci",
      "Michelangelo",
      "Caravaggio",
      "Raphael"
    ],
    "correct": 1
  },
  {
    "question": "The Aurelian Walls were built around?",
    "choices": [
      "AD 270s",
      "BC 500",
      "AD 500",
      "BC 100"
    ],
    "correct": 0
  },
  {
    "question": "Roman aqueducts brought?",
    "choices": [
      "wine",
      "water",
      "grain",
      "oil"
    ],
    "correct": 1
  },
  {
    "question": "Cinecittà is Rome's famous?",
    "choices": [
      "fashion district",
      "film studios",
      "wine region",
      "port"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RomeQuizSettings): RomeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RomeQuizState, action: RomeQuizAction): RomeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RomeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
