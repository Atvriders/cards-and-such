import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TonyAwardsQuizSettings { questions: "10" | "20"; }
export interface TonyAwardsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TonyAwardsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Tony Awards started in?",
    "choices": [
      "1937",
      "1947",
      "1957",
      "1967"
    ],
    "correct": 1
  },
  {
    "question": "What art form do they honor?",
    "choices": [
      "Film",
      "TV",
      "Broadway theater",
      "Recording"
    ],
    "correct": 2
  },
  {
    "question": "Antoinette Perry was a?",
    "choices": [
      "Producer/Actress",
      "Composer",
      "Critic",
      "Politician"
    ],
    "correct": 0
  },
  {
    "question": "Most Tony wins for a single show (Best Musical year)?",
    "choices": [
      "The Producers (12)",
      "Hamilton (11)",
      "Hello, Dolly! (10)",
      "Cats (7)"
    ],
    "correct": 0
  },
  {
    "question": "Year 'Hamilton' won Best Musical?",
    "choices": [
      "2014",
      "2015",
      "2016",
      "2017"
    ],
    "correct": 2
  },
  {
    "question": "Most acting Tonys (6) belongs to?",
    "choices": [
      "Bernadette Peters",
      "Audra McDonald",
      "Patti LuPone",
      "Cherry Jones"
    ],
    "correct": 1
  },
  {
    "question": "Tony Awards site since 2011?",
    "choices": [
      "Radio City Music Hall",
      "Beacon Theatre",
      "Lincoln Center",
      "Madison Square Garden"
    ],
    "correct": 0
  },
  {
    "question": "Won Tony, Oscar, Emmy and Grammy = ?",
    "choices": [
      "BIG4",
      "EGOT",
      "TOEG",
      "Quad"
    ],
    "correct": 1
  },
  {
    "question": "Hosted the Tonys 4 times?",
    "choices": [
      "Hugh Jackman",
      "Neil Patrick Harris",
      "James Corden",
      "Both A and B"
    ],
    "correct": 3
  },
  {
    "question": "Year 'Wicked' opened on Broadway?",
    "choices": [
      "2001",
      "2003",
      "2005",
      "2007"
    ],
    "correct": 1
  },
  {
    "question": "Best Play 1993 winner?",
    "choices": [
      "Angels in America",
      "The Sisters Rosensweig",
      "Six Degrees of Separation",
      "Lost in Yonkers"
    ],
    "correct": 0
  },
  {
    "question": "Lin-Manuel Miranda won writing Tonys for?",
    "choices": [
      "In the Heights",
      "Hamilton",
      "Both",
      "Neither"
    ],
    "correct": 2
  },
  {
    "question": "How many Tony categories are competitive (approx)?",
    "choices": [
      "About 12",
      "About 18",
      "About 26",
      "About 40"
    ],
    "correct": 2
  },
  {
    "question": "First Best Musical winner (1949)?",
    "choices": [
      "Kiss Me, Kate",
      "South Pacific",
      "Brigadoon",
      "Annie Get Your Gun"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TonyAwardsQuizSettings): TonyAwardsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TonyAwardsQuizState, action: TonyAwardsQuizAction): TonyAwardsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TonyAwardsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
