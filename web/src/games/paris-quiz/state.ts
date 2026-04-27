import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ParisQuizSettings { questions: "10" | "20"; }
export interface ParisQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ParisQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which river runs through Paris?",
    "choices": [
      "Rhône",
      "Seine",
      "Loire",
      "Garonne"
    ],
    "correct": 1
  },
  {
    "question": "Eiffel Tower was built for the?",
    "choices": [
      "1889 World Fair",
      "1900 Olympics",
      "Bastille Day",
      "Centennial of 1789"
    ],
    "correct": 0
  },
  {
    "question": "Le Louvre houses?",
    "choices": [
      "Mona Lisa",
      "Sistine Chapel",
      "Birth of Venus",
      "Last Supper"
    ],
    "correct": 0
  },
  {
    "question": "The Champs-Élysées ends at the?",
    "choices": [
      "Notre-Dame",
      "Arc de Triomphe",
      "Bastille",
      "Sacré-Cœur"
    ],
    "correct": 1
  },
  {
    "question": "Notre-Dame is on which island?",
    "choices": [
      "Île Saint-Louis",
      "Île de la Cité",
      "Île aux Cygnes",
      "Île Seguin"
    ],
    "correct": 1
  },
  {
    "question": "Montmartre is famous for?",
    "choices": [
      "the Bastille",
      "Sacré-Cœur",
      "Versailles",
      "Disneyland"
    ],
    "correct": 1
  },
  {
    "question": "The Paris metro opened in?",
    "choices": [
      "1889",
      "1900",
      "1925",
      "1950"
    ],
    "correct": 1
  },
  {
    "question": "Bastille Day is celebrated on?",
    "choices": [
      "July 4",
      "July 14",
      "June 14",
      "August 14"
    ],
    "correct": 1
  },
  {
    "question": "Versailles palace is associated with?",
    "choices": [
      "Charlemagne",
      "Louis XIV",
      "Napoleon",
      "Louis Philippe"
    ],
    "correct": 1
  },
  {
    "question": "Pompidou Centre is famous for its?",
    "choices": [
      "Gothic style",
      "exposed pipes/inside-out style",
      "Roman ruins",
      "Brutalism"
    ],
    "correct": 1
  },
  {
    "question": "The Catacombs hold remains of about?",
    "choices": [
      "100,000",
      "1 million",
      "6 million",
      "20 million"
    ],
    "correct": 2
  },
  {
    "question": "Place de la Concorde features an?",
    "choices": [
      "arc",
      "obelisk",
      "cathedral",
      "palace"
    ],
    "correct": 1
  },
  {
    "question": "The neighborhood Le Marais is known for?",
    "choices": [
      "modern skyscrapers",
      "historic Jewish quarter & boutiques",
      "ports",
      "forests"
    ],
    "correct": 1
  },
  {
    "question": "Paris is divided into how many arrondissements?",
    "choices": [
      "12",
      "16",
      "20",
      "24"
    ],
    "correct": 2
  },
  {
    "question": "Père Lachaise is a?",
    "choices": [
      "palace",
      "cemetery",
      "park",
      "museum"
    ],
    "correct": 1
  },
  {
    "question": "The Tuileries Garden is next to?",
    "choices": [
      "Notre-Dame",
      "Louvre",
      "Eiffel Tower",
      "Bastille"
    ],
    "correct": 1
  },
  {
    "question": "Sainte-Chapelle is famous for?",
    "choices": [
      "bells",
      "stained glass",
      "sculptures",
      "frescoes"
    ],
    "correct": 1
  },
  {
    "question": "The Latin Quarter is on which bank?",
    "choices": [
      "Right Bank",
      "Left Bank",
      "Both",
      "Île Saint-Louis"
    ],
    "correct": 1
  },
  {
    "question": "Disneyland Paris opened in?",
    "choices": [
      "1985",
      "1992",
      "2000",
      "2010"
    ],
    "correct": 1
  },
  {
    "question": "Paris's nickname is?",
    "choices": [
      "The Eternal City",
      "City of Light",
      "Big Apple",
      "City of Bridges"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ParisQuizSettings): ParisQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ParisQuizState, action: ParisQuizAction): ParisQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ParisQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
