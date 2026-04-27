import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EasterQuizSettings { questions: "10" | "20" | "30"; }
export interface EasterQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EasterQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Easter celebrates the resurrection of?",
    "choices": [
      "Moses",
      "Jesus Christ",
      "Mary",
      "Peter"
    ],
    "correct": 1
  },
  {
    "question": "Easter falls between which dates?",
    "choices": [
      "Mar 1-Apr 1",
      "Mar 22-Apr 25",
      "Apr 1-May 1",
      "Mar 15-Apr 30"
    ],
    "correct": 1
  },
  {
    "question": "Which day comes before Easter Sunday?",
    "choices": [
      "Good Friday",
      "Holy Saturday",
      "Maundy Thursday",
      "Palm Sunday"
    ],
    "correct": 1
  },
  {
    "question": "Lent lasts how many days?",
    "choices": [
      "20",
      "30",
      "40",
      "50"
    ],
    "correct": 2
  },
  {
    "question": "The Easter Bunny tradition began in?",
    "choices": [
      "England",
      "Germany",
      "France",
      "Italy"
    ],
    "correct": 1
  },
  {
    "question": "Which country has the largest Easter egg hunt traditions?",
    "choices": [
      "UK",
      "USA",
      "Germany",
      "Australia"
    ],
    "correct": 1
  },
  {
    "question": "Pysanky are decorated eggs from?",
    "choices": [
      "Russia",
      "Ukraine",
      "Poland",
      "Greece"
    ],
    "correct": 1
  },
  {
    "question": "Hot cross buns are eaten on?",
    "choices": [
      "Easter Sunday",
      "Good Friday",
      "Maundy Thursday",
      "Easter Monday"
    ],
    "correct": 1
  },
  {
    "question": "Easter Island is named for?",
    "choices": [
      "Discovery on Easter",
      "Native festival",
      "Spanish festival",
      "Easter Bunny myth"
    ],
    "correct": 0
  },
  {
    "question": "Which animal lays Easter eggs in folklore?",
    "choices": [
      "Chicken",
      "Hare/Bunny",
      "Duck",
      "Goose"
    ],
    "correct": 1
  },
  {
    "question": "Pace eggs are rolled in which country?",
    "choices": [
      "Scotland",
      "Ireland",
      "England",
      "Wales"
    ],
    "correct": 2
  },
  {
    "question": "Carnival precedes which Christian period?",
    "choices": [
      "Easter",
      "Christmas",
      "Lent",
      "Advent"
    ],
    "correct": 2
  },
  {
    "question": "Sunrise services on Easter mark?",
    "choices": [
      "The crucifixion",
      "The resurrection",
      "The ascension",
      "The last supper"
    ],
    "correct": 1
  },
  {
    "question": "Palm Sunday remembers Jesus entering?",
    "choices": [
      "Bethlehem",
      "Galilee",
      "Jerusalem",
      "Nazareth"
    ],
    "correct": 2
  },
  {
    "question": "Which country eats babka cake at Easter?",
    "choices": [
      "Italy",
      "Poland",
      "Spain",
      "Greece"
    ],
    "correct": 1
  },
  {
    "question": "Maundy Thursday commemorates?",
    "choices": [
      "The trial",
      "The last supper",
      "The crucifixion",
      "The resurrection"
    ],
    "correct": 1
  },
  {
    "question": "Greek Easter eggs are dyed which color?",
    "choices": [
      "Blue",
      "Red",
      "Green",
      "Yellow"
    ],
    "correct": 1
  },
  {
    "question": "Lamb is a symbol because Jesus is called?",
    "choices": [
      "Lion of Judah",
      "Lamb of God",
      "Bread of Life",
      "Light of the World"
    ],
    "correct": 1
  },
  {
    "question": "What is Pascha?",
    "choices": [
      "Easter in Greek/Russian",
      "A festival cake",
      "A Spanish dance",
      "A flower"
    ],
    "correct": 0
  },
  {
    "question": "Easter parade is famous in which US city?",
    "choices": [
      "Chicago",
      "New York",
      "Boston",
      "LA"
    ],
    "correct": 1
  },
  {
    "question": "How long is Holy Week?",
    "choices": [
      "5 days",
      "7 days",
      "8 days",
      "9 days"
    ],
    "correct": 1
  },
  {
    "question": "Which feast does Easter resolve?",
    "choices": [
      "Christmas",
      "Lent",
      "Pentecost",
      "Advent"
    ],
    "correct": 1
  },
  {
    "question": "Which composer wrote 'St Matthew Passion'?",
    "choices": [
      "Handel",
      "Bach",
      "Mozart",
      "Haydn"
    ],
    "correct": 1
  },
  {
    "question": "Easter eggs in chocolate originated in?",
    "choices": [
      "Switzerland",
      "France",
      "Belgium",
      "Germany"
    ],
    "correct": 1
  },
  {
    "question": "What's a Cadbury Cream Egg made from?",
    "choices": [
      "Marzipan",
      "Fondant",
      "Caramel",
      "Nougat"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EasterQuizSettings): EasterQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EasterQuizState, action: EasterQuizAction): EasterQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EasterQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
