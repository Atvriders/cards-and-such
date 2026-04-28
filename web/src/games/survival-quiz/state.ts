import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SurvivalQuizSettings { questions: "10" | "20" | "30"; }
export interface SurvivalQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SurvivalQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Rule of Threes — survive without air?",
    "choices": [
      "3 sec",
      "3 min",
      "3 hours",
      "3 days"
    ],
    "correct": 1
  },
  {
    "question": "Survive without shelter (extreme)?",
    "choices": [
      "3 min",
      "3 hours",
      "3 days",
      "3 weeks"
    ],
    "correct": 1
  },
  {
    "question": "Survive without water?",
    "choices": [
      "3 min",
      "3 hours",
      "3 days",
      "3 weeks"
    ],
    "correct": 2
  },
  {
    "question": "Survive without food?",
    "choices": [
      "3 days",
      "3 weeks",
      "3 months",
      "3 years"
    ],
    "correct": 1
  },
  {
    "question": "First survival priority typically?",
    "choices": [
      "Food",
      "Shelter",
      "Water",
      "Tools"
    ],
    "correct": 1
  },
  {
    "question": "Best signal mirror practice?",
    "choices": [
      "Use sun reflection",
      "Wave",
      "Shout",
      "Build small fire"
    ],
    "correct": 0
  },
  {
    "question": "Three fires for distress?",
    "choices": [
      "Yes",
      "No",
      "Two",
      "Four"
    ],
    "correct": 0
  },
  {
    "question": "SOS in Morse?",
    "choices": [
      "... --- ...",
      "--- ... ---",
      "... ... ...",
      "--- --- ---"
    ],
    "correct": 0
  },
  {
    "question": "Hypothermia core temp drops below?",
    "choices": [
      "100°F",
      "98°F",
      "95°F",
      "85°F"
    ],
    "correct": 2
  },
  {
    "question": "Best treatment for hypothermia?",
    "choices": [
      "Hot bath",
      "Slow rewarming",
      "Alcohol",
      "Caffeine"
    ],
    "correct": 1
  },
  {
    "question": "How long to boil water for safety?",
    "choices": [
      "10 sec",
      "1 min",
      "1+ minute (3 min if high alt)",
      "1 hour"
    ],
    "correct": 2
  },
  {
    "question": "Edible plant rule?",
    "choices": [
      "Universal Edibility Test",
      "Never test",
      "All berries OK",
      "All nuts OK"
    ],
    "correct": 0
  },
  {
    "question": "Polaris helps you find?",
    "choices": [
      "South",
      "North",
      "East",
      "West"
    ],
    "correct": 1
  },
  {
    "question": "Bow drill is for?",
    "choices": [
      "Hunting",
      "Fire making",
      "Tool making",
      "Cooking"
    ],
    "correct": 1
  },
  {
    "question": "Ferro rod creates?",
    "choices": [
      "Sparks",
      "Smoke",
      "Flame",
      "Heat only"
    ],
    "correct": 0
  },
  {
    "question": "Best knot for a loop?",
    "choices": [
      "Bowline",
      "Square",
      "Half hitch",
      "Granny"
    ],
    "correct": 0
  },
  {
    "question": "Most lost hikers should?",
    "choices": [
      "Stay put",
      "Walk downhill",
      "Walk up",
      "Run"
    ],
    "correct": 0
  },
  {
    "question": "STOP acronym means?",
    "choices": [
      "Stop, Think, Observe, Plan",
      "Stay, Think, Order, Persist",
      "Sit, Talk, Open, Persist",
      "None"
    ],
    "correct": 0
  },
  {
    "question": "Bear Grylls' show title?",
    "choices": [
      "Man vs Wild",
      "Survivorman",
      "Naked & Afraid",
      "Alone"
    ],
    "correct": 0
  },
  {
    "question": "Survival show 'Alone' contestants are?",
    "choices": [
      "Solo",
      "Paired",
      "In groups",
      "Coached daily"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SurvivalQuizSettings): SurvivalQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SurvivalQuizState, action: SurvivalQuizAction): SurvivalQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SurvivalQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
