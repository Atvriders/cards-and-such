import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HinduMythQuizSettings { questions: "10" | "20" | "30"; }
export interface HinduMythQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HinduMythQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who is the destroyer in the Hindu trinity?",
    "choices": [
      "Brahma",
      "Vishnu",
      "Shiva",
      "Indra"
    ],
    "correct": 2
  },
  {
    "question": "Who is the preserver in the Hindu trinity?",
    "choices": [
      "Brahma",
      "Vishnu",
      "Shiva",
      "Yama"
    ],
    "correct": 1
  },
  {
    "question": "Who is the creator god of the trinity?",
    "choices": [
      "Brahma",
      "Vishnu",
      "Shiva",
      "Surya"
    ],
    "correct": 0
  },
  {
    "question": "Who is the elephant-headed god?",
    "choices": [
      "Hanuman",
      "Ganesha",
      "Kartikeya",
      "Krishna"
    ],
    "correct": 1
  },
  {
    "question": "Who is the monkey god of the Ramayana?",
    "choices": [
      "Hanuman",
      "Sugriva",
      "Bali",
      "Jambavan"
    ],
    "correct": 0
  },
  {
    "question": "Who is the hero of the Ramayana?",
    "choices": [
      "Krishna",
      "Arjuna",
      "Rama",
      "Bhima"
    ],
    "correct": 2
  },
  {
    "question": "Who is Rama's wife?",
    "choices": [
      "Sita",
      "Radha",
      "Draupadi",
      "Lakshmi"
    ],
    "correct": 0
  },
  {
    "question": "Who kidnapped Sita?",
    "choices": [
      "Ravana",
      "Kumbhakarna",
      "Indrajit",
      "Vibhishana"
    ],
    "correct": 0
  },
  {
    "question": "Who is the warrior prince of the Bhagavad Gita?",
    "choices": [
      "Bhima",
      "Yudhishthira",
      "Arjuna",
      "Karna"
    ],
    "correct": 2
  },
  {
    "question": "Who serves as Arjuna's charioteer and counselor?",
    "choices": [
      "Krishna",
      "Vishnu",
      "Indra",
      "Balarama"
    ],
    "correct": 0
  },
  {
    "question": "What is the great war epic featuring the Pandavas and Kauravas?",
    "choices": [
      "Ramayana",
      "Mahabharata",
      "Bhagavata Purana",
      "Brahma Sutras"
    ],
    "correct": 1
  },
  {
    "question": "How many Pandava brothers are there?",
    "choices": [
      "3",
      "5",
      "7",
      "9"
    ],
    "correct": 1
  },
  {
    "question": "Who is the god of thunder and king of the devas?",
    "choices": [
      "Surya",
      "Indra",
      "Agni",
      "Varuna"
    ],
    "correct": 1
  },
  {
    "question": "Who is the goddess of wealth?",
    "choices": [
      "Saraswati",
      "Lakshmi",
      "Parvati",
      "Durga"
    ],
    "correct": 1
  },
  {
    "question": "Who is the goddess of learning and music?",
    "choices": [
      "Saraswati",
      "Lakshmi",
      "Parvati",
      "Kali"
    ],
    "correct": 0
  },
  {
    "question": "Who is the fierce warrior goddess riding a lion or tiger?",
    "choices": [
      "Lakshmi",
      "Saraswati",
      "Durga",
      "Sita"
    ],
    "correct": 2
  },
  {
    "question": "Who is the dark goddess of time and destruction?",
    "choices": [
      "Durga",
      "Kali",
      "Parvati",
      "Lakshmi"
    ],
    "correct": 1
  },
  {
    "question": "What is Shiva's third-eye weapon?",
    "choices": [
      "Pashupatastra",
      "Trishula",
      "Sudarshana",
      "Brahmastra"
    ],
    "correct": 0
  },
  {
    "question": "What weapon does Shiva carry?",
    "choices": [
      "Bow",
      "Trident (Trishula)",
      "Discus",
      "Mace"
    ],
    "correct": 1
  },
  {
    "question": "What is Vishnu's spinning discus weapon?",
    "choices": [
      "Sudarshana Chakra",
      "Kaumodaki",
      "Sharanga",
      "Nandaka"
    ],
    "correct": 0
  },
  {
    "question": "Who is Krishna's consort and beloved?",
    "choices": [
      "Sita",
      "Radha",
      "Rukmini",
      "Draupadi"
    ],
    "correct": 1
  },
  {
    "question": "What is the sacred syllable representing the universe?",
    "choices": [
      "Om",
      "Shanti",
      "Namah",
      "Hari"
    ],
    "correct": 0
  },
  {
    "question": "Who is the god of fire?",
    "choices": [
      "Agni",
      "Vayu",
      "Varuna",
      "Yama"
    ],
    "correct": 0
  },
  {
    "question": "Who is the god of death?",
    "choices": [
      "Yama",
      "Kubera",
      "Agni",
      "Indra"
    ],
    "correct": 0
  },
  {
    "question": "What are Vishnu's ten incarnations called?",
    "choices": [
      "Avatars",
      "Devatas",
      "Asuras",
      "Adityas"
    ],
    "correct": 0
  },
  {
    "question": "Which avatar of Vishnu is Krishna?",
    "choices": [
      "7th",
      "8th",
      "9th",
      "10th"
    ],
    "correct": 1
  },
  {
    "question": "Which avatar of Vishnu is Rama?",
    "choices": [
      "6th",
      "7th",
      "8th",
      "9th"
    ],
    "correct": 1
  },
  {
    "question": "Who is the future avatar of Vishnu?",
    "choices": [
      "Kalki",
      "Buddha",
      "Parashurama",
      "Vamana"
    ],
    "correct": 0
  },
  {
    "question": "What is Shiva's mountain home?",
    "choices": [
      "Mount Meru",
      "Mount Kailash",
      "Vaikuntha",
      "Mount Mandara"
    ],
    "correct": 1
  },
  {
    "question": "What is Vishnu's heavenly abode?",
    "choices": [
      "Vaikuntha",
      "Kailash",
      "Swarga",
      "Brahmaloka"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HinduMythQuizSettings): HinduMythQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HinduMythQuizState, action: HinduMythQuizAction): HinduMythQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HinduMythQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
