import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BonnieClydeQuizSettings { questions: "10" | "20"; }
export interface BonnieClydeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BonnieClydeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Bonnie Parker's first name was?",
    "choices": [
      "Bonnie",
      "Bertha",
      "Beatrice",
      "Barbara"
    ],
    "correct": 0
  },
  {
    "question": "What state were Bonnie and Clyde from?",
    "choices": [
      "Oklahoma",
      "Texas",
      "Arkansas",
      "Louisiana"
    ],
    "correct": 1
  },
  {
    "question": "What year were they killed?",
    "choices": [
      "1929",
      "1932",
      "1934",
      "1936"
    ],
    "correct": 2
  },
  {
    "question": "Where were they ambushed?",
    "choices": [
      "Texas",
      "Oklahoma",
      "Louisiana",
      "Arkansas"
    ],
    "correct": 2
  },
  {
    "question": "Famed Texas Ranger who led the manhunt?",
    "choices": [
      "Frank Hamer",
      "Pat Garrett",
      "Bass Reeves",
      "Bill Tilghman"
    ],
    "correct": 0
  },
  {
    "question": "Clyde's elder brother in the gang was?",
    "choices": [
      "Buck",
      "Bill",
      "Bob",
      "Ben"
    ],
    "correct": 0
  },
  {
    "question": "What 1967 film glamorized them?",
    "choices": [
      "Public Enemy",
      "Bonnie and Clyde",
      "The Untouchables",
      "Dillinger"
    ],
    "correct": 1
  },
  {
    "question": "Who played Bonnie in that film?",
    "choices": [
      "Faye Dunaway",
      "Jane Fonda",
      "Mia Farrow",
      "Julie Christie"
    ],
    "correct": 0
  },
  {
    "question": "Who played Clyde in that film?",
    "choices": [
      "Steve McQueen",
      "Warren Beatty",
      "Paul Newman",
      "Robert Redford"
    ],
    "correct": 1
  },
  {
    "question": "Vehicle they died in?",
    "choices": [
      "Ford V-8",
      "Studebaker",
      "Chrysler Imperial",
      "Packard"
    ],
    "correct": 0
  },
  {
    "question": "Buck Barrow's wife in the gang?",
    "choices": [
      "Blanche",
      "Ruth",
      "Maud",
      "Eve"
    ],
    "correct": 0
  },
  {
    "question": "Era they operated in?",
    "choices": [
      "Roaring '20s",
      "Great Depression",
      "Postwar boom",
      "Prohibition only"
    ],
    "correct": 1
  },
  {
    "question": "Clyde escaped from which Texas prison farm?",
    "choices": [
      "Eastham",
      "Huntsville",
      "Wynne",
      "Ramsey"
    ],
    "correct": 0
  },
  {
    "question": "What weapon was Clyde fond of?",
    "choices": [
      "BAR (Browning Automatic Rifle)",
      "Colt Single Action",
      "Tommy Gun",
      "Lever-action rifle"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BonnieClydeQuizSettings): BonnieClydeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BonnieClydeQuizState, action: BonnieClydeQuizAction): BonnieClydeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BonnieClydeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
