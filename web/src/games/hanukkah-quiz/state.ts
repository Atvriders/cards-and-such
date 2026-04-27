import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HanukkahQuizSettings { questions: "10" | "20" | "30"; }
export interface HanukkahQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HanukkahQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Hanukkah lasts how many nights?",
    "choices": [
      "6",
      "7",
      "8",
      "9"
    ],
    "correct": 2
  },
  {
    "question": "Hanukkah commemorates what victory?",
    "choices": [
      "Maccabean",
      "Babylonian",
      "Egyptian",
      "Roman"
    ],
    "correct": 0
  },
  {
    "question": "Menorah branches that are lit total?",
    "choices": [
      "7",
      "8",
      "9",
      "10"
    ],
    "correct": 1
  },
  {
    "question": "The shamash is the?",
    "choices": [
      "Helper candle",
      "Eighth night",
      "Spinner",
      "Gift"
    ],
    "correct": 0
  },
  {
    "question": "Dreidel sides have which letters?",
    "choices": [
      "Aleph-Bet",
      "Nun-Gimel-Hey-Shin",
      "Yud-Hey-Vav-Hey",
      "Aleph-Mem-Tav-Bet"
    ],
    "correct": 1
  },
  {
    "question": "Latkes are made from?",
    "choices": [
      "Cheese",
      "Potato",
      "Apple",
      "Bread"
    ],
    "correct": 1
  },
  {
    "question": "Sufganiyot are?",
    "choices": [
      "Pancakes",
      "Donuts",
      "Pastries",
      "Pies"
    ],
    "correct": 1
  },
  {
    "question": "Hanukkah means?",
    "choices": [
      "Light",
      "Dedication",
      "Festival",
      "Holy"
    ],
    "correct": 1
  },
  {
    "question": "Temple cleansed after victory was in?",
    "choices": [
      "Jerusalem",
      "Damascus",
      "Cairo",
      "Rome"
    ],
    "correct": 0
  },
  {
    "question": "Oil miracle lasted how many days?",
    "choices": [
      "6",
      "7",
      "8",
      "10"
    ],
    "correct": 2
  },
  {
    "question": "Hanukkah is in which Hebrew month?",
    "choices": [
      "Tishrei",
      "Cheshvan",
      "Kislev",
      "Tevet"
    ],
    "correct": 2
  },
  {
    "question": "Candle is lit from which side?",
    "choices": [
      "Right",
      "Left",
      "Center",
      "Both"
    ],
    "correct": 1
  },
  {
    "question": "Maccabees fought against?",
    "choices": [
      "Romans",
      "Seleucid Greeks",
      "Persians",
      "Egyptians"
    ],
    "correct": 1
  },
  {
    "question": "Judah Maccabee led which group?",
    "choices": [
      "Pharisees",
      "Hasmoneans",
      "Sadducees",
      "Zealots"
    ],
    "correct": 1
  },
  {
    "question": "Gelt are?",
    "choices": [
      "Coins",
      "Cookies",
      "Cakes",
      "Candles"
    ],
    "correct": 0
  },
  {
    "question": "Chocolate gelt usually wrapped in?",
    "choices": [
      "Silver",
      "Gold foil",
      "Tin foil",
      "Wax paper"
    ],
    "correct": 1
  },
  {
    "question": "Modern dreidel game was inspired by?",
    "choices": [
      "Spinning top",
      "Card game",
      "Dice",
      "Marbles"
    ],
    "correct": 0
  },
  {
    "question": "What does 'Nes Gadol Hayah Sham' mean?",
    "choices": [
      "Light shines",
      "Great miracle happened there",
      "Hanukkah is here",
      "Praise God"
    ],
    "correct": 1
  },
  {
    "question": "Israel says 'Po' (here) instead of which word?",
    "choices": [
      "Sham",
      "Hayah",
      "Gadol",
      "Nes"
    ],
    "correct": 0
  },
  {
    "question": "Hanukkiah differs from menorah by having?",
    "choices": [
      "7 branches",
      "8+1 branches",
      "9+1 branches",
      "10 branches"
    ],
    "correct": 1
  },
  {
    "question": "Common Hanukkah fried foods relate to?",
    "choices": [
      "Wheat",
      "Oil miracle",
      "Yeast",
      "Honey"
    ],
    "correct": 1
  },
  {
    "question": "Many Jews give gifts on?",
    "choices": [
      "Christmas",
      "Each Hanukkah night",
      "Yom Kippur",
      "None"
    ],
    "correct": 1
  },
  {
    "question": "Which song is 'I Have a Little Dreidel' also called?",
    "choices": [
      "Sevivon",
      "Maoz Tzur",
      "Hatikvah",
      "Shalom"
    ],
    "correct": 0
  },
  {
    "question": "Maoz Tzur is a Hanukkah?",
    "choices": [
      "Food",
      "Hymn",
      "Game",
      "Coin"
    ],
    "correct": 1
  },
  {
    "question": "Adam Sandler's Hanukkah Song became famous in?",
    "choices": [
      "1990",
      "1994",
      "1996",
      "2000"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HanukkahQuizSettings): HanukkahQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HanukkahQuizState, action: HanukkahQuizAction): HanukkahQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HanukkahQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
