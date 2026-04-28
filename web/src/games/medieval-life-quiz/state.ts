import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MedievalLifeQuizSettings { questions: "10" | "20" | "30"; }
export interface MedievalLifeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MedievalLifeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "What was the typical diet of a medieval peasant?",
    "choices": [
      "Beef and wine",
      "Bread, pottage, and ale",
      "Sushi and rice",
      "Tortillas and beans"
    ],
    "correct": 1
  },
  {
    "question": "A 'serf' in medieval Europe was?",
    "choices": [
      "A free knight",
      "A bound peasant farmer",
      "A king's advisor",
      "A monk"
    ],
    "correct": 1
  },
  {
    "question": "Which structure was the center of village life?",
    "choices": [
      "Bank",
      "Manor and church",
      "School",
      "Library"
    ],
    "correct": 1
  },
  {
    "question": "Medieval guilds regulated?",
    "choices": [
      "Knights",
      "Tradesmen and craftsmen",
      "Royalty",
      "Monks"
    ],
    "correct": 1
  },
  {
    "question": "What was the Black Death (14th century)?",
    "choices": [
      "A war",
      "A plague pandemic",
      "A famine",
      "A crusade"
    ],
    "correct": 1
  },
  {
    "question": "Manuscripts were copied by?",
    "choices": [
      "Printing press",
      "Monks in scriptoria",
      "Slaves",
      "Children"
    ],
    "correct": 1
  },
  {
    "question": "Which architectural style featured pointed arches?",
    "choices": [
      "Romanesque",
      "Gothic",
      "Baroque",
      "Art Deco"
    ],
    "correct": 1
  },
  {
    "question": "A medieval castle's central tower was called?",
    "choices": [
      "Bailey",
      "Keep",
      "Moat",
      "Gate"
    ],
    "correct": 1
  },
  {
    "question": "Trial by ordeal involved?",
    "choices": [
      "Jury vote",
      "Physical tests believed to reveal divine judgment",
      "Witnesses only",
      "Confession"
    ],
    "correct": 1
  },
  {
    "question": "Knights were trained starting as a?",
    "choices": [
      "Squire only",
      "Page, then squire",
      "Apprentice merchant",
      "Monk"
    ],
    "correct": 1
  },
  {
    "question": "Most medieval people lived in?",
    "choices": [
      "Cities",
      "Rural villages",
      "Forts",
      "Ships"
    ],
    "correct": 1
  },
  {
    "question": "Tournaments featured?",
    "choices": [
      "Chess",
      "Jousting and melee combat",
      "Soccer",
      "Theatre"
    ],
    "correct": 1
  },
  {
    "question": "What was a 'fief'?",
    "choices": [
      "A weapon",
      "Land granted in exchange for service",
      "A tax",
      "A monk's robe"
    ],
    "correct": 1
  },
  {
    "question": "Medieval calendar was based on?",
    "choices": [
      "Solar only",
      "Christian feast days",
      "Lunar only",
      "Roman months only"
    ],
    "correct": 1
  },
  {
    "question": "Universities first appeared in Europe in the?",
    "choices": [
      "8th century",
      "11th-12th centuries",
      "15th century",
      "17th century"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MedievalLifeQuizSettings): MedievalLifeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MedievalLifeQuizState, action: MedievalLifeQuizAction): MedievalLifeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MedievalLifeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
