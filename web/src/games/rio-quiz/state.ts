import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RioQuizSettings { questions: "10" | "20"; }
export interface RioQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RioQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Christ the Redeemer statue overlooks Rio from?",
    "choices": [
      "Sugarloaf",
      "Corcovado",
      "Pão de Açúcar",
      "Tijuca"
    ],
    "correct": 1
  },
  {
    "question": "Rio's famous beach south of Copacabana is?",
    "choices": [
      "Botafogo",
      "Ipanema",
      "Lebão",
      "Macapá"
    ],
    "correct": 1
  },
  {
    "question": "Carnival in Rio is held in?",
    "choices": [
      "January",
      "February/March",
      "April",
      "June"
    ],
    "correct": 1
  },
  {
    "question": "Sambodromo hosts?",
    "choices": [
      "football",
      "samba parades",
      "rodeo",
      "music festivals only"
    ],
    "correct": 1
  },
  {
    "question": "Rio is in which Brazilian state?",
    "choices": [
      "São Paulo",
      "Rio de Janeiro",
      "Minas Gerais",
      "Bahia"
    ],
    "correct": 1
  },
  {
    "question": "Sugarloaf Mountain is reached by?",
    "choices": [
      "funicular",
      "cable car",
      "trail only",
      "escalator"
    ],
    "correct": 1
  },
  {
    "question": "Rio's 2016 event was the?",
    "choices": [
      "World Cup",
      "Olympics",
      "Pan-Am Games",
      "Expo"
    ],
    "correct": 1
  },
  {
    "question": "Lagoa Rodrigo de Freitas is a?",
    "choices": [
      "mountain",
      "lagoon",
      "beach",
      "forest"
    ],
    "correct": 1
  },
  {
    "question": "Maracanã is a famous?",
    "choices": [
      "beach",
      "stadium",
      "mountain",
      "palace"
    ],
    "correct": 1
  },
  {
    "question": "Tijuca is the world's largest urban?",
    "choices": [
      "zoo",
      "forest",
      "mall",
      "square"
    ],
    "correct": 1
  },
  {
    "question": "Pão de Açúcar means?",
    "choices": [
      "sweet rock",
      "sugar loaf",
      "big stone",
      "palace"
    ],
    "correct": 1
  },
  {
    "question": "Rio was the capital of Brazil until?",
    "choices": [
      "1822",
      "1889",
      "1960",
      "1990"
    ],
    "correct": 2
  },
  {
    "question": "Cariocas are residents of?",
    "choices": [
      "Rio",
      "São Paulo",
      "Brasília",
      "Bahia"
    ],
    "correct": 0
  },
  {
    "question": "Rio's main language is?",
    "choices": [
      "Spanish",
      "Portuguese",
      "English",
      "French"
    ],
    "correct": 1
  },
  {
    "question": "Copacabana fortress was built in?",
    "choices": [
      "18th c.",
      "early 20th c.",
      "late 19th c.",
      "21st c."
    ],
    "correct": 1
  },
  {
    "question": "Bossa nova originated in Rio in the?",
    "choices": [
      "1940s",
      "1950s",
      "1960s",
      "1970s"
    ],
    "correct": 1
  },
  {
    "question": "Rio's Olympic Stadium is named?",
    "choices": [
      "Engenhão",
      "Maracanã",
      "Sambódromo",
      "Canecão"
    ],
    "correct": 0
  },
  {
    "question": "Lapa is famous for?",
    "choices": [
      "beach",
      "aqueduct & nightlife",
      "ports",
      "castles"
    ],
    "correct": 1
  },
  {
    "question": "Santa Teresa is known for?",
    "choices": [
      "modern shops",
      "bohemian neighborhood",
      "beach",
      "markets"
    ],
    "correct": 1
  },
  {
    "question": "Rio is known as Cidade?",
    "choices": [
      "Eterna",
      "Maravilhosa",
      "Grande",
      "Bela"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RioQuizSettings): RioQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RioQuizState, action: RioQuizAction): RioQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RioQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
