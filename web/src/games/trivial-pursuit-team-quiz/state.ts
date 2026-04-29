import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrivialPursuitTeamQuizSettings { questions: "10"; }
export interface TrivialPursuitTeamQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrivialPursuitTeamQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Trivial Pursuit Team uses how many teams?",
    "choices": [
      "One",
      "Two",
      "Three",
      "Four"
    ],
    "correct": 1
  },
  {
    "question": "Team mode allows what unique action?",
    "choices": [
      "Solo answers only",
      "Collaborative answer per question",
      "Auction questions",
      "Coin flips"
    ],
    "correct": 1
  },
  {
    "question": "How does scoring work in TP Team?",
    "choices": [
      "First wedge to finish wins for team",
      "Highest single score",
      "Points by category cards",
      "Shooting bonus"
    ],
    "correct": 0
  },
  {
    "question": "How is a tie typically broken in TP Team?",
    "choices": [
      "Sudden-death question",
      "Coin flip",
      "Most categories",
      "Time bonus"
    ],
    "correct": 0
  },
  {
    "question": "Each turn alternates between which?",
    "choices": [
      "Players",
      "Teams",
      "Categories",
      "Boards"
    ],
    "correct": 1
  },
  {
    "question": "Trivial Pursuit's parent owner today is?",
    "choices": [
      "Hasbro",
      "Mattel",
      "Spin Master",
      "Ravensburger"
    ],
    "correct": 0
  },
  {
    "question": "Trivial Pursuit's pie wedges represent?",
    "choices": [
      "Categories collected",
      "Money",
      "Time bonuses",
      "Map regions"
    ],
    "correct": 0
  },
  {
    "question": "Team mode encourages?",
    "choices": [
      "Solo grinding",
      "Cooperative discussion",
      "Bluffing only",
      "Bidding"
    ],
    "correct": 1
  },
  {
    "question": "A standard TP game uses how many trivia categories?",
    "choices": [
      "4",
      "5",
      "6",
      "7"
    ],
    "correct": 2
  },
  {
    "question": "Trivial Pursuit Team is recommended for?",
    "choices": [
      "1 player",
      "2 players only",
      "4 to 12 players in teams",
      "20+ only"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TrivialPursuitTeamQuizSettings): TrivialPursuitTeamQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrivialPursuitTeamQuizState, action: TrivialPursuitTeamQuizAction): TrivialPursuitTeamQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrivialPursuitTeamQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
