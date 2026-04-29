import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CharadesClassicQuizSettings { questions: "10"; }
export interface CharadesClassicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CharadesClassicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Charades players communicate by?",
    "choices": [
      "Silent miming only",
      "Whispering",
      "Drawing pictures",
      "Reading aloud"
    ],
    "correct": 0
  },
  {
    "question": "The signal for 'movie title' often is?",
    "choices": [
      "Cranking an old film camera",
      "Holding up a book",
      "Flapping arms",
      "Sitting down"
    ],
    "correct": 0
  },
  {
    "question": "The signal for 'book title' often is?",
    "choices": [
      "Hands palm-out, opened like pages",
      "Snapping fingers",
      "Pointing up",
      "Hopping"
    ],
    "correct": 0
  },
  {
    "question": "Number of syllables is shown by?",
    "choices": [
      "Tapping that many fingers on the forearm",
      "Stomping feet",
      "Sticking out tongue",
      "Waving"
    ],
    "correct": 0
  },
  {
    "question": "'Sounds like' is signalled by?",
    "choices": [
      "Tugging the earlobe",
      "Shrugging",
      "Closing eyes",
      "Touching nose"
    ],
    "correct": 0
  },
  {
    "question": "'The whole concept' is signalled by?",
    "choices": [
      "Sweeping arms in a wide circle",
      "Crossing arms",
      "Pointing down",
      "Snapping"
    ],
    "correct": 0
  },
  {
    "question": "Charades has roots in?",
    "choices": [
      "18th-century French parlour games",
      "Ancient Egypt",
      "Modern Japan",
      "1990s America"
    ],
    "correct": 0
  },
  {
    "question": "A typical Charades round timer is?",
    "choices": [
      "About a minute or two",
      "30 seconds flat",
      "Ten minutes",
      "No timer ever"
    ],
    "correct": 0
  },
  {
    "question": "Charades is best with?",
    "choices": [
      "Two or more teams",
      "Solo only",
      "Exactly two players",
      "A judge alone"
    ],
    "correct": 0
  },
  {
    "question": "Charades' mood is best described as?",
    "choices": [
      "Goofy team-spirited fun",
      "Strategic auction",
      "Math drill",
      "Silent puzzle solo"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CharadesClassicQuizSettings): CharadesClassicQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CharadesClassicQuizState, action: CharadesClassicQuizAction): CharadesClassicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CharadesClassicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
