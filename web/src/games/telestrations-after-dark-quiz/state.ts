import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TelestrationsAfterDarkQuizSettings { questions: "10"; }
export interface TelestrationsAfterDarkQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TelestrationsAfterDarkQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Telestrations After Dark is intended for which audience?",
    "choices": [
      "Kids 6+",
      "All ages",
      "Adults",
      "Toddlers"
    ],
    "correct": 2
  },
  {
    "question": "Telestrations After Dark's prompts are described as?",
    "choices": [
      "Bland",
      "Adult/raunchy",
      "Math heavy",
      "Geography only"
    ],
    "correct": 1
  },
  {
    "question": "How does Telestrations gameplay flow?",
    "choices": [
      "Vote and judge",
      "Draw then guess alternates",
      "Auction cards",
      "Trick taking"
    ],
    "correct": 1
  },
  {
    "question": "Telestrations is sometimes called?",
    "choices": [
      "Sketch trivia",
      "Drawing telephone",
      "Pasture poker",
      "Doodle dice"
    ],
    "correct": 1
  },
  {
    "question": "After Dark recommends how many players?",
    "choices": [
      "1",
      "2",
      "4-8",
      "12-20"
    ],
    "correct": 2
  },
  {
    "question": "Telestrations was published by which company?",
    "choices": [
      "USAopoly",
      "The Op",
      "Hasbro",
      "Mattel"
    ],
    "correct": 1
  },
  {
    "question": "Each player passes the sketchbook in which direction?",
    "choices": [
      "Across the table",
      "Around the circle",
      "To judge only",
      "To opponent only"
    ],
    "correct": 1
  },
  {
    "question": "The funniest results come from which mechanic?",
    "choices": [
      "Cumulative misinterpretation",
      "Strategy",
      "Math errors",
      "Memorization"
    ],
    "correct": 0
  },
  {
    "question": "Telestrations uses what writing tools?",
    "choices": [
      "Charcoal",
      "Dry-erase markers",
      "Crayons only",
      "Brushes"
    ],
    "correct": 1
  },
  {
    "question": "After Dark differs from base Telestrations in what way?",
    "choices": [
      "More cards/prompts only",
      "Adult-themed prompt cards",
      "No drawing",
      "Team play only"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TelestrationsAfterDarkQuizSettings): TelestrationsAfterDarkQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TelestrationsAfterDarkQuizState, action: TelestrationsAfterDarkQuizAction): TelestrationsAfterDarkQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TelestrationsAfterDarkQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
