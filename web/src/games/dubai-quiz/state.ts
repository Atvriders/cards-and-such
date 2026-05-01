import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DubaiQuizSettings { questions: "10" | "20"; }
export interface DubaiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DubaiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Dubai is in which country?",
    "choices": [
      "Saudi Arabia",
      "UAE",
      "Qatar",
      "Oman"
    ],
    "correct": 1
  },
  {
    "question": "The Burj Khalifa was completed in?",
    "choices": [
      "2005",
      "2010",
      "2015",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "Burj Khalifa's height is approximately?",
    "choices": [
      "500m",
      "700m",
      "830m",
      "1000m"
    ],
    "correct": 2
  },
  {
    "question": "Dubai's currency is the?",
    "choices": [
      "Dinar",
      "Dirham",
      "Riyal",
      "Lira"
    ],
    "correct": 1
  },
  {
    "question": "Palm Jumeirah is shaped like a?",
    "choices": [
      "dolphin",
      "palm tree",
      "star",
      "crescent only"
    ],
    "correct": 1
  },
  {
    "question": "The official language of the UAE is?",
    "choices": [
      "English",
      "Arabic",
      "Farsi",
      "Urdu"
    ],
    "correct": 1
  },
  {
    "question": "The Burj Al Arab is famous as a?",
    "choices": [
      "airport",
      "sail-shaped luxury hotel",
      "mosque",
      "cinema"
    ],
    "correct": 1
  },
  {
    "question": "Dubai Mall is one of the world's?",
    "choices": [
      "smallest",
      "largest by area",
      "oldest",
      "tallest"
    ],
    "correct": 1
  },
  {
    "question": "The Dubai Fountain dances in front of the?",
    "choices": [
      "Atlantis Hotel",
      "Burj Khalifa",
      "Burj Al Arab",
      "World Trade Centre"
    ],
    "correct": 1
  },
  {
    "question": "Dubai Metro opened in?",
    "choices": [
      "2005",
      "2009",
      "2013",
      "2016"
    ],
    "correct": 1
  },
  {
    "question": "The UAE was federated in?",
    "choices": [
      "1947",
      "1956",
      "1971",
      "1981"
    ],
    "correct": 2
  },
  {
    "question": "The ruling family of Dubai is the?",
    "choices": [
      "Al Nahyan",
      "Al Maktoum",
      "Al Saud",
      "Al Sabah"
    ],
    "correct": 1
  },
  {
    "question": "The Atlantis hotel sits on which palm?",
    "choices": [
      "Palm Jebel Ali",
      "Palm Jumeirah",
      "Palm Deira",
      "Palm Khalifa"
    ],
    "correct": 1
  },
  {
    "question": "Bur Dubai and Deira are separated by?",
    "choices": [
      "Sheikh Zayed Road",
      "Dubai Creek",
      "Persian Gulf",
      "Ras Al Khor"
    ],
    "correct": 1
  },
  {
    "question": "Traditional Dubai trading boats are called?",
    "choices": [
      "dhows",
      "junks",
      "feluccas",
      "longships"
    ],
    "correct": 0
  },
  {
    "question": "Dubai's main airport hub airline is?",
    "choices": [
      "Etihad",
      "Emirates",
      "Qatar Airways",
      "FlyDubai"
    ],
    "correct": 1
  },
  {
    "question": "The 'World Islands' are?",
    "choices": [
      "natural archipelago",
      "artificial islands shaped like the world map",
      "national parks",
      "oil platforms"
    ],
    "correct": 1
  },
  {
    "question": "Sheikh Zayed Road is famous for its?",
    "choices": [
      "beaches",
      "skyscrapers",
      "souks",
      "ski slopes"
    ],
    "correct": 1
  },
  {
    "question": "Ski Dubai is located inside?",
    "choices": [
      "Dubai Mall",
      "Mall of the Emirates",
      "Ibn Battuta Mall",
      "City Walk"
    ],
    "correct": 1
  },
  {
    "question": "The Gold Souk is in?",
    "choices": [
      "Bur Dubai",
      "Deira",
      "Jumeirah",
      "Marina"
    ],
    "correct": 1
  },
  {
    "question": "Emirati food shawarma is wrapped in?",
    "choices": [
      "tortilla",
      "flatbread",
      "lettuce",
      "rice paper"
    ],
    "correct": 1
  },
  {
    "question": "Machboos is a traditional spiced rice dish typically with?",
    "choices": [
      "pork",
      "chicken or lamb",
      "beef tongue",
      "seafood only"
    ],
    "correct": 1
  },
  {
    "question": "Camel milk is commonly consumed in?",
    "choices": [
      "UAE",
      "Norway",
      "Japan",
      "Brazil"
    ],
    "correct": 0
  },
  {
    "question": "Karak chai is a popular?",
    "choices": [
      "spiced tea with milk",
      "coffee shot",
      "fruit smoothie",
      "yogurt drink"
    ],
    "correct": 0
  },
  {
    "question": "Ramadan in Dubai famously features?",
    "choices": [
      "fireworks all month",
      "fasting from sunrise to sunset",
      "no work at all",
      "snow"
    ],
    "correct": 1
  },
  {
    "question": "The Museum of the Future is famous for its?",
    "choices": [
      "pyramidal shape",
      "torus calligraphy facade",
      "glass dome",
      "underwater hall"
    ],
    "correct": 1
  },
  {
    "question": "Jumeirah Mosque is one of the few mosques in Dubai open to?",
    "choices": [
      "men only",
      "non-Muslim visitors via tour",
      "royalty only",
      "no one"
    ],
    "correct": 1
  },
  {
    "question": "Global Village is a seasonal?",
    "choices": [
      "museum",
      "multicultural theme park",
      "souk",
      "auto show"
    ],
    "correct": 1
  },
  {
    "question": "Dubai weekend shifted in 2022 to?",
    "choices": [
      "Thursday-Friday",
      "Friday-Saturday",
      "Saturday-Sunday",
      "Sunday-Monday"
    ],
    "correct": 2
  },
  {
    "question": "The Emirates Airline cable car experience is at?",
    "choices": [
      "Dubai Marina",
      "Dubai Creek Harbour",
      "London (sponsor)",
      "JBR"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DubaiQuizSettings): DubaiQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DubaiQuizState, action: DubaiQuizAction): DubaiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DubaiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
