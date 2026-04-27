import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TwentyTensQuizSettings { questions: "10" | "15"; }
export interface TwentyTensQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TwentyTensQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Instagram was founded in?",
    "choices": [
      "2008",
      "2010",
      "2012",
      "2014"
    ],
    "correct": 1
  },
  {
    "question": "Which 2012 film began Marvel's team-up era?",
    "choices": [
      "Iron Man",
      "Thor",
      "The Avengers",
      "Captain America"
    ],
    "correct": 2
  },
  {
    "question": "Bitcoin was created (whitepaper) by?",
    "choices": [
      "Vitalik Buterin",
      "Satoshi Nakamoto",
      "Charlie Lee",
      "Roger Ver"
    ],
    "correct": 1
  },
  {
    "question": "Trump was elected President in?",
    "choices": [
      "2014",
      "2016",
      "2018",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "TikTok launched globally in?",
    "choices": [
      "2014",
      "2016",
      "2018",
      "2020"
    ],
    "correct": 2
  },
  {
    "question": "Which streaming series featured a girl named Eleven?",
    "choices": [
      "Stranger Things",
      "The OA",
      "Black Mirror",
      "Dark"
    ],
    "correct": 0
  },
  {
    "question": "Brexit referendum took place in?",
    "choices": [
      "2014",
      "2016",
      "2018",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "Which Marvel film concluded the Infinity Saga in 2019?",
    "choices": [
      "Avengers Infinity War",
      "Avengers Endgame",
      "Far From Home",
      "Black Widow"
    ],
    "correct": 1
  },
  {
    "question": "Greta Thunberg is famous for activism on?",
    "choices": [
      "Civil rights",
      "Climate change",
      "Gun control",
      "Animal rights"
    ],
    "correct": 1
  },
  {
    "question": "Which K-pop group's 'Gangnam Style' went viral in 2012?",
    "choices": [
      "BTS",
      "Psy",
      "Big Bang",
      "EXO"
    ],
    "correct": 1
  },
  {
    "question": "Which 2017 horror film by Jordan Peele won an Oscar?",
    "choices": [
      "Us",
      "Get Out",
      "Hereditary",
      "It"
    ],
    "correct": 1
  },
  {
    "question": "The Hubble Space Telescope's successor is the?",
    "choices": [
      "Spitzer",
      "Kepler",
      "James Webb",
      "Chandra"
    ],
    "correct": 2
  },
  {
    "question": "Which 2014 ALS fundraising challenge went viral?",
    "choices": [
      "Mannequin Challenge",
      "Ice Bucket Challenge",
      "Cinnamon Challenge",
      "Kiki Challenge"
    ],
    "correct": 1
  },
  {
    "question": "Which app launched in 2011 with disappearing photos?",
    "choices": [
      "Instagram",
      "Snapchat",
      "WhatsApp",
      "Vine"
    ],
    "correct": 1
  },
  {
    "question": "The Black Panther film starred?",
    "choices": [
      "Will Smith",
      "Chadwick Boseman",
      "Idris Elba",
      "Michael B. Jordan"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TwentyTensQuizSettings): TwentyTensQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TwentyTensQuizState, action: TwentyTensQuizAction): TwentyTensQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TwentyTensQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
