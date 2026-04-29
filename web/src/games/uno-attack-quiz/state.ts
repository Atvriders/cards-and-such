import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface UnoAttackQuizSettings { questions: "10"; }
export interface UnoAttackQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type UnoAttackQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "UNO Attack!'s defining gimmick is?",
    "choices": [
      "A battery-powered card launcher",
      "A spinner",
      "A timer only",
      "A board"
    ],
    "correct": 0
  },
  {
    "question": "When a player can't match, they?",
    "choices": [
      "Press the launcher button to risk cards",
      "Skip turn",
      "Discard 2",
      "Trade hand"
    ],
    "correct": 0
  },
  {
    "question": "The launcher might?",
    "choices": [
      "Eject anywhere from 0 to many cards",
      "Always 2",
      "Always 5",
      "Reset deck"
    ],
    "correct": 0
  },
  {
    "question": "UNO Attack! is published by?",
    "choices": [
      "Mattel",
      "Hasbro",
      "Z-Man",
      "Days of Wonder"
    ],
    "correct": 0
  },
  {
    "question": "Special cards include?",
    "choices": [
      "Hit 2, Discard All, Trade Hands",
      "Trump only",
      "Crew only",
      "Spell only"
    ],
    "correct": 0
  },
  {
    "question": "UNO Attack! debuted in?",
    "choices": [
      "1999 (originally as 'Attack!' / 'Extreme')",
      "1880s",
      "2010s",
      "2050s"
    ],
    "correct": 0
  },
  {
    "question": "Player count supports?",
    "choices": [
      "About 2 to 10",
      "Solo",
      "Exactly 4 only",
      "30 minimum"
    ],
    "correct": 0
  },
  {
    "question": "UNO Attack! also known as?",
    "choices": [
      "UNO Extreme in some regions",
      "UNO Lite",
      "UNO Solo",
      "UNO Cards"
    ],
    "correct": 0
  },
  {
    "question": "Game requires?",
    "choices": [
      "AAA batteries for the launcher",
      "Solar cells",
      "Wall plug",
      "No power"
    ],
    "correct": 0
  },
  {
    "question": "Game tone is?",
    "choices": [
      "Chaotic family fun",
      "Tense strategy",
      "Solo logic",
      "Auction"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: UnoAttackQuizSettings): UnoAttackQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: UnoAttackQuizState, action: UnoAttackQuizAction): UnoAttackQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: UnoAttackQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
