import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AztecQuizSettings { questions: "10" | "20" | "30"; }
export interface AztecQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AztecQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Aztec capital was?",
    "choices": [
      "Cusco",
      "Tenochtitlan",
      "Palenque",
      "Teotihuacan"
    ],
    "correct": 1
  },
  {
    "question": "Tenochtitlan stood where modern city is now?",
    "choices": [
      "Lima",
      "Mexico City",
      "Bogota",
      "Guatemala City"
    ],
    "correct": 1
  },
  {
    "question": "Aztec emperor at Spanish arrival?",
    "choices": [
      "Moctezuma I",
      "Moctezuma II",
      "Cuauhtemoc",
      "Itzcoatl"
    ],
    "correct": 1
  },
  {
    "question": "Spanish conqueror of the Aztecs?",
    "choices": [
      "Pizarro",
      "Cortes",
      "Balboa",
      "Coronado"
    ],
    "correct": 1
  },
  {
    "question": "Aztec primary deity of war and sun?",
    "choices": [
      "Quetzalcoatl",
      "Huitzilopochtli",
      "Tlaloc",
      "Tezcatlipoca"
    ],
    "correct": 1
  },
  {
    "question": "Aztec language?",
    "choices": [
      "Quechua",
      "Nahuatl",
      "Mayan",
      "Zapotec"
    ],
    "correct": 1
  },
  {
    "question": "Tenochtitlan fell in?",
    "choices": [
      "1492",
      "1521",
      "1607",
      "1700"
    ],
    "correct": 1
  },
  {
    "question": "Aztec floating gardens called?",
    "choices": [
      "Chinampas",
      "Terraces",
      "Quipus",
      "Pyramids"
    ],
    "correct": 0
  },
  {
    "question": "Aztec calendar stone shows?",
    "choices": [
      "Five suns/cosmic ages",
      "Stars only",
      "Months only",
      "Family trees"
    ],
    "correct": 0
  },
  {
    "question": "Triple Alliance comprised Tenochtitlan, Texcoco, and?",
    "choices": [
      "Cholula",
      "Tlacopan",
      "Tlaxcala",
      "Cuernavaca"
    ],
    "correct": 1
  },
  {
    "question": "Tlaloc was god of?",
    "choices": [
      "Sun",
      "Rain",
      "War",
      "Death"
    ],
    "correct": 1
  },
  {
    "question": "Aztec markets were known as?",
    "choices": [
      "Souks",
      "Tianguis",
      "Bazaars",
      "Forums"
    ],
    "correct": 1
  },
  {
    "question": "Aztec emperor title?",
    "choices": [
      "Sapa",
      "Tlatoani",
      "Khan",
      "Caesar"
    ],
    "correct": 1
  },
  {
    "question": "Aztec staple grain?",
    "choices": [
      "Wheat",
      "Maize",
      "Rice",
      "Quinoa"
    ],
    "correct": 1
  },
  {
    "question": "Cacao was used for?",
    "choices": [
      "Currency and elite drink",
      "Bread",
      "Soup",
      "Medicine only"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AztecQuizSettings): AztecQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AztecQuizState, action: AztecQuizAction): AztecQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AztecQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
