import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StanleyCupQuizSettings { questions: "10" | "20" | "30"; }
export interface StanleyCupQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StanleyCupQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Most Stanley Cup titles by a team?",
    "choices": [
      "Red Wings",
      "Maple Leafs",
      "Canadiens",
      "Bruins"
    ],
    "correct": 2
  },
  {
    "question": "How many Cups have Canadiens won?",
    "choices": [
      "20",
      "22",
      "24",
      "26"
    ],
    "correct": 2
  },
  {
    "question": "Wayne Gretzky won most of his Cups with?",
    "choices": [
      "Kings",
      "Oilers",
      "Rangers",
      "Blues"
    ],
    "correct": 1
  },
  {
    "question": "Who won Stanley Cup in 2024?",
    "choices": [
      "Panthers",
      "Oilers",
      "Stars",
      "Rangers"
    ],
    "correct": 0
  },
  {
    "question": "Mario Lemieux played for?",
    "choices": [
      "Canadiens",
      "Penguins",
      "Bruins",
      "Flyers"
    ],
    "correct": 1
  },
  {
    "question": "Most Conn Smythe MVPs?",
    "choices": [
      "Howe",
      "Gretzky",
      "Crosby",
      "Lemieux"
    ],
    "correct": 1
  },
  {
    "question": "Bobby Orr's flying-goal Cup year?",
    "choices": [
      "1968",
      "1970",
      "1972",
      "1974"
    ],
    "correct": 1
  },
  {
    "question": "Islanders dynasty won how many straight Cups?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "question": "Patrick Roy played goalie for?",
    "choices": [
      "Habs/Avalanche",
      "Habs only",
      "Avalanche only",
      "Bruins"
    ],
    "correct": 0
  },
  {
    "question": "NHL began awarding Stanley Cup in?",
    "choices": [
      "1893",
      "1917",
      "1926",
      "1942"
    ],
    "correct": 0
  },
  {
    "question": "Who is the 'Great One'?",
    "choices": [
      "Lemieux",
      "Gretzky",
      "Howe",
      "Crosby"
    ],
    "correct": 1
  },
  {
    "question": "Sidney Crosby plays for?",
    "choices": [
      "Penguins",
      "Oilers",
      "Capitals",
      "Rangers"
    ],
    "correct": 0
  },
  {
    "question": "Auston Matthews drafted by?",
    "choices": [
      "Maple Leafs",
      "Coyotes",
      "Sabres",
      "Senators"
    ],
    "correct": 0
  },
  {
    "question": "Tampa Bay Lightning won back-to-back in?",
    "choices": [
      "2017-18",
      "2019-20",
      "2020-21",
      "2021-22"
    ],
    "correct": 2
  },
  {
    "question": "Gordie Howe spent most career with?",
    "choices": [
      "Red Wings",
      "Whalers",
      "Bruins",
      "Blackhawks"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StanleyCupQuizSettings): StanleyCupQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StanleyCupQuizState, action: StanleyCupQuizAction): StanleyCupQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StanleyCupQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
