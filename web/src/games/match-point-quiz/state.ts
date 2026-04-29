import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MatchPointQuizSettings { questions: "10"; }
export interface MatchPointQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MatchPointQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Match Point uses what kind of scoring?",
    "choices": [
      "Tennis-style 15/30/40/deuce",
      "Cribbage pegs",
      "Poker chips",
      "Dollars"
    ],
    "correct": 0
  },
  {
    "question": "The point of Match Point is to?",
    "choices": [
      "Spot a matching pair faster than opponents",
      "Bid",
      "Memorise long sequences",
      "Trick-take"
    ],
    "correct": 0
  },
  {
    "question": "Recommended player count is?",
    "choices": [
      "About 2 to 4",
      "Solo",
      "20 minimum",
      "Exactly 8"
    ],
    "correct": 0
  },
  {
    "question": "A 'point' is awarded when?",
    "choices": [
      "A player calls a valid match first",
      "Highest die",
      "Auction won",
      "Cards drawn"
    ],
    "correct": 0
  },
  {
    "question": "After 40-40 the term used is?",
    "choices": [
      "Deuce",
      "Bingo",
      "Royal",
      "Bust"
    ],
    "correct": 0
  },
  {
    "question": "Cards typically have?",
    "choices": [
      "Picture or pattern faces to match",
      "Numbers only",
      "Suits only",
      "Trump"
    ],
    "correct": 0
  },
  {
    "question": "Game length is roughly?",
    "choices": [
      "About 15 minutes per match",
      "All day",
      "Under 1 second",
      "Several hours"
    ],
    "correct": 0
  },
  {
    "question": "Match Point's tone is?",
    "choices": [
      "Quick, observant, social",
      "Long heavy strategy",
      "Solo grind",
      "Auction"
    ],
    "correct": 0
  },
  {
    "question": "Match-format rounds are called?",
    "choices": [
      "Games and sets, like tennis",
      "Rounds and turns",
      "Hands and tricks",
      "Rolls and casts"
    ],
    "correct": 0
  },
  {
    "question": "Match Point rewards which skill most?",
    "choices": [
      "Speedy visual pattern recognition",
      "Math",
      "Negotiation",
      "Memorising trump"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: MatchPointQuizSettings): MatchPointQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MatchPointQuizState, action: MatchPointQuizAction): MatchPointQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MatchPointQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
