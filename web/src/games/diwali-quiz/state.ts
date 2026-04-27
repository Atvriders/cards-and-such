import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DiwaliQuizSettings { questions: "10" | "20" | "30"; }
export interface DiwaliQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DiwaliQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Diwali is the festival of?",
    "choices": [
      "Water",
      "Lights",
      "Music",
      "Colour"
    ],
    "correct": 1
  },
  {
    "question": "Diwali lasts how many days?",
    "choices": [
      "3",
      "5",
      "7",
      "10"
    ],
    "correct": 1
  },
  {
    "question": "Hindu goddess associated with Diwali?",
    "choices": [
      "Saraswati",
      "Lakshmi",
      "Durga",
      "Parvati"
    ],
    "correct": 1
  },
  {
    "question": "Diwali commemorates Rama's return to?",
    "choices": [
      "Lanka",
      "Ayodhya",
      "Mithila",
      "Dwarka"
    ],
    "correct": 1
  },
  {
    "question": "Rama defeated which demon king?",
    "choices": [
      "Ravana",
      "Mahishasura",
      "Hiranyakashipu",
      "Tarakasura"
    ],
    "correct": 0
  },
  {
    "question": "Small lamps lit during Diwali are called?",
    "choices": [
      "Chai",
      "Diyas",
      "Pulses",
      "Karma"
    ],
    "correct": 1
  },
  {
    "question": "Diwali falls in which months?",
    "choices": [
      "Jan-Feb",
      "Apr-May",
      "Oct-Nov",
      "Dec-Jan"
    ],
    "correct": 2
  },
  {
    "question": "Rangoli is made from?",
    "choices": [
      "Petals/powders",
      "Glass",
      "Wood",
      "Wax"
    ],
    "correct": 0
  },
  {
    "question": "Sweets are called?",
    "choices": [
      "Halwa",
      "Mithai",
      "Laddoo",
      "Burfi"
    ],
    "correct": 1
  },
  {
    "question": "Diwali is most associated with which religion?",
    "choices": [
      "Hindu",
      "Sikh",
      "Jain",
      "All these"
    ],
    "correct": 3
  },
  {
    "question": "Sikhs celebrate Diwali as?",
    "choices": [
      "Bandi Chhor Divas",
      "Vaisakhi",
      "Hola Mohalla",
      "Gurpurab"
    ],
    "correct": 0
  },
  {
    "question": "Goddess Lakshmi is associated with?",
    "choices": [
      "War",
      "Wealth",
      "Wisdom",
      "Music"
    ],
    "correct": 1
  },
  {
    "question": "Lord Krishna defeated which demon in some stories?",
    "choices": [
      "Bali",
      "Narakasura",
      "Hiranyaksha",
      "Kaliya"
    ],
    "correct": 1
  },
  {
    "question": "Bhai Dooj is on which Diwali day?",
    "choices": [
      "First",
      "Third",
      "Fourth",
      "Fifth"
    ],
    "correct": 3
  },
  {
    "question": "Dhanteras is on which Diwali day?",
    "choices": [
      "First",
      "Second",
      "Third",
      "Fourth"
    ],
    "correct": 0
  },
  {
    "question": "Diwali is also celebrated in?",
    "choices": [
      "Nepal",
      "Sri Lanka",
      "Singapore",
      "All these"
    ],
    "correct": 3
  },
  {
    "question": "Firecrackers symbolize?",
    "choices": [
      "Joy",
      "Driving away evil",
      "Welcoming Lakshmi",
      "All these"
    ],
    "correct": 3
  },
  {
    "question": "Govardhan Puja honors which god?",
    "choices": [
      "Krishna",
      "Shiva",
      "Ganesha",
      "Vishnu"
    ],
    "correct": 0
  },
  {
    "question": "Choti Diwali is also called?",
    "choices": [
      "Dhanteras",
      "Naraka Chaturdashi",
      "Bhai Dooj",
      "Govardhan"
    ],
    "correct": 1
  },
  {
    "question": "Jain Diwali commemorates?",
    "choices": [
      "Mahavira's nirvana",
      "Adinatha's birth",
      "First sermon",
      "Building of stupa"
    ],
    "correct": 0
  },
  {
    "question": "South Indian Diwali emphasizes which legend?",
    "choices": [
      "Rama-Sita",
      "Krishna-Narakasura",
      "Shiva-Sati",
      "Vishnu-Bali"
    ],
    "correct": 1
  },
  {
    "question": "Most diyas seen at one place: world record at?",
    "choices": [
      "Delhi",
      "Ayodhya",
      "Mumbai",
      "Varanasi"
    ],
    "correct": 1
  },
  {
    "question": "Diwali coincides with which Hindu month?",
    "choices": [
      "Kartik",
      "Ashwin",
      "Magh",
      "Phalgun"
    ],
    "correct": 0
  },
  {
    "question": "Lighting lamps signifies?",
    "choices": [
      "Sun setting",
      "Light over darkness",
      "End of harvest",
      "Welcome rain"
    ],
    "correct": 1
  },
  {
    "question": "Diwali eve is sometimes called?",
    "choices": [
      "Kali Chaudas",
      "Kali Puja",
      "Both",
      "Neither"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DiwaliQuizSettings): DiwaliQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DiwaliQuizState, action: DiwaliQuizAction): DiwaliQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DiwaliQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
