import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpoonsCardQuizSettings { questions: "10"; }
export interface SpoonsCardQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpoonsCardQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Number of spoons used is?",
    "choices": [
      "One fewer than the number of players",
      "Same as players",
      "Always 5",
      "Always 1"
    ],
    "correct": 0
  },
  {
    "question": "Goal is to collect?",
    "choices": [
      "Four of a kind from passed cards",
      "Five of a kind",
      "A flush",
      "Most cards"
    ],
    "correct": 0
  },
  {
    "question": "When a player has 4 of a kind they?",
    "choices": [
      "Quietly grab a spoon to start the scramble",
      "Yell loudly",
      "Show their hand",
      "Skip turn"
    ],
    "correct": 0
  },
  {
    "question": "The standard penalty is?",
    "choices": [
      "A letter spelling S-P-O-O-N-S",
      "Lose all chips",
      "Skip 3 turns",
      "Steal opponent pile"
    ],
    "correct": 0
  },
  {
    "question": "A player is eliminated when they?",
    "choices": [
      "Spell the full word S-P-O-O-N-S",
      "Lose all coins",
      "Run out of cards",
      "Touch the wrong spoon"
    ],
    "correct": 0
  },
  {
    "question": "Spoons is best with how many players?",
    "choices": [
      "3 to 13",
      "Solo only",
      "20 minimum",
      "Always 6"
    ],
    "correct": 0
  },
  {
    "question": "The 'Pig' variant has players?",
    "choices": [
      "Touch their nose instead of grab a spoon",
      "Eat a card",
      "Take a chip",
      "Yell 'Pig!'"
    ],
    "correct": 0
  },
  {
    "question": "Spoons uses what kind of deck?",
    "choices": [
      "A standard 52-card deck",
      "Tarot 78-card",
      "Spot It",
      "UNO"
    ],
    "correct": 0
  },
  {
    "question": "Cards are passed?",
    "choices": [
      "One at a time around the table",
      "All at once",
      "By auction",
      "By trick"
    ],
    "correct": 0
  },
  {
    "question": "Game tone?",
    "choices": [
      "Frantic family slap-grab fun",
      "Heavy strategy",
      "Solo logic",
      "Adult horror"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SpoonsCardQuizSettings): SpoonsCardQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpoonsCardQuizState, action: SpoonsCardQuizAction): SpoonsCardQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpoonsCardQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
