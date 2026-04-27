import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LondonQuizSettings { questions: "10" | "20"; }
export interface LondonQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LondonQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Thames flows through?",
    "choices": [
      "Manchester",
      "London",
      "Liverpool",
      "Edinburgh"
    ],
    "correct": 1
  },
  {
    "question": "Big Ben is the nickname for?",
    "choices": [
      "the bell",
      "the clock face",
      "the tower",
      "the Parliament"
    ],
    "correct": 0
  },
  {
    "question": "The London Underground opened in?",
    "choices": [
      "1863",
      "1880",
      "1900",
      "1925"
    ],
    "correct": 0
  },
  {
    "question": "Trafalgar Square commemorates a battle of?",
    "choices": [
      "1799",
      "1805",
      "1815",
      "1830"
    ],
    "correct": 1
  },
  {
    "question": "The Tower of London is famous for the?",
    "choices": [
      "queen's bedroom",
      "Crown Jewels",
      "sword fights",
      "Big Ben"
    ],
    "correct": 1
  },
  {
    "question": "Buckingham Palace is the home of the?",
    "choices": [
      "Prime Minister",
      "Monarch",
      "Queen Mother only",
      "Mayor"
    ],
    "correct": 1
  },
  {
    "question": "The Shard is?",
    "choices": [
      "a museum",
      "tallest building in UK",
      "Underground line",
      "old fortress"
    ],
    "correct": 1
  },
  {
    "question": "Westminster Abbey hosts royal?",
    "choices": [
      "weddings & coronations",
      "cooking",
      "cinema",
      "horse races"
    ],
    "correct": 0
  },
  {
    "question": "Camden is famous for?",
    "choices": [
      "finance",
      "markets/alt music",
      "royals",
      "industry"
    ],
    "correct": 1
  },
  {
    "question": "Soho is known for?",
    "choices": [
      "castles",
      "theater & nightlife",
      "factories",
      "ports"
    ],
    "correct": 1
  },
  {
    "question": "Notting Hill hosts a famous?",
    "choices": [
      "airport",
      "carnival",
      "cathedral",
      "museum"
    ],
    "correct": 1
  },
  {
    "question": "Hyde Park is in?",
    "choices": [
      "Greenwich",
      "Westminster",
      "Camden",
      "Chelsea"
    ],
    "correct": 1
  },
  {
    "question": "The British Museum is in?",
    "choices": [
      "Bloomsbury",
      "Mayfair",
      "Soho",
      "Bermondsey"
    ],
    "correct": 0
  },
  {
    "question": "St Paul's Cathedral was designed by?",
    "choices": [
      "Wren",
      "Hawksmoor",
      "Vanbrugh",
      "Lutyens"
    ],
    "correct": 0
  },
  {
    "question": "London Eye opened in?",
    "choices": [
      "1985",
      "1995",
      "2000",
      "2005"
    ],
    "correct": 2
  },
  {
    "question": "The Tube line marked yellow on maps is?",
    "choices": [
      "Central",
      "Circle",
      "District",
      "Bakerloo"
    ],
    "correct": 1
  },
  {
    "question": "Greenwich is famous for?",
    "choices": [
      "the Prime Meridian",
      "the Tower",
      "Tate",
      "Camden Market"
    ],
    "correct": 0
  },
  {
    "question": "Covent Garden is famous for?",
    "choices": [
      "finance",
      "market & opera",
      "industry",
      "ports"
    ],
    "correct": 1
  },
  {
    "question": "The Globe Theatre is associated with?",
    "choices": [
      "Marlowe",
      "Shakespeare",
      "Dickens",
      "Wilde"
    ],
    "correct": 1
  },
  {
    "question": "Black cabs are named?",
    "choices": [
      "Hackney carriages",
      "Lamborghinis",
      "Wakers",
      "Stilton cabs"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: LondonQuizSettings): LondonQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LondonQuizState, action: LondonQuizAction): LondonQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LondonQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
