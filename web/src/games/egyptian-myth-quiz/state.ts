import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EgyptianMythQuizSettings { questions: "10" | "20" | "30"; }
export interface EgyptianMythQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EgyptianMythQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who is the Egyptian sun god?",
    "choices": [
      "Ra",
      "Osiris",
      "Anubis",
      "Set"
    ],
    "correct": 0
  },
  {
    "question": "Who is the jackal-headed god of mummification?",
    "choices": [
      "Horus",
      "Anubis",
      "Set",
      "Ptah"
    ],
    "correct": 1
  },
  {
    "question": "Who is the goddess of magic and motherhood?",
    "choices": [
      "Hathor",
      "Isis",
      "Bastet",
      "Nut"
    ],
    "correct": 1
  },
  {
    "question": "Who is the falcon-headed sky god?",
    "choices": [
      "Thoth",
      "Horus",
      "Khonsu",
      "Shu"
    ],
    "correct": 1
  },
  {
    "question": "Who is the god of the underworld?",
    "choices": [
      "Set",
      "Anubis",
      "Osiris",
      "Geb"
    ],
    "correct": 2
  },
  {
    "question": "Who killed Osiris?",
    "choices": [
      "Horus",
      "Set",
      "Apep",
      "Sobek"
    ],
    "correct": 1
  },
  {
    "question": "Which goddess is depicted as a cow or with cow horns?",
    "choices": [
      "Bastet",
      "Hathor",
      "Sekhmet",
      "Wadjet"
    ],
    "correct": 1
  },
  {
    "question": "Who is the cat goddess?",
    "choices": [
      "Bastet",
      "Hathor",
      "Mut",
      "Nut"
    ],
    "correct": 0
  },
  {
    "question": "Who is the ibis-headed god of writing?",
    "choices": [
      "Ptah",
      "Khnum",
      "Thoth",
      "Atum"
    ],
    "correct": 2
  },
  {
    "question": "What is the Egyptian symbol of life?",
    "choices": [
      "Ankh",
      "Djed",
      "Was",
      "Eye of Ra"
    ],
    "correct": 0
  },
  {
    "question": "Who is the goddess of the sky?",
    "choices": [
      "Nut",
      "Isis",
      "Maat",
      "Tefnut"
    ],
    "correct": 0
  },
  {
    "question": "Who is the god of the earth, lying below Nut?",
    "choices": [
      "Geb",
      "Shu",
      "Atum",
      "Ra"
    ],
    "correct": 0
  },
  {
    "question": "Who is the god of chaos and storms?",
    "choices": [
      "Apep",
      "Set",
      "Sobek",
      "Anubis"
    ],
    "correct": 1
  },
  {
    "question": "Who is the goddess of truth and order?",
    "choices": [
      "Maat",
      "Isis",
      "Hathor",
      "Bastet"
    ],
    "correct": 0
  },
  {
    "question": "Who is the crocodile god?",
    "choices": [
      "Sobek",
      "Set",
      "Khepri",
      "Apep"
    ],
    "correct": 0
  },
  {
    "question": "What did Anubis weigh against the heart in judgment?",
    "choices": [
      "A coin",
      "A feather",
      "A scarab",
      "A scale"
    ],
    "correct": 1
  },
  {
    "question": "What was the feather called?",
    "choices": [
      "Maat's feather",
      "Isis's feather",
      "Ra's feather",
      "Nut's feather"
    ],
    "correct": 0
  },
  {
    "question": "Who is the lion-headed warrior goddess?",
    "choices": [
      "Bastet",
      "Sekhmet",
      "Mut",
      "Tefnut"
    ],
    "correct": 1
  },
  {
    "question": "Who is the scarab god of the rising sun?",
    "choices": [
      "Khepri",
      "Atum",
      "Aten",
      "Khnum"
    ],
    "correct": 0
  },
  {
    "question": "Who is the wife of Osiris?",
    "choices": [
      "Hathor",
      "Isis",
      "Bastet",
      "Nephthys"
    ],
    "correct": 1
  },
  {
    "question": "Who is the son of Isis and Osiris?",
    "choices": [
      "Anubis",
      "Horus",
      "Set",
      "Thoth"
    ],
    "correct": 1
  },
  {
    "question": "What is the great serpent of chaos?",
    "choices": [
      "Apep",
      "Wadjet",
      "Ammit",
      "Khepri"
    ],
    "correct": 0
  },
  {
    "question": "What hybrid demon devours the wicked dead?",
    "choices": [
      "Apep",
      "Ammit",
      "Set",
      "Sobek"
    ],
    "correct": 1
  },
  {
    "question": "What does the Eye of Horus symbolize?",
    "choices": [
      "Death",
      "Protection",
      "War",
      "Famine"
    ],
    "correct": 1
  },
  {
    "question": "Who is the patron god of Memphis and craftsmen?",
    "choices": [
      "Ptah",
      "Thoth",
      "Anubis",
      "Sokar"
    ],
    "correct": 0
  },
  {
    "question": "Who is the ram-headed creator at Elephantine?",
    "choices": [
      "Khnum",
      "Khonsu",
      "Min",
      "Banebdjedet"
    ],
    "correct": 0
  },
  {
    "question": "Pharaohs were considered the living form of which god?",
    "choices": [
      "Ra",
      "Horus",
      "Anubis",
      "Set"
    ],
    "correct": 1
  },
  {
    "question": "Who is the boat that carries Ra across the sky?",
    "choices": [
      "Solar Bark",
      "Atum's Skiff",
      "Wadjet's Boat",
      "Ka-boat"
    ],
    "correct": 0
  },
  {
    "question": "What word describes Egyptian writing in pictures?",
    "choices": [
      "Cuneiform",
      "Hieroglyphs",
      "Demotic",
      "Coptic"
    ],
    "correct": 1
  },
  {
    "question": "Who was the sole god under Akhenaten's reform?",
    "choices": [
      "Aten",
      "Amun",
      "Ra",
      "Ptah"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EgyptianMythQuizSettings): EgyptianMythQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EgyptianMythQuizState, action: EgyptianMythQuizAction): EgyptianMythQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EgyptianMythQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
