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
    "question": "Times Square is in?",
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
    "question": "Central Park is in?",
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
      "1853",
      "1883",
      "1903",
      "1923"
    ],
    "correct": 1
  },
  {
    "question": "Wall Street is famous as the?",
    "choices": [
      "theater district",
      "financial district",
      "fashion district",
      "university hub"
    ],
    "correct": 1
  },
  {
    "question": "JFK and LaGuardia are in which borough?",
    "choices": [
      "Manhattan",
      "Bronx",
      "Queens",
      "Brooklyn"
    ],
    "correct": 2
  },
  {
    "question": "Yankees baseball plays in which borough?",
    "choices": [
      "Queens",
      "Bronx",
      "Manhattan",
      "Brooklyn"
    ],
    "correct": 1
  },
  {
    "question": "Rockefeller Center is famous for its?",
    "choices": [
      "beach",
      "ice rink",
      "temple",
      "castle"
    ],
    "correct": 1
  },
  {
    "question": "Coney Island is in?",
    "choices": [
      "Manhattan",
      "Brooklyn",
      "Queens",
      "Bronx"
    ],
    "correct": 1
  },
  {
    "question": "Greenwich Village is in?",
    "choices": [
      "Manhattan",
      "Brooklyn",
      "Queens",
      "Bronx"
    ],
    "correct": 0
  },
  {
    "question": "The Met museum is on which avenue?",
    "choices": [
      "Park",
      "5th",
      "Madison",
      "Lexington"
    ],
    "correct": 1
  },
  {
    "question": "NYC subway opened in?",
    "choices": [
      "1880",
      "1904",
      "1925",
      "1950"
    ],
    "correct": 1
  },
  {
    "question": "Ellis Island processed?",
    "choices": [
      "soldiers",
      "immigrants",
      "prisoners",
      "tourists"
    ],
    "correct": 1
  },
  {
    "question": "Broadway is famous for?",
    "choices": [
      "theater",
      "fashion",
      "food",
      "banking"
    ],
    "correct": 0
  },
  {
    "question": "The Bronx Zoo is in?",
    "choices": [
      "Manhattan",
      "Brooklyn",
      "Queens",
      "Bronx"
    ],
    "correct": 3
  },
  {
    "question": "World Trade Center towers fell in?",
    "choices": [
      "1993",
      "1996",
      "2001",
      "2008"
    ],
    "correct": 2
  },
  {
    "question": "Harlem is in?",
    "choices": [
      "Manhattan",
      "Brooklyn",
      "Queens",
      "Bronx"
    ],
    "correct": 0
  },
  {
    "question": "Staten Island is connected to Brooklyn by?",
    "choices": [
      "Brooklyn Bridge",
      "Verrazzano Bridge",
      "George Washington Bridge",
      "Tunnel only"
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
