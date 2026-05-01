import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NycQuizSettings { questions: "10" | "20"; }
export interface NycQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NycQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "How many boroughs does NYC have?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2
  },
  {
    "question": "Times Square sits in which borough?",
    "choices": [
      "Brooklyn",
      "Manhattan",
      "Queens",
      "Bronx"
    ],
    "correct": 1
  },
  {
    "question": "The Statue of Liberty was a gift from?",
    "choices": [
      "UK",
      "France",
      "Italy",
      "Spain"
    ],
    "correct": 1
  },
  {
    "question": "The Empire State Building has how many floors?",
    "choices": [
      "62",
      "102",
      "150",
      "200"
    ],
    "correct": 1
  },
  {
    "question": "Central Park is in which borough?",
    "choices": [
      "Brooklyn",
      "Manhattan",
      "Queens",
      "Bronx"
    ],
    "correct": 1
  },
  {
    "question": "The Brooklyn Bridge opened in?",
    "choices": [
      "1873",
      "1883",
      "1893",
      "1903"
    ],
    "correct": 1
  },
  {
    "question": "Wall Street is the heart of?",
    "choices": [
      "theater",
      "fashion",
      "finance",
      "publishing"
    ],
    "correct": 2
  },
  {
    "question": "The original World Trade Center towers fell in?",
    "choices": [
      "1993",
      "2001",
      "2008",
      "2010"
    ],
    "correct": 1
  },
  {
    "question": "Yankee Stadium is in which borough?",
    "choices": [
      "Manhattan",
      "Bronx",
      "Queens",
      "Staten Island"
    ],
    "correct": 1
  },
  {
    "question": "JFK and LaGuardia airports are in which borough?",
    "choices": [
      "Brooklyn",
      "Queens",
      "Bronx",
      "Manhattan"
    ],
    "correct": 1
  },
  {
    "question": "Coney Island is famous for its boardwalk in?",
    "choices": [
      "Brooklyn",
      "Manhattan",
      "Queens",
      "Bronx"
    ],
    "correct": 0
  },
  {
    "question": "The Met (MoMA's neighbor on 5th Ave) is officially the?",
    "choices": [
      "Met Opera",
      "Metropolitan Museum of Art",
      "Met Life Building",
      "Met Cloisters"
    ],
    "correct": 1
  },
  {
    "question": "Ellis Island processed millions of?",
    "choices": [
      "soldiers",
      "immigrants",
      "tourists",
      "prisoners"
    ],
    "correct": 1
  },
  {
    "question": "The Chrysler Building's style is?",
    "choices": [
      "Gothic Revival",
      "Art Deco",
      "Beaux-Arts",
      "Brutalist"
    ],
    "correct": 1
  },
  {
    "question": "Grand Central Terminal opened in?",
    "choices": [
      "1899",
      "1913",
      "1925",
      "1937"
    ],
    "correct": 1
  },
  {
    "question": "The High Line is a park built on a former?",
    "choices": [
      "pier",
      "elevated rail line",
      "highway",
      "subway tunnel"
    ],
    "correct": 1
  },
  {
    "question": "NYC was originally founded by the Dutch as?",
    "choices": [
      "New Amsterdam",
      "New Holland",
      "New Utrecht",
      "New Hudson"
    ],
    "correct": 0
  },
  {
    "question": "The Statue of Liberty was dedicated in?",
    "choices": [
      "1876",
      "1886",
      "1900",
      "1920"
    ],
    "correct": 1
  },
  {
    "question": "NYC's iconic thin-crust pizza style is most associated with which borough?",
    "choices": [
      "Manhattan",
      "Brooklyn",
      "Bronx",
      "Queens"
    ],
    "correct": 1
  },
  {
    "question": "A New York bagel is traditionally?",
    "choices": [
      "fried",
      "boiled then baked",
      "steamed only",
      "grilled"
    ],
    "correct": 1
  },
  {
    "question": "The 'cronut' was invented in NYC by?",
    "choices": [
      "Magnolia Bakery",
      "Dominique Ansel",
      "Levain",
      "Junior's"
    ],
    "correct": 1
  },
  {
    "question": "The NY Yankees and Mets share which league?",
    "choices": [
      "NHL",
      "NBA",
      "MLB",
      "NFL"
    ],
    "correct": 2
  },
  {
    "question": "Broadway theaters cluster around?",
    "choices": [
      "Wall Street",
      "Times Square",
      "Battery Park",
      "Harlem"
    ],
    "correct": 1
  },
  {
    "question": "The Harlem Renaissance flourished in the?",
    "choices": [
      "1900s",
      "1920s",
      "1950s",
      "1970s"
    ],
    "correct": 1
  },
  {
    "question": "Rockefeller Center is famous each winter for its?",
    "choices": [
      "beach",
      "ice rink & tree",
      "ski jump",
      "carnival"
    ],
    "correct": 1
  },
  {
    "question": "The 'L' subway line connects Manhattan to?",
    "choices": [
      "Brooklyn",
      "Queens",
      "Bronx",
      "Staten Island"
    ],
    "correct": 0
  },
  {
    "question": "The Staten Island Ferry is famously?",
    "choices": [
      "expensive",
      "free",
      "express only",
      "private"
    ],
    "correct": 1
  },
  {
    "question": "NYC's nickname 'Big Apple' was popularized by?",
    "choices": [
      "jazz musicians & 1970s tourism campaign",
      "Theodore Roosevelt",
      "the Dutch",
      "the Yankees"
    ],
    "correct": 0
  },
  {
    "question": "The American Museum of Natural History is famous for its giant?",
    "choices": [
      "dinosaur skeletons",
      "diamond exhibit",
      "moon rock",
      "submarine"
    ],
    "correct": 0
  },
  {
    "question": "The 1969 Stonewall uprising occurred in which neighborhood?",
    "choices": [
      "SoHo",
      "Greenwich Village",
      "Upper East Side",
      "Tribeca"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NycQuizSettings): NycQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NycQuizState, action: NycQuizAction): NycQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NycQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
