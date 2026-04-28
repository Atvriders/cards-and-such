import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VikingQuizSettings { questions: "10" | "20" | "30"; }
export interface VikingQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VikingQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Vikings originated from?",
    "choices": [
      "Britain",
      "Scandinavia",
      "Iberia",
      "Russia"
    ],
    "correct": 1
  },
  {
    "question": "The Viking Age is roughly?",
    "choices": [
      "200-500 CE",
      "793-1066 CE",
      "1100-1300 CE",
      "1300-1500 CE"
    ],
    "correct": 1
  },
  {
    "question": "First major raid traditionally noted at?",
    "choices": [
      "York",
      "Lindisfarne (793)",
      "Paris",
      "Dublin"
    ],
    "correct": 1
  },
  {
    "question": "Viking ship known for shallow draft?",
    "choices": [
      "Trireme",
      "Longship",
      "Galleon",
      "Cog"
    ],
    "correct": 1
  },
  {
    "question": "Erik the Red colonized?",
    "choices": [
      "Iceland",
      "Greenland",
      "Newfoundland",
      "Britain"
    ],
    "correct": 1
  },
  {
    "question": "Leif Erikson is associated with reaching?",
    "choices": [
      "Greenland",
      "Vinland (North America)",
      "Iberia",
      "Sicily"
    ],
    "correct": 1
  },
  {
    "question": "Norse mythology's chief god?",
    "choices": [
      "Thor",
      "Odin",
      "Loki",
      "Freyr"
    ],
    "correct": 1
  },
  {
    "question": "Asgard is the home of?",
    "choices": [
      "Giants",
      "Aesir gods",
      "Humans",
      "Dwarfs"
    ],
    "correct": 1
  },
  {
    "question": "Viking parliament/assembly?",
    "choices": [
      "Senate",
      "Thing (Þing)",
      "Witan",
      "Cortes"
    ],
    "correct": 1
  },
  {
    "question": "Battle of Hastings (1066) involved?",
    "choices": [
      "Vikings only",
      "Normans (Viking-descended) vs Anglo-Saxons",
      "Romans",
      "Celts"
    ],
    "correct": 1
  },
  {
    "question": "Runes were?",
    "choices": [
      "Coins",
      "Norse alphabet characters",
      "Songs",
      "Cooking pots"
    ],
    "correct": 1
  },
  {
    "question": "Danelaw was?",
    "choices": [
      "Viking law in northern/eastern England",
      "A king",
      "A weapon",
      "A god"
    ],
    "correct": 0
  },
  {
    "question": "Vikings traded along which Russian rivers?",
    "choices": [
      "Volga and Dnieper",
      "Thames",
      "Rhine",
      "Po"
    ],
    "correct": 0
  },
  {
    "question": "Viking warriors who fought in trance state?",
    "choices": [
      "Berserkers",
      "Hoplites",
      "Janissaries",
      "Hussars"
    ],
    "correct": 0
  },
  {
    "question": "Sagas were?",
    "choices": [
      "Epic prose narratives",
      "Cooking books",
      "Maps",
      "Coins"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VikingQuizSettings): VikingQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VikingQuizState, action: VikingQuizAction): VikingQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VikingQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
