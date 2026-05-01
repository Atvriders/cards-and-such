import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CommunicationInventionsQuizSettings { questions: "10" | "20" | "30"; }
export interface CommunicationInventionsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CommunicationInventionsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Telegraph inventor?",
    "choices": [
      "Bell",
      "Morse",
      "Marconi",
      "Edison"
    ],
    "correct": 1
  },
  {
    "question": "Morse code year?",
    "choices": [
      "1837",
      "1857",
      "1877",
      "1897"
    ],
    "correct": 0
  },
  {
    "question": "Radio pioneer?",
    "choices": [
      "Tesla",
      "Marconi",
      "Bell",
      "Edison"
    ],
    "correct": 1
  },
  {
    "question": "First transatlantic radio signal year?",
    "choices": [
      "1881",
      "1901",
      "1921",
      "1941"
    ],
    "correct": 1
  },
  {
    "question": "Television electronic system pioneer?",
    "choices": [
      "Baird",
      "Farnsworth",
      "Sarnoff",
      "Zworykin"
    ],
    "correct": 1
  },
  {
    "question": "Mechanical TV demonstrated by?",
    "choices": [
      "Baird",
      "Farnsworth",
      "Edison",
      "Tesla"
    ],
    "correct": 0
  },
  {
    "question": "First commercial TV broadcasts began in the?",
    "choices": [
      "1910s",
      "1930s",
      "1950s",
      "1970s"
    ],
    "correct": 1
  },
  {
    "question": "Telephone patented year?",
    "choices": [
      "1856",
      "1876",
      "1896",
      "1916"
    ],
    "correct": 1
  },
  {
    "question": "Mobile phone first call (handheld) year?",
    "choices": [
      "1953",
      "1973",
      "1993",
      "2003"
    ],
    "correct": 1
  },
  {
    "question": "Mobile pioneer at Motorola?",
    "choices": [
      "Cooper",
      "Engelbart",
      "Berners-Lee",
      "Cerf"
    ],
    "correct": 0
  },
  {
    "question": "Email '@' usage credited to?",
    "choices": [
      "Tomlinson",
      "Cerf",
      "Kahn",
      "Berners-Lee"
    ],
    "correct": 0
  },
  {
    "question": "World Wide Web invented by?",
    "choices": [
      "Berners-Lee",
      "Cerf",
      "Gates",
      "Jobs"
    ],
    "correct": 0
  },
  {
    "question": "WWW invented in?",
    "choices": [
      "1979",
      "1989",
      "1999",
      "2009"
    ],
    "correct": 1
  },
  {
    "question": "Internet protocol TCP/IP fathers?",
    "choices": [
      "Cerf and Kahn",
      "Gates and Allen",
      "Jobs and Wozniak",
      "Berners-Lee and Cailliau"
    ],
    "correct": 0
  },
  {
    "question": "ARPANET first message year?",
    "choices": [
      "1959",
      "1969",
      "1979",
      "1989"
    ],
    "correct": 1
  },
  {
    "question": "Fiber optics widely deployed starting in?",
    "choices": [
      "1960s",
      "1980s",
      "2000s",
      "2020s"
    ],
    "correct": 1
  },
  {
    "question": "First geostationary communications satellite?",
    "choices": [
      "Sputnik",
      "Telstar",
      "Syncom 3",
      "Echo"
    ],
    "correct": 2
  },
  {
    "question": "Telstar launched in?",
    "choices": [
      "1952",
      "1962",
      "1972",
      "1982"
    ],
    "correct": 1
  },
  {
    "question": "SMS first message sent in?",
    "choices": [
      "1982",
      "1992",
      "2002",
      "2012"
    ],
    "correct": 1
  },
  {
    "question": "Bluetooth named after?",
    "choices": [
      "Viking king",
      "Norse god",
      "Roman emperor",
      "Greek hero"
    ],
    "correct": 0
  },
  {
    "question": "Wi-Fi standard family?",
    "choices": [
      "802.3",
      "802.11",
      "802.16",
      "802.5"
    ],
    "correct": 1
  },
  {
    "question": "First widely used web browser?",
    "choices": [
      "Mosaic",
      "Netscape",
      "IE",
      "Chrome"
    ],
    "correct": 0
  },
  {
    "question": "Mosaic released in?",
    "choices": [
      "1983",
      "1993",
      "2003",
      "2013"
    ],
    "correct": 1
  },
  {
    "question": "Facebook launched in?",
    "choices": [
      "2002",
      "2004",
      "2006",
      "2008"
    ],
    "correct": 1
  },
  {
    "question": "Twitter launched in?",
    "choices": [
      "2004",
      "2006",
      "2008",
      "2010"
    ],
    "correct": 1
  },
  {
    "question": "YouTube founded in?",
    "choices": [
      "2003",
      "2005",
      "2007",
      "2009"
    ],
    "correct": 1
  },
  {
    "question": "First fax machine concept by?",
    "choices": [
      "Bain",
      "Bell",
      "Edison",
      "Marconi"
    ],
    "correct": 0
  },
  {
    "question": "Phonograph predecessor of?",
    "choices": [
      "Telegraph",
      "Audio recording",
      "TV",
      "Radio"
    ],
    "correct": 1
  },
  {
    "question": "Skype released in?",
    "choices": [
      "1993",
      "2003",
      "2013",
      "2023"
    ],
    "correct": 1
  },
  {
    "question": "First smartphone with touchscreen widely sold?",
    "choices": [
      "Nokia 3310",
      "iPhone (2007)",
      "Blackberry",
      "Razr"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CommunicationInventionsQuizSettings): CommunicationInventionsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CommunicationInventionsQuizState, action: CommunicationInventionsQuizAction): CommunicationInventionsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CommunicationInventionsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
