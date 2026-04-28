import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ExtremeSportsQuizSettings { questions: "10" | "20" | "30"; }
export interface ExtremeSportsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ExtremeSportsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "BASE jumping stands for?",
    "choices": [
      "Buildings, Antennas, Spans, Earth",
      "Big, Adventurous, Sky, Earth",
      "Ballistic, Aero, Skydive, Earth",
      "None"
    ],
    "correct": 0
  },
  {
    "question": "Alex Honnold famously free-soloed?",
    "choices": [
      "Half Dome",
      "El Capitan",
      "Devils Tower",
      "Smith Rock"
    ],
    "correct": 1
  },
  {
    "question": "Year of the El Capitan free solo?",
    "choices": [
      "2015",
      "2017",
      "2019",
      "2021"
    ],
    "correct": 1
  },
  {
    "question": "Documentary about it?",
    "choices": [
      "Free Solo",
      "Meru",
      "Valley Uprising",
      "Touching the Void"
    ],
    "correct": 0
  },
  {
    "question": "Big-wave surf spot in Portugal?",
    "choices": [
      "Praia do Norte",
      "Mavericks",
      "Jaws",
      "Teahupoo"
    ],
    "correct": 0
  },
  {
    "question": "California big-wave spot?",
    "choices": [
      "Mavericks",
      "Pipeline",
      "Cortes",
      "Cloudbreak"
    ],
    "correct": 0
  },
  {
    "question": "Tony Hawk landed first 900 in?",
    "choices": [
      "1995",
      "1999",
      "2003",
      "2007"
    ],
    "correct": 1
  },
  {
    "question": "X Games started in?",
    "choices": [
      "1992",
      "1995",
      "1999",
      "2002"
    ],
    "correct": 1
  },
  {
    "question": "Wingsuit flying invented (modern) in?",
    "choices": [
      "1960s",
      "1970s",
      "1990s",
      "2010s"
    ],
    "correct": 2
  },
  {
    "question": "Felix Baumgartner stratosphere jump year?",
    "choices": [
      "2008",
      "2010",
      "2012",
      "2014"
    ],
    "correct": 2
  },
  {
    "question": "His altitude (km)?",
    "choices": [
      "~12 km",
      "~24 km",
      "~39 km",
      "~50 km"
    ],
    "correct": 2
  },
  {
    "question": "Highest skydive (held by)?",
    "choices": [
      "Baumgartner",
      "Eustace",
      "Kittinger",
      "Andreev"
    ],
    "correct": 1
  },
  {
    "question": "Banff Mountain Film Festival is in?",
    "choices": [
      "USA",
      "Canada",
      "UK",
      "Italy"
    ],
    "correct": 1
  },
  {
    "question": "Red Bull Rampage is what?",
    "choices": [
      "BMX",
      "MTB",
      "Skate",
      "Surf"
    ],
    "correct": 1
  },
  {
    "question": "Slopestyle is part of which sport?",
    "choices": [
      "Snowboarding",
      "Skiing",
      "Both",
      "Skateboarding"
    ],
    "correct": 2
  },
  {
    "question": "Tonik 'Travis' Pastrana competes in?",
    "choices": [
      "Motocross/rally",
      "Surf",
      "Climb",
      "Sky"
    ],
    "correct": 0
  },
  {
    "question": "Highline involves?",
    "choices": [
      "Tightrope/slackline up high",
      "Wingsuit",
      "Skydive",
      "BASE"
    ],
    "correct": 0
  },
  {
    "question": "Volcano boarding popular in?",
    "choices": [
      "Nicaragua",
      "Iceland",
      "Hawaii",
      "Italy"
    ],
    "correct": 0
  },
  {
    "question": "Free solo means?",
    "choices": [
      "No ropes",
      "No partner",
      "No music",
      "No fees"
    ],
    "correct": 0
  },
  {
    "question": "World's tallest waterfall (canyon spot)?",
    "choices": [
      "Angel Falls",
      "Niagara",
      "Yosemite",
      "Iguazu"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ExtremeSportsQuizSettings): ExtremeSportsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ExtremeSportsQuizState, action: ExtremeSportsQuizAction): ExtremeSportsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ExtremeSportsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
