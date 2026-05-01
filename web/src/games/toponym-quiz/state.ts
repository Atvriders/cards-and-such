import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ToponymQuizSettings { questions: "8" | "10" | "12"; }
export interface ToponymQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ToponymQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "CHAMPAGNE comes from?",
    "choices": [
      "Champagne, France",
      "Champaign, Illinois",
      "a German town",
      "a Spanish region"
    ],
    "correct": 0
  },
  {
    "question": "CHEDDAR cheese comes from?",
    "choices": [
      "Cheddar, England",
      "a Welsh village",
      "Cheddar, Vermont",
      "a French valley"
    ],
    "correct": 0
  },
  {
    "question": "HAMBURGER comes from?",
    "choices": [
      "Hamburg, Germany",
      "Hamberg, USA",
      "Hamburg, Sweden",
      "a Dutch town"
    ],
    "correct": 0
  },
  {
    "question": "FRANKFURTER comes from?",
    "choices": [
      "Frankfurt, Germany",
      "Frank County, USA",
      "a French town",
      "a Polish city"
    ],
    "correct": 0
  },
  {
    "question": "JEANS (denim) comes from?",
    "choices": [
      "Genoa, Italy (Genes)",
      "Geneva, Switzerland",
      "Jena, Germany",
      "a Spanish port"
    ],
    "correct": 0
  },
  {
    "question": "DENIM comes from?",
    "choices": [
      "de Nimes, France",
      "Denmark",
      "Denham, England",
      "a Belgian town"
    ],
    "correct": 0
  },
  {
    "question": "BIKINI is named after?",
    "choices": [
      "Bikini Atoll",
      "a Roman beach",
      "a Greek island",
      "a Brazilian beach"
    ],
    "correct": 0
  },
  {
    "question": "MARATHON is named after?",
    "choices": [
      "Marathon, Greece",
      "a Persian general",
      "a runner's hometown",
      "a temple"
    ],
    "correct": 0
  },
  {
    "question": "MAYONNAISE is named after?",
    "choices": [
      "Mahon, Menorca",
      "a French chef",
      "a Spanish saint",
      "a Belgian town"
    ],
    "correct": 0
  },
  {
    "question": "TURKEY (the bird) comes from?",
    "choices": [
      "confusion with Turkey country",
      "Turkey, Texas",
      "a Turkish trader",
      "a Persian word"
    ],
    "correct": 0
  },
  {
    "question": "CANTALOUPE is named after?",
    "choices": [
      "Cantalupo, Italy",
      "Canton, China",
      "a French village",
      "a Spanish region"
    ],
    "correct": 0
  },
  {
    "question": "BAYONET is named after?",
    "choices": [
      "Bayonne, France",
      "a Spanish town",
      "an English smith",
      "a Belgian fort"
    ],
    "correct": 0
  },
  {
    "question": "CALICO comes from?",
    "choices": [
      "Calicut, India",
      "Caligula",
      "California",
      "a Persian word"
    ],
    "correct": 0
  },
  {
    "question": "DAMASK comes from?",
    "choices": [
      "Damascus, Syria",
      "a Greek weaver",
      "an Egyptian town",
      "a Persian dye"
    ],
    "correct": 0
  },
  {
    "question": "MUSLIN comes from?",
    "choices": [
      "Mosul, Iraq",
      "Moscow",
      "a Greek island",
      "a Spanish city"
    ],
    "correct": 0
  },
  {
    "question": "SARDINE comes from?",
    "choices": [
      "Sardinia",
      "a Greek port",
      "Sardis, Lydia",
      "an Italian fisherman"
    ],
    "correct": 0
  },
  {
    "question": "MAGENTA color is named after?",
    "choices": [
      "Battle of Magenta, Italy",
      "a French chemist",
      "a Spanish flower",
      "a Roman emperor"
    ],
    "correct": 0
  },
  {
    "question": "CASHMERE comes from?",
    "choices": [
      "Kashmir region",
      "a Persian goat herd",
      "a Tibetan monastery",
      "a Mongol khan"
    ],
    "correct": 0
  },
  {
    "question": "TUXEDO is named after?",
    "choices": [
      "Tuxedo Park, New York",
      "a French tailor",
      "an English duke",
      "a Belgian town"
    ],
    "correct": 0
  },
  {
    "question": "BUNGALOW comes from?",
    "choices": [
      "Bengal",
      "a Burmese king",
      "a Hindi proverb",
      "a Sri Lankan port"
    ],
    "correct": 0
  },
  {
    "question": "LIMERICK (poem) is named after?",
    "choices": [
      "Limerick, Ireland",
      "an Irish saint",
      "a Welsh poet",
      "a tavern in London"
    ],
    "correct": 0
  },
  {
    "question": "BADMINTON is named after?",
    "choices": [
      "Badminton House, England",
      "a British colonel",
      "an Indian town",
      "a London club"
    ],
    "correct": 0
  },
  {
    "question": "RUGBY is named after?",
    "choices": [
      "Rugby School, England",
      "a Scottish village",
      "a Welsh field",
      "an Irish abbey"
    ],
    "correct": 0
  },
  {
    "question": "DERBY (race) is named after?",
    "choices": [
      "Earl of Derby's town",
      "a French village",
      "a horse breeder",
      "a London street"
    ],
    "correct": 0
  },
  {
    "question": "MARATHON BAR / DENVER OMELET... DENVER OMELET comes from?",
    "choices": [
      "Denver, Colorado",
      "a chef named Denver",
      "a railway dining car",
      "a 1900s cookbook"
    ],
    "correct": 0
  },
  {
    "question": "SPA (treatment) comes from?",
    "choices": [
      "Spa, Belgium",
      "a Roman bath name",
      "a Greek nymph",
      "a French queen"
    ],
    "correct": 0
  },
  {
    "question": "ATTIC (room) comes from?",
    "choices": [
      "Attica, Greece",
      "a Roman architect",
      "a Latin verb",
      "an Italian city"
    ],
    "correct": 0
  },
  {
    "question": "LACONIC comes from?",
    "choices": [
      "Laconia, Greece",
      "a Latin author",
      "a Greek philosopher",
      "a Spartan king"
    ],
    "correct": 0
  },
  {
    "question": "BOHEMIAN (artist sense) comes from?",
    "choices": [
      "Bohemia region",
      "a French painter",
      "a Spanish gypsy",
      "a German poet"
    ],
    "correct": 0
  },
  {
    "question": "TANGERINE comes from?",
    "choices": [
      "Tangier, Morocco",
      "a French farmer",
      "a Spanish saint",
      "an Italian fruit grower"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ToponymQuizSettings): ToponymQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ToponymQuizState, action: ToponymQuizAction): ToponymQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ToponymQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
