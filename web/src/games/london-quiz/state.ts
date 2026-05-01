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
    "question": "Big Ben is officially the nickname for the?",
    "choices": [
      "bell inside the tower",
      "clock face",
      "tower itself",
      "Parliament building"
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
    "question": "The Tower of London is famous for housing the?",
    "choices": [
      "royal bedrooms",
      "Crown Jewels",
      "Doomsday Book",
      "Magna Carta"
    ],
    "correct": 1
  },
  {
    "question": "The Great Fire of London was in?",
    "choices": [
      "1606",
      "1666",
      "1715",
      "1759"
    ],
    "correct": 1
  },
  {
    "question": "Buckingham Palace is the residence of the?",
    "choices": [
      "Prime Minister",
      "British monarch",
      "Lord Mayor",
      "Speaker"
    ],
    "correct": 1
  },
  {
    "question": "Westminster Abbey is the traditional site of?",
    "choices": [
      "coronations",
      "executions",
      "trials",
      "horse races"
    ],
    "correct": 0
  },
  {
    "question": "The London Eye is a giant?",
    "choices": [
      "clock",
      "Ferris wheel",
      "telescope",
      "fountain"
    ],
    "correct": 1
  },
  {
    "question": "The British Museum is famous for the?",
    "choices": [
      "Magna Carta",
      "Rosetta Stone",
      "Bayeux Tapestry",
      "Crown Jewels"
    ],
    "correct": 1
  },
  {
    "question": "Tower Bridge is often confused with?",
    "choices": [
      "London Bridge",
      "Millennium Bridge",
      "Waterloo Bridge",
      "Westminster Bridge"
    ],
    "correct": 0
  },
  {
    "question": "The Shard is London's?",
    "choices": [
      "oldest church",
      "tallest skyscraper",
      "biggest train station",
      "main library"
    ],
    "correct": 1
  },
  {
    "question": "Hyde Park's famous free-speech corner is?",
    "choices": [
      "Speakers' Corner",
      "Liberty Lawn",
      "Open Mic Garden",
      "Free Forum"
    ],
    "correct": 0
  },
  {
    "question": "The Victoria & Albert Museum specializes in?",
    "choices": [
      "natural history",
      "decorative arts & design",
      "naval history",
      "modern war"
    ],
    "correct": 1
  },
  {
    "question": "Piccadilly Circus is famous for its illuminated?",
    "choices": [
      "fountain",
      "advertising billboards",
      "carousel",
      "ice rink"
    ],
    "correct": 1
  },
  {
    "question": "The Globe Theatre is historically associated with?",
    "choices": [
      "Dickens",
      "Shakespeare",
      "Marlowe alone",
      "Wilde"
    ],
    "correct": 1
  },
  {
    "question": "Black taxis must complete which famous test?",
    "choices": [
      "The Knowledge",
      "The Map",
      "The Route",
      "The Lane"
    ],
    "correct": 0
  },
  {
    "question": "The London Marathon is run in?",
    "choices": [
      "February",
      "April",
      "July",
      "October"
    ],
    "correct": 1
  },
  {
    "question": "Oxford Street is famous for?",
    "choices": [
      "museums",
      "shopping",
      "theatres",
      "embassies"
    ],
    "correct": 1
  },
  {
    "question": "The Tube's oldest line is the?",
    "choices": [
      "Metropolitan",
      "Central",
      "Northern",
      "Victoria"
    ],
    "correct": 0
  },
  {
    "question": "Fish and chips are traditionally wrapped in?",
    "choices": [
      "banana leaves",
      "newspaper (historically)",
      "tinfoil only",
      "wax cloth"
    ],
    "correct": 1
  },
  {
    "question": "Afternoon tea is associated with which 19th-century duchess?",
    "choices": [
      "Bedford",
      "Kent",
      "Cornwall",
      "Devonshire"
    ],
    "correct": 0
  },
  {
    "question": "A 'full English breakfast' typically includes?",
    "choices": [
      "bagels & lox",
      "beans, eggs, sausage, bacon",
      "rice & soup",
      "pancakes & syrup"
    ],
    "correct": 1
  },
  {
    "question": "Chicken tikka masala is often called Britain's?",
    "choices": [
      "royal dish",
      "national dish",
      "oldest dish",
      "test dish"
    ],
    "correct": 1
  },
  {
    "question": "St Paul's Cathedral was designed by?",
    "choices": [
      "Inigo Jones",
      "Christopher Wren",
      "John Nash",
      "Norman Foster"
    ],
    "correct": 1
  },
  {
    "question": "The Blitz refers to bombing of London during?",
    "choices": [
      "WWI",
      "WWII",
      "Cold War",
      "Falklands"
    ],
    "correct": 1
  },
  {
    "question": "London's congestion charge zone covers?",
    "choices": [
      "all of Greater London",
      "central London",
      "the M25 ring",
      "the Docklands only"
    ],
    "correct": 1
  },
  {
    "question": "Notting Hill Carnival celebrates which heritage?",
    "choices": [
      "Indian",
      "Caribbean",
      "Italian",
      "Polish"
    ],
    "correct": 1
  },
  {
    "question": "Camden Market is in north London, famous for?",
    "choices": [
      "antiques only",
      "alternative fashion & street food",
      "wholesale flowers",
      "rare books"
    ],
    "correct": 1
  },
  {
    "question": "The Routemaster is London's classic?",
    "choices": [
      "taxi",
      "double-decker bus",
      "tram",
      "river boat"
    ],
    "correct": 1
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
