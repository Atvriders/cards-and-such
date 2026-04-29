import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface UnoFlipQuizSettings { questions: "10"; }
export interface UnoFlipQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type UnoFlipQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "UNO Flip!'s defining mechanic is?",
    "choices": [
      "Two-sided cards that flip Light to Dark",
      "Dice rolling",
      "Auction",
      "Solo play"
    ],
    "correct": 0
  },
  {
    "question": "On the Dark Side, Draw cards are?",
    "choices": [
      "Heavier (Draw 5 instead of Draw 2)",
      "Lighter",
      "Removed",
      "Same"
    ],
    "correct": 0
  },
  {
    "question": "The 'Skip Everyone' card on Dark Side?",
    "choices": [
      "Skips all other players, you go again",
      "Skips one player",
      "Reverses turn",
      "Adds a card"
    ],
    "correct": 0
  },
  {
    "question": "UNO Flip! is published by?",
    "choices": [
      "Mattel",
      "Hasbro",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "A 'Flip' card causes?",
    "choices": [
      "All cards in play to flip Light/Dark sides",
      "A reshuffle",
      "End of game",
      "Skip turn only"
    ],
    "correct": 0
  },
  {
    "question": "Wild Draw on Dark Side is?",
    "choices": [
      "Wild Draw Color, makes player draw until match",
      "Same as Light",
      "Removed",
      "Skip"
    ],
    "correct": 0
  },
  {
    "question": "The deck total cards is roughly?",
    "choices": [
      "112 cards",
      "52",
      "78",
      "50"
    ],
    "correct": 0
  },
  {
    "question": "Game ends when?",
    "choices": [
      "A player reaches 500 points (or hand-empty)",
      "After 10 minutes",
      "After 5 rounds",
      "By dice"
    ],
    "correct": 0
  },
  {
    "question": "Light Side keeps mostly?",
    "choices": [
      "Standard UNO color rules",
      "Auction",
      "Trick-taking",
      "Drafting"
    ],
    "correct": 0
  },
  {
    "question": "UNO Flip!'s biggest twist is?",
    "choices": [
      "Single Flip card mid-game",
      "Two decks combined",
      "Solo only",
      "Cooperative"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: UnoFlipQuizSettings): UnoFlipQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: UnoFlipQuizState, action: UnoFlipQuizAction): UnoFlipQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: UnoFlipQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
