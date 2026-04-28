import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CaveExploreQuizSettings { questions: "10" | "20" | "30"; }
export interface CaveExploreQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CaveExploreQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Longest known cave system on Earth?",
    "choices": [
      "Sistema Ox Bel Ha",
      "Mammoth Cave",
      "Lechuguilla",
      "Sistema Sac Actun"
    ],
    "correct": 1
  },
  {
    "question": "Mammoth Cave is in?",
    "choices": [
      "Tennessee",
      "Kentucky",
      "Virginia",
      "WV"
    ],
    "correct": 1
  },
  {
    "question": "Deepest cave on Earth?",
    "choices": [
      "Veryovkina",
      "Krubera",
      "Sistema Huautla",
      "Lamprechtsofen"
    ],
    "correct": 0
  },
  {
    "question": "Veryovkina is in?",
    "choices": [
      "USA",
      "Slovenia",
      "Abkhazia/Georgia",
      "Italy"
    ],
    "correct": 2
  },
  {
    "question": "Stalactites grow from?",
    "choices": [
      "Floor",
      "Ceiling",
      "Walls",
      "All"
    ],
    "correct": 1
  },
  {
    "question": "Stalagmites grow from?",
    "choices": [
      "Floor",
      "Ceiling",
      "Walls",
      "All"
    ],
    "correct": 0
  },
  {
    "question": "Lascaux cave paintings are in?",
    "choices": [
      "France",
      "Spain",
      "Italy",
      "Greece"
    ],
    "correct": 0
  },
  {
    "question": "Roughly age of Lascaux paintings?",
    "choices": [
      "3,000",
      "17,000",
      "100,000",
      "1 million"
    ],
    "correct": 1
  },
  {
    "question": "Altamira cave is in?",
    "choices": [
      "Spain",
      "France",
      "Portugal",
      "Italy"
    ],
    "correct": 0
  },
  {
    "question": "Cave-rescue Tham Luang was in?",
    "choices": [
      "Vietnam",
      "Thailand",
      "Laos",
      "Cambodia"
    ],
    "correct": 1
  },
  {
    "question": "Year of Tham Luang rescue?",
    "choices": [
      "2016",
      "2018",
      "2020",
      "2022"
    ],
    "correct": 1
  },
  {
    "question": "Carlsbad Caverns are in?",
    "choices": [
      "AZ",
      "NM",
      "CO",
      "UT"
    ],
    "correct": 1
  },
  {
    "question": "Glowworms in caves are found in?",
    "choices": [
      "Iceland",
      "New Zealand/AUS",
      "Russia",
      "Brazil"
    ],
    "correct": 1
  },
  {
    "question": "Karst means?",
    "choices": [
      "Limestone landscape",
      "Granite",
      "Marble",
      "Sandstone"
    ],
    "correct": 0
  },
  {
    "question": "Postojna cave is in?",
    "choices": [
      "Slovenia",
      "Austria",
      "Hungary",
      "Czech"
    ],
    "correct": 0
  },
  {
    "question": "Speleology is the study of?",
    "choices": [
      "Mountains",
      "Caves",
      "Glaciers",
      "Deserts"
    ],
    "correct": 1
  },
  {
    "question": "Floyd Collins was famously trapped (1925) in?",
    "choices": [
      "Sand Cave (KY)",
      "Mammoth (KY)",
      "Howe (NY)",
      "Carlsbad"
    ],
    "correct": 0
  },
  {
    "question": "Deep cave dive record holder country?",
    "choices": [
      "USA",
      "Czech Republic",
      "Mexico",
      "Australia"
    ],
    "correct": 1
  },
  {
    "question": "Yucatan caves are called?",
    "choices": [
      "Cenotes",
      "Sumideros",
      "Karst",
      "Pozos"
    ],
    "correct": 0
  },
  {
    "question": "Caves form most often in?",
    "choices": [
      "Limestone",
      "Granite",
      "Basalt",
      "Sandstone"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CaveExploreQuizSettings): CaveExploreQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CaveExploreQuizState, action: CaveExploreQuizAction): CaveExploreQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CaveExploreQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
