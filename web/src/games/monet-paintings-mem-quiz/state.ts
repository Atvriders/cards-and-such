import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MonetPaintingsMemQuizSettings { questions: "10"; }
export interface MonetPaintingsMemQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MonetPaintingsMemQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Claude Monet was a leader of which art movement?",
    "choices": [
      "Impressionism",
      "Cubism",
      "Surrealism",
      "Pop art"
    ],
    "correct": 0
  },
  {
    "question": "Monet's most famous water-themed paintings are?",
    "choices": [
      "Water Lilies (Nymphéas)",
      "Starry Night",
      "Persistence of Memory",
      "American Gothic"
    ],
    "correct": 0
  },
  {
    "question": "Impression, Sunrise gave its name to?",
    "choices": [
      "The Impressionist movement",
      "Cubism",
      "Bauhaus",
      "Romanticism"
    ],
    "correct": 0
  },
  {
    "question": "Monet was born in?",
    "choices": [
      "1840 (Paris, France)",
      "1700",
      "1920",
      "1880"
    ],
    "correct": 0
  },
  {
    "question": "Monet's garden was at?",
    "choices": [
      "Giverny",
      "Versailles",
      "Provence",
      "Côte d'Azur"
    ],
    "correct": 0
  },
  {
    "question": "Memory game match rule is?",
    "choices": [
      "Two tiles showing the same painting",
      "Same color",
      "Same number",
      "Random pair"
    ],
    "correct": 0
  },
  {
    "question": "Monet famously painted what subject in many versions?",
    "choices": [
      "Rouen Cathedral / Haystacks at different times",
      "Lions",
      "Skyscrapers",
      "Submarines"
    ],
    "correct": 0
  },
  {
    "question": "Players win by?",
    "choices": [
      "Collecting the most matched pairs",
      "Highest die roll",
      "Bidding most",
      "Reaching center"
    ],
    "correct": 0
  },
  {
    "question": "Recommended ages?",
    "choices": [
      "6 and up",
      "21 and up",
      "Adults only",
      "Under 3"
    ],
    "correct": 0
  },
  {
    "question": "Art-memory decks are praised for?",
    "choices": [
      "Teaching art history through repeat exposure",
      "Auction skill",
      "Math drilling",
      "Coding"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MonetPaintingsMemQuizSettings): MonetPaintingsMemQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MonetPaintingsMemQuizState, action: MonetPaintingsMemQuizAction): MonetPaintingsMemQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MonetPaintingsMemQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
