import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChristmasQuizSettings { questions: "10" | "20" | "30"; }
export interface ChristmasQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChristmasQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "In which country did Christmas trees first become popular?",
    "choices": [
      "England",
      "Germany",
      "France",
      "Italy"
    ],
    "correct": 1
  },
  {
    "question": "Who wrote 'A Christmas Carol'?",
    "choices": [
      "Charles Dickens",
      "Mark Twain",
      "Jane Austen",
      "Lewis Carroll"
    ],
    "correct": 0
  },
  {
    "question": "What is the Spanish term for Christmas?",
    "choices": [
      "Pascua",
      "Navidad",
      "Noche",
      "Fiesta"
    ],
    "correct": 1
  },
  {
    "question": "How many ghosts visit Scrooge?",
    "choices": [
      "Two",
      "Three",
      "Four",
      "Five"
    ],
    "correct": 1
  },
  {
    "question": "Which reindeer has a red nose?",
    "choices": [
      "Dasher",
      "Comet",
      "Rudolph",
      "Donner"
    ],
    "correct": 2
  },
  {
    "question": "In what year was 'Jingle Bells' published?",
    "choices": [
      "1857",
      "1880",
      "1900",
      "1925"
    ],
    "correct": 0
  },
  {
    "question": "Mistletoe was sacred to which ancient peoples?",
    "choices": [
      "Romans",
      "Druids",
      "Vikings",
      "Greeks"
    ],
    "correct": 1
  },
  {
    "question": "Which country gives Britain the Trafalgar Square tree?",
    "choices": [
      "Sweden",
      "Norway",
      "Finland",
      "Denmark"
    ],
    "correct": 1
  },
  {
    "question": "What is a 'Yule log' originally?",
    "choices": [
      "A cake",
      "A burning log",
      "A song",
      "A dance"
    ],
    "correct": 1
  },
  {
    "question": "Which day is Boxing Day?",
    "choices": [
      "Dec 24",
      "Dec 25",
      "Dec 26",
      "Dec 31"
    ],
    "correct": 2
  },
  {
    "question": "Saint Nicholas was bishop of?",
    "choices": [
      "Myra",
      "Rome",
      "Antioch",
      "Alexandria"
    ],
    "correct": 0
  },
  {
    "question": "Which colour is most associated with Santa Claus?",
    "choices": [
      "Green",
      "Blue",
      "Red",
      "Gold"
    ],
    "correct": 2
  },
  {
    "question": "Which Christmas film features Kevin McCallister?",
    "choices": [
      "Elf",
      "Home Alone",
      "The Grinch",
      "Polar Express"
    ],
    "correct": 1
  },
  {
    "question": "Where does Krampus folklore come from?",
    "choices": [
      "Spain",
      "Alpine regions",
      "Russia",
      "Japan"
    ],
    "correct": 1
  },
  {
    "question": "What is panettone?",
    "choices": [
      "Italian Christmas bread",
      "German cookie",
      "French pudding",
      "Spanish ham"
    ],
    "correct": 0
  },
  {
    "question": "How many days are in the '12 Days of Christmas'?",
    "choices": [
      "10",
      "12",
      "14",
      "20"
    ],
    "correct": 1
  },
  {
    "question": "What does 'Feliz Navidad' mean?",
    "choices": [
      "Good morning",
      "Happy Birthday",
      "Merry Christmas",
      "Happy New Year"
    ],
    "correct": 2
  },
  {
    "question": "Which country eats KFC traditionally on Christmas?",
    "choices": [
      "Korea",
      "Japan",
      "China",
      "Vietnam"
    ],
    "correct": 1
  },
  {
    "question": "What is Pere Noel's home?",
    "choices": [
      "Lapland",
      "North Pole",
      "Greenland",
      "Sweden"
    ],
    "correct": 0
  },
  {
    "question": "In Mexico, the Christmas season ends with?",
    "choices": [
      "Las Posadas",
      "Dia de Reyes",
      "Carnaval",
      "Dia de Muertos"
    ],
    "correct": 1
  },
  {
    "question": "What does 'Noel' mean originally?",
    "choices": [
      "Born",
      "New",
      "Christmas / Birth",
      "Holy"
    ],
    "correct": 2
  },
  {
    "question": "Christmas was banned in England by which leader?",
    "choices": [
      "Henry VIII",
      "Cromwell",
      "Queen Mary",
      "Charles II"
    ],
    "correct": 1
  },
  {
    "question": "Which country gave us the gingerbread house?",
    "choices": [
      "Sweden",
      "Germany",
      "Austria",
      "Switzerland"
    ],
    "correct": 1
  },
  {
    "question": "What date is Orthodox Christmas?",
    "choices": [
      "Dec 25",
      "Jan 1",
      "Jan 6",
      "Jan 7"
    ],
    "correct": 3
  },
  {
    "question": "Who painted famous Santa Claus images for Coca-Cola?",
    "choices": [
      "Norman Rockwell",
      "Haddon Sundblom",
      "Maxfield Parrish",
      "Thomas Nast"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChristmasQuizSettings): ChristmasQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChristmasQuizState, action: ChristmasQuizAction): ChristmasQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChristmasQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
