import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PictionaryBaseQuizSettings { questions: "10"; }
export interface PictionaryBaseQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PictionaryBaseQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Pictionary's core mechanic is?",
    "choices": [
      "Drawing a clue while teammates guess",
      "Bidding",
      "Memorising cards",
      "Trick-taking"
    ],
    "correct": 0
  },
  {
    "question": "Pictionary was originally published by?",
    "choices": [
      "Angel Games (Pictionary Inc.)",
      "Hasbro originally",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "Pictionary cards are sorted by?",
    "choices": [
      "Category (Person, Object, Action, etc.)",
      "Color only",
      "Number",
      "Difficulty stars only"
    ],
    "correct": 0
  },
  {
    "question": "The all-play category lets?",
    "choices": [
      "All teams sketch and guess at once",
      "No drawing",
      "Trade cards",
      "Skip turn"
    ],
    "correct": 0
  },
  {
    "question": "Pictionary uses a board with?",
    "choices": [
      "Coloured spaces tied to categories",
      "Hex tiles",
      "A grid of letters",
      "No board"
    ],
    "correct": 0
  },
  {
    "question": "Players are forbidden from?",
    "choices": [
      "Writing letters or speaking the clue",
      "Holding the marker",
      "Looking at cards",
      "Erasing"
    ],
    "correct": 0
  },
  {
    "question": "Pictionary's typical timer is?",
    "choices": [
      "A one-minute sand timer",
      "Five seconds",
      "Ten minutes",
      "No timer"
    ],
    "correct": 0
  },
  {
    "question": "The drawer for a round is selected by?",
    "choices": [
      "Rotation among teammates",
      "Auction",
      "Highest die roll only",
      "Self-nomination always"
    ],
    "correct": 0
  },
  {
    "question": "Pictionary became popular in which decade?",
    "choices": [
      "1980s",
      "1950s",
      "2010s",
      "1920s"
    ],
    "correct": 0
  },
  {
    "question": "Pictionary's mood is best described as?",
    "choices": [
      "Quick laughs and frantic team play",
      "Heavy strategy",
      "Solo puzzle",
      "Quiet reflection"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PictionaryBaseQuizSettings): PictionaryBaseQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PictionaryBaseQuizState, action: PictionaryBaseQuizAction): PictionaryBaseQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PictionaryBaseQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
