import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PluralsQuizSettings { questions: "8" | "10" | "12"; }
export interface PluralsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PluralsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The plural of 'child' is:",
    "choices": [
      "children",
      "childs",
      "childes",
      "childies"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'mouse' (animal) is:",
    "choices": [
      "mice",
      "mouses",
      "meese",
      "mousen"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'foot' is:",
    "choices": [
      "feet",
      "foots",
      "feets",
      "footes"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'tooth' is:",
    "choices": [
      "teeth",
      "tooths",
      "teethes",
      "toothies"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'man' is:",
    "choices": [
      "men",
      "mans",
      "mens",
      "manes"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'woman' is:",
    "choices": [
      "women",
      "womans",
      "womens",
      "womanes"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'goose' is:",
    "choices": [
      "geese",
      "gooses",
      "geeses",
      "goosen"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'ox' is:",
    "choices": [
      "oxen",
      "oxes",
      "oxs",
      "oxies"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'sheep' is:",
    "choices": [
      "sheep",
      "sheeps",
      "shepes",
      "sheepies"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'deer' is:",
    "choices": [
      "deer",
      "deers",
      "deeren",
      "deeries"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'fish' (as a group of one species) is:",
    "choices": [
      "fish",
      "fishes",
      "fishen",
      "fishies"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'cactus' (Latin form) is:",
    "choices": [
      "cacti",
      "cactuses only",
      "cactes",
      "cactim"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'crisis' is:",
    "choices": [
      "crises",
      "crisises",
      "crisen",
      "crisi"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'analysis' is:",
    "choices": [
      "analyses",
      "analysises",
      "analysi",
      "analyseen"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'phenomenon' is:",
    "choices": [
      "phenomena",
      "phenomenons",
      "phenomenes",
      "phenomenae"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'criterion' is:",
    "choices": [
      "criteria",
      "criterions",
      "criteries",
      "criteriae"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'datum' is:",
    "choices": [
      "data",
      "datums",
      "daten",
      "datae"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'leaf' is:",
    "choices": [
      "leaves",
      "leafs",
      "leafes",
      "leaven"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'knife' is:",
    "choices": [
      "knives",
      "knifes",
      "knifies",
      "kniven"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'wolf' is:",
    "choices": [
      "wolves",
      "wolfs",
      "wolfes",
      "wolven"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'baby' is:",
    "choices": [
      "babies",
      "babys",
      "babyes",
      "baby"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'bus' is:",
    "choices": [
      "buses",
      "bus",
      "busies",
      "bussen"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'box' is:",
    "choices": [
      "boxes",
      "boxs",
      "boxen (modern)",
      "boxies"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'church' is:",
    "choices": [
      "churches",
      "churchs",
      "churchies",
      "churchen"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'potato' is:",
    "choices": [
      "potatoes",
      "potatos",
      "potatoses",
      "potate"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'piano' is:",
    "choices": [
      "pianos",
      "pianoes",
      "pianies",
      "pianon"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'series' is:",
    "choices": [
      "series",
      "serieses",
      "seri",
      "seria"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'species' is:",
    "choices": [
      "species",
      "specieses",
      "speci",
      "specien"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'index' (math/Latin) is commonly:",
    "choices": [
      "indices",
      "indexen",
      "indexies",
      "indeces"
    ],
    "correct": 0
  },
  {
    "question": "The plural of 'alumnus' (male) is:",
    "choices": [
      "alumni",
      "alumnuses",
      "alumnae",
      "alumnen"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PluralsQuizSettings): PluralsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PluralsQuizState, action: PluralsQuizAction): PluralsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PluralsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
