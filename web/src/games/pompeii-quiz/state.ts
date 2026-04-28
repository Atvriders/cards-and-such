import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PompeiiQuizSettings { questions: "10" | "20" | "30"; }
export interface PompeiiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PompeiiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "When did Vesuvius erupt and bury Pompeii?",
    "choices": [
      "49 BC",
      "79 AD",
      "100 AD",
      "200 AD"
    ],
    "correct": 1
  },
  {
    "question": "Pompeii is in which modern country?",
    "choices": [
      "Italy",
      "Greece",
      "Turkey",
      "Spain"
    ],
    "correct": 0
  },
  {
    "question": "Volcano that erupted?",
    "choices": [
      "Etna",
      "Stromboli",
      "Vesuvius",
      "Vulcano"
    ],
    "correct": 2
  },
  {
    "question": "Who described the eruption in letters?",
    "choices": [
      "Pliny the Elder",
      "Pliny the Younger",
      "Tacitus",
      "Suetonius"
    ],
    "correct": 1
  },
  {
    "question": "Who died in the eruption (famous Roman)?",
    "choices": [
      "Pliny the Younger",
      "Pliny the Elder",
      "Cicero",
      "Caesar"
    ],
    "correct": 1
  },
  {
    "question": "Other major buried city?",
    "choices": [
      "Naples",
      "Herculaneum",
      "Capua",
      "Salerno"
    ],
    "correct": 1
  },
  {
    "question": "Pompeii was rediscovered in which century?",
    "choices": [
      "16th",
      "17th",
      "18th",
      "19th"
    ],
    "correct": 2
  },
  {
    "question": "Famous casts of victims were made by injecting?",
    "choices": [
      "Cement",
      "Plaster",
      "Resin",
      "Wax"
    ],
    "correct": 1
  },
  {
    "question": "City buried by?",
    "choices": [
      "Lava",
      "Ash and pyroclastic flows",
      "Mudslide",
      "Earthquake"
    ],
    "correct": 1
  },
  {
    "question": "Modern province?",
    "choices": [
      "Naples",
      "Rome",
      "Florence",
      "Venice"
    ],
    "correct": 0
  },
  {
    "question": "Which Vesuvius eruption type?",
    "choices": [
      "Hawaiian",
      "Strombolian",
      "Plinian",
      "Vulcanian"
    ],
    "correct": 2
  },
  {
    "question": "Approximate population of Pompeii?",
    "choices": [
      "2,000",
      "11,000",
      "50,000",
      "100,000"
    ],
    "correct": 1
  },
  {
    "question": "Pliny the Elder's profession?",
    "choices": [
      "Senator",
      "Naturalist/Admiral",
      "Poet",
      "Historian"
    ],
    "correct": 1
  },
  {
    "question": "Pompeii is famous for preserved?",
    "choices": [
      "Pyramids",
      "Frescoes & buildings",
      "Cathedrals",
      "Roads only"
    ],
    "correct": 1
  },
  {
    "question": "Number of eruptions of Vesuvius since 79 AD?",
    "choices": [
      "A few",
      "Several dozen",
      "Hundreds",
      "None"
    ],
    "correct": 1
  },
  {
    "question": "City of Stabiae's relation?",
    "choices": [
      "Sister Roman city also buried",
      "Modern Naples suburb",
      "Roman colony in Africa",
      "Greek colony"
    ],
    "correct": 0
  },
  {
    "question": "Bay of Naples coast feature?",
    "choices": [
      "Cliff",
      "Volcanic",
      "Marshy",
      "Reef"
    ],
    "correct": 1
  },
  {
    "question": "Vesuvius last erupted in?",
    "choices": [
      "1906",
      "1944",
      "1961",
      "2000"
    ],
    "correct": 1
  },
  {
    "question": "Excavations are ongoing today?",
    "choices": [
      "No",
      "Yes",
      "Stopped in 1900",
      "Stopped in 2000"
    ],
    "correct": 1
  },
  {
    "question": "Pompeii is now a UNESCO?",
    "choices": [
      "World Heritage Site",
      "Geopark",
      "Biosphere",
      "Ramsar site"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PompeiiQuizSettings): PompeiiQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PompeiiQuizState, action: PompeiiQuizAction): PompeiiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PompeiiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
