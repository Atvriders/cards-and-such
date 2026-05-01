import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RomeQuizSettings { questions: "10" | "20"; }
export interface RomeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RomeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Colosseum was completed in roughly?",
    "choices": [
      "AD 80",
      "AD 200",
      "AD 500",
      "AD 1000"
    ],
    "correct": 0
  },
  {
    "question": "Vatican City is located within?",
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
      "concrete dome",
      "spire",
      "stained glass"
    ],
    "correct": 1
  },
  {
    "question": "The Spanish Steps lead up to which church?",
    "choices": [
      "St Peter's",
      "Trinità dei Monti",
      "Santa Maria Maggiore",
      "St John Lateran"
    ],
    "correct": 1
  },
  {
    "question": "Throwing a coin in the Trevi Fountain ensures you?",
    "choices": [
      "win the lottery",
      "return to Rome",
      "find love instantly",
      "live to 100"
    ],
    "correct": 1
  },
  {
    "question": "Rome was traditionally founded in?",
    "choices": [
      "753 BC",
      "509 BC",
      "27 BC",
      "AD 14"
    ],
    "correct": 0
  },
  {
    "question": "The Sistine Chapel ceiling was painted by?",
    "choices": [
      "Raphael",
      "Michelangelo",
      "Donatello",
      "Bernini"
    ],
    "correct": 1
  },
  {
    "question": "The Tiber is Rome's main?",
    "choices": [
      "mountain",
      "river",
      "lake",
      "stadium"
    ],
    "correct": 1
  },
  {
    "question": "The legendary founders of Rome were?",
    "choices": [
      "Aeneas & Anchises",
      "Romulus & Remus",
      "Caesar & Pompey",
      "Castor & Pollux"
    ],
    "correct": 1
  },
  {
    "question": "Julius Caesar was assassinated in?",
    "choices": [
      "27 BC",
      "44 BC",
      "AD 14",
      "AD 64"
    ],
    "correct": 1
  },
  {
    "question": "The first Roman emperor was?",
    "choices": [
      "Caesar",
      "Augustus",
      "Nero",
      "Trajan"
    ],
    "correct": 1
  },
  {
    "question": "St Peter's Basilica is in?",
    "choices": [
      "Trastevere",
      "Vatican City",
      "Esquiline",
      "Aventine"
    ],
    "correct": 1
  },
  {
    "question": "The famous Roman pasta carbonara contains?",
    "choices": [
      "cream",
      "egg, guanciale & pecorino",
      "tomato & basil",
      "pesto"
    ],
    "correct": 1
  },
  {
    "question": "Cacio e pepe is made with?",
    "choices": [
      "cheese & pepper",
      "tomato & garlic",
      "mushroom cream",
      "anchovy & olive"
    ],
    "correct": 0
  },
  {
    "question": "Saltimbocca alla Romana features?",
    "choices": [
      "tripe",
      "veal with prosciutto & sage",
      "octopus",
      "wild boar"
    ],
    "correct": 1
  },
  {
    "question": "Rome's Catacombs were used by early?",
    "choices": [
      "traders",
      "Christians for burials",
      "soldiers as barracks",
      "philosophers"
    ],
    "correct": 1
  },
  {
    "question": "The Aventine Keyhole frames a view of?",
    "choices": [
      "the Colosseum",
      "St Peter's dome",
      "the Pantheon",
      "Trevi Fountain"
    ],
    "correct": 1
  },
  {
    "question": "Trastevere is a neighborhood famous for?",
    "choices": [
      "high-rise offices",
      "narrow lanes & nightlife",
      "industrial ports",
      "modern museums"
    ],
    "correct": 1
  },
  {
    "question": "Castel Sant'Angelo was originally built as?",
    "choices": [
      "a fortress",
      "Hadrian's mausoleum",
      "a basilica",
      "a palace garden"
    ],
    "correct": 1
  },
  {
    "question": "Rome's iconic deep-fried rice ball is the?",
    "choices": [
      "arancini",
      "supplì",
      "polpetta",
      "crocchetta"
    ],
    "correct": 1
  },
  {
    "question": "The Mouth of Truth allegedly bites off the hands of?",
    "choices": [
      "thieves",
      "liars",
      "soldiers",
      "merchants"
    ],
    "correct": 1
  },
  {
    "question": "Piazza Navona is built on top of an ancient?",
    "choices": [
      "forum",
      "stadium of Domitian",
      "amphitheater",
      "circus of Maxentius"
    ],
    "correct": 1
  },
  {
    "question": "The Vittoriano monument honors King?",
    "choices": [
      "Vittorio Emanuele II",
      "Umberto I",
      "Vittorio Emanuele III",
      "Umberto II"
    ],
    "correct": 0
  },
  {
    "question": "Bernini's famous baldachin sits inside?",
    "choices": [
      "Pantheon",
      "St Peter's",
      "Santa Maria Maggiore",
      "Sistine Chapel"
    ],
    "correct": 1
  },
  {
    "question": "The Western Roman Empire fell in?",
    "choices": [
      "AD 410",
      "AD 476",
      "AD 530",
      "AD 800"
    ],
    "correct": 1
  },
  {
    "question": "Vatican Museums climax with?",
    "choices": [
      "Borgia rooms",
      "Sistine Chapel",
      "Pinacoteca",
      "Map Gallery"
    ],
    "correct": 1
  },
  {
    "question": "Rome's nickname is?",
    "choices": [
      "City of Light",
      "Eternal City",
      "Big Pizza",
      "Golden City"
    ],
    "correct": 1
  },
  {
    "question": "Gladiator combats took place primarily at the?",
    "choices": [
      "Pantheon",
      "Colosseum",
      "Forum",
      "Circus Maximus"
    ],
    "correct": 1
  },
  {
    "question": "Chariot races were held at the?",
    "choices": [
      "Colosseum",
      "Circus Maximus",
      "Stadium of Domitian",
      "Baths of Caracalla"
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
