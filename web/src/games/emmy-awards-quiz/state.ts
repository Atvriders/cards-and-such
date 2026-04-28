import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EmmyAwardsQuizSettings { questions: "10" | "20"; }
export interface EmmyAwardsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EmmyAwardsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First Emmy Awards were held in?",
    "choices": [
      "1939",
      "1949",
      "1959",
      "1969"
    ],
    "correct": 1
  },
  {
    "question": "Primetime Emmys honor?",
    "choices": [
      "Film",
      "TV",
      "Theater",
      "Music"
    ],
    "correct": 1
  },
  {
    "question": "The body running them is the?",
    "choices": [
      "Television Academy",
      "Hollywood Foreign Press",
      "Recording Academy",
      "Producers Guild"
    ],
    "correct": 0
  },
  {
    "question": "Drama with most Emmy wins (overall)?",
    "choices": [
      "Hill Street Blues",
      "West Wing",
      "Game of Thrones",
      "Both A and C tie at the high end"
    ],
    "correct": 2
  },
  {
    "question": "Most consecutive Best Comedy Series wins?",
    "choices": [
      "Modern Family (5)",
      "Frasier (5)",
      "Cheers (4)",
      "Veep (3)"
    ],
    "correct": 0
  },
  {
    "question": "Most acting Emmys held by a comedic actress?",
    "choices": [
      "Julia Louis-Dreyfus",
      "Lucille Ball",
      "Mary Tyler Moore",
      "Tina Fey"
    ],
    "correct": 0
  },
  {
    "question": "Game of Thrones won Best Drama how many times?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 2
  },
  {
    "question": "Succession won Best Drama in?",
    "choices": [
      "2018",
      "2020",
      "2022",
      "Both 2020 and 2022"
    ],
    "correct": 3
  },
  {
    "question": "Daytime Emmys focus on?",
    "choices": [
      "Soaps & talk",
      "Late night",
      "Sports",
      "Children's only"
    ],
    "correct": 0
  },
  {
    "question": "First show with 6 'big-five' Comedy wins (now 3 wins)?",
    "choices": [
      "The Mary Tyler Moore Show",
      "All in the Family",
      "Frasier",
      "Schitt's Creek (the only one to sweep big 7)"
    ],
    "correct": 3
  },
  {
    "question": "Emmy statuette features?",
    "choices": [
      "Atlas",
      "Angel/winged figure with atom",
      "Lyra",
      "Glob"
    ],
    "correct": 1
  },
  {
    "question": "First major streamer Best Comedy win?",
    "choices": [
      "Transparent (Amazon, 2015 Best Comedy was Veep)",
      "The Marvelous Mrs Maisel",
      "Schitt's Creek",
      "Ted Lasso"
    ],
    "correct": 1
  },
  {
    "question": "'Game of Thrones' final-season Best Drama year?",
    "choices": [
      "2018",
      "2019",
      "2020",
      "2021"
    ],
    "correct": 1
  },
  {
    "question": "Cloris Leachman holds 8 Emmys across?",
    "choices": [
      "Drama",
      "Comedy + variety",
      "Across many categories",
      "Reality"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EmmyAwardsQuizSettings): EmmyAwardsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EmmyAwardsQuizState, action: EmmyAwardsQuizAction): EmmyAwardsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EmmyAwardsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
