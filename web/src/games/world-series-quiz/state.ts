import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WorldSeriesQuizSettings { questions: "10" | "20" | "30"; }
export interface WorldSeriesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WorldSeriesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Most World Series titles by a team?",
    "choices": [
      "Cardinals",
      "Yankees",
      "Red Sox",
      "Dodgers"
    ],
    "correct": 1
  },
  {
    "question": "How many WS rings do the Yankees have?",
    "choices": [
      "25",
      "27",
      "29",
      "31"
    ],
    "correct": 1
  },
  {
    "question": "Cubs ended their drought in?",
    "choices": [
      "2014",
      "2016",
      "2018",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "Red Sox 'Curse of the Bambino' broken in?",
    "choices": [
      "2002",
      "2004",
      "2006",
      "2008"
    ],
    "correct": 1
  },
  {
    "question": "Who hit the walk-off in 1988 WS Game 1?",
    "choices": [
      "Hershiser",
      "Gibson",
      "Strawberry",
      "Davis"
    ],
    "correct": 1
  },
  {
    "question": "2023 WS winner?",
    "choices": [
      "Astros",
      "Phillies",
      "Rangers",
      "Diamondbacks"
    ],
    "correct": 2
  },
  {
    "question": "Babe Ruth's 'Called Shot' was in?",
    "choices": [
      "1928",
      "1932",
      "1936",
      "1941"
    ],
    "correct": 1
  },
  {
    "question": "Bill Mazeroski's WS-winning HR was in?",
    "choices": [
      "1955",
      "1960",
      "1968",
      "1975"
    ],
    "correct": 1
  },
  {
    "question": "Joe Carter walked off WS in?",
    "choices": [
      "1991",
      "1992",
      "1993",
      "1994"
    ],
    "correct": 2
  },
  {
    "question": "Jack Morris pitched 10 inn shutout for Twins in?",
    "choices": [
      "1987",
      "1991",
      "1995",
      "2001"
    ],
    "correct": 1
  },
  {
    "question": "Astros sign-stealing scandal year?",
    "choices": [
      "2015",
      "2017",
      "2019",
      "2021"
    ],
    "correct": 1
  },
  {
    "question": "Sandy Koufax pitched WS shutouts for?",
    "choices": [
      "Dodgers",
      "Giants",
      "Pirates",
      "Cardinals"
    ],
    "correct": 0
  },
  {
    "question": "Reggie Jackson 'Mr. October' team?",
    "choices": [
      "A's",
      "Yankees",
      "Both A's and Yankees",
      "Orioles"
    ],
    "correct": 2
  },
  {
    "question": "Buck Showalter never won WS as which team's manager?",
    "choices": [
      "Yankees",
      "Diamondbacks",
      "Mets",
      "Giants"
    ],
    "correct": 3
  },
  {
    "question": "WS played at Wrigley first happened in?",
    "choices": [
      "1929",
      "1932",
      "1935",
      "1945"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WorldSeriesQuizSettings): WorldSeriesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WorldSeriesQuizState, action: WorldSeriesQuizAction): WorldSeriesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WorldSeriesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
