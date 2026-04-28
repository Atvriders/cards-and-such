import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PrehistoricQuizSettings { questions: "10" | "20" | "30"; }
export interface PrehistoricQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PrehistoricQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Stone Age is divided into Paleolithic, Mesolithic, and?",
    "choices": [
      "Iron",
      "Neolithic",
      "Bronze",
      "Copper"
    ],
    "correct": 1
  },
  {
    "question": "Earliest stone tools date to about?",
    "choices": [
      "10,000 years ago",
      "3.3 million years ago",
      "100,000 years ago",
      "1 million years ago"
    ],
    "correct": 1
  },
  {
    "question": "Homo sapiens emerged about?",
    "choices": [
      "10,000 years ago",
      "300,000 years ago",
      "2 million years ago",
      "50,000 years ago"
    ],
    "correct": 1
  },
  {
    "question": "Neanderthals went extinct about?",
    "choices": [
      "10,000 BCE",
      "40,000 years ago",
      "1 million years ago",
      "500,000 years ago"
    ],
    "correct": 1
  },
  {
    "question": "Lascaux Cave is famous for?",
    "choices": [
      "Cave paintings",
      "Mummies",
      "Stones",
      "Burials"
    ],
    "correct": 0
  },
  {
    "question": "Agriculture developed roughly?",
    "choices": [
      "50,000 years ago",
      "10,000 years ago",
      "2,000 years ago",
      "100,000 years ago"
    ],
    "correct": 1
  },
  {
    "question": "Stonehenge is from approximately?",
    "choices": [
      "3000-2000 BCE",
      "AD 1000",
      "10,000 BCE",
      "500 BCE"
    ],
    "correct": 0
  },
  {
    "question": "Bronze Age followed?",
    "choices": [
      "Iron Age",
      "Neolithic",
      "Mesolithic only",
      "Modern Age"
    ],
    "correct": 1
  },
  {
    "question": "First domesticated animal?",
    "choices": [
      "Cow",
      "Dog",
      "Sheep",
      "Cat"
    ],
    "correct": 1
  },
  {
    "question": "Otzi the Iceman lived around?",
    "choices": [
      "3,300 BCE",
      "10,000 BCE",
      "500 BCE",
      "1500 CE"
    ],
    "correct": 0
  },
  {
    "question": "Catalhoyuk is a famous?",
    "choices": [
      "Tomb",
      "Neolithic settlement in Turkey",
      "Pharaoh",
      "Cave"
    ],
    "correct": 1
  },
  {
    "question": "Venus figurines are typically?",
    "choices": [
      "Modern art",
      "Paleolithic small statues",
      "Bronze Age coins",
      "Egyptian"
    ],
    "correct": 1
  },
  {
    "question": "Iron Age generally followed?",
    "choices": [
      "Stone Age directly",
      "Bronze Age",
      "Industrial Age",
      "Mesolithic only"
    ],
    "correct": 1
  },
  {
    "question": "First known wheeled vehicles date to?",
    "choices": [
      "1000 CE",
      "Around 3500 BCE",
      "10,000 BCE",
      "500 CE"
    ],
    "correct": 1
  },
  {
    "question": "Hominid bipedalism evolved approximately?",
    "choices": [
      "10,000 years ago",
      "4-6 million years ago",
      "100,000 years ago",
      "1 million years ago"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PrehistoricQuizSettings): PrehistoricQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PrehistoricQuizState, action: PrehistoricQuizAction): PrehistoricQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PrehistoricQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
