import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PulitzerQuizSettings { questions: "10" | "20"; }
export interface PulitzerQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PulitzerQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Pulitzer Prize is administered by which university?",
    "choices": [
      "Harvard",
      "Yale",
      "Columbia",
      "Princeton"
    ],
    "correct": 2
  },
  {
    "question": "First Pulitzers given in?",
    "choices": [
      "1907",
      "1917",
      "1927",
      "1937"
    ],
    "correct": 1
  },
  {
    "question": "Joseph Pulitzer was an?",
    "choices": [
      "Author",
      "Publisher",
      "Politician",
      "Inventor"
    ],
    "correct": 1
  },
  {
    "question": "Top journalism honor is the ___ Service medal.",
    "choices": [
      "National",
      "Public",
      "International",
      "Civic"
    ],
    "correct": 1
  },
  {
    "question": "Pulitzer for Fiction (2018) author?",
    "choices": [
      "Andrew Sean Greer",
      "Colson Whitehead",
      "Donna Tartt",
      "Anthony Doerr"
    ],
    "correct": 0
  },
  {
    "question": "'Hamilton' won Pulitzer for?",
    "choices": [
      "Music",
      "Drama",
      "History",
      "Nothing"
    ],
    "correct": 1
  },
  {
    "question": "Kendrick Lamar's Pulitzer-winning album?",
    "choices": [
      "DAMN.",
      "good kid, m.A.A.d city",
      "To Pimp a Butterfly",
      "Section.80"
    ],
    "correct": 0
  },
  {
    "question": "Year DAMN. won Music Pulitzer?",
    "choices": [
      "2017",
      "2018",
      "2019",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "Toni Morrison Fiction win was for?",
    "choices": [
      "Sula",
      "Beloved",
      "Song of Solomon",
      "Jazz"
    ],
    "correct": 1
  },
  {
    "question": "Hemingway won Fiction (1953) for?",
    "choices": [
      "The Old Man and the Sea",
      "For Whom the Bell Tolls",
      "A Farewell to Arms",
      "The Sun Also Rises"
    ],
    "correct": 0
  },
  {
    "question": "Newspaper with most Pulitzers?",
    "choices": [
      "NYT",
      "WaPo",
      "WSJ",
      "LA Times"
    ],
    "correct": 0
  },
  {
    "question": "'Underground Railroad' Fiction winner?",
    "choices": [
      "Colson Whitehead",
      "Jesmyn Ward",
      "Richard Powers",
      "Andrew Sean Greer"
    ],
    "correct": 0
  },
  {
    "question": "Pulitzer Drama 2017 winner?",
    "choices": [
      "Sweat (Lynn Nottage)",
      "Hamilton (held at 2016)",
      "Father Comes Home",
      "Disgraced (2013)"
    ],
    "correct": 0
  },
  {
    "question": "Pulitzer Investigative was won by NYT for?",
    "choices": [
      "Pentagon Papers",
      "Watergate",
      "9/11",
      "Snowden leak"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PulitzerQuizSettings): PulitzerQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PulitzerQuizState, action: PulitzerQuizAction): PulitzerQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PulitzerQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
