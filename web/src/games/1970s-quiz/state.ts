import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen70sQuizSettings { questions: "10" | "15"; }
export interface Nineteen70sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen70sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which scandal led to Nixon's resignation?",
    "choices": [
      "Iran-Contra",
      "Watergate",
      "Whitewater",
      "Lewinsky"
    ],
    "correct": 1
  },
  {
    "question": "When did Nixon resign as President?",
    "choices": [
      "1972",
      "1974",
      "1976",
      "1978"
    ],
    "correct": 1
  },
  {
    "question": "The original Star Wars film was released in?",
    "choices": [
      "1975",
      "1977",
      "1979",
      "1981"
    ],
    "correct": 1
  },
  {
    "question": "Which 1977 film helped launch the disco craze?",
    "choices": [
      "Grease",
      "Saturday Night Fever",
      "Rocky",
      "Annie Hall"
    ],
    "correct": 1
  },
  {
    "question": "The Vietnam War ended in?",
    "choices": [
      "1973",
      "1975",
      "1977",
      "1979"
    ],
    "correct": 1
  },
  {
    "question": "Which band released 'Bohemian Rhapsody' in 1975?",
    "choices": [
      "Led Zeppelin",
      "Queen",
      "The Who",
      "Pink Floyd"
    ],
    "correct": 1
  },
  {
    "question": "The first Apple computer, Apple I, debuted in?",
    "choices": [
      "1974",
      "1976",
      "1978",
      "1980"
    ],
    "correct": 1
  },
  {
    "question": "Pol Pot ruled which country in the 1970s?",
    "choices": [
      "Vietnam",
      "Cambodia",
      "Laos",
      "Thailand"
    ],
    "correct": 1
  },
  {
    "question": "Three Mile Island was a 1979 incident involving?",
    "choices": [
      "Plane crash",
      "Nuclear accident",
      "Oil spill",
      "Earthquake"
    ],
    "correct": 1
  },
  {
    "question": "Which 1972 game became a video game pioneer?",
    "choices": [
      "Asteroids",
      "Space Invaders",
      "Pong",
      "Pac-Man"
    ],
    "correct": 2
  },
  {
    "question": "Margaret Thatcher became UK PM in?",
    "choices": [
      "1975",
      "1977",
      "1979",
      "1981"
    ],
    "correct": 2
  },
  {
    "question": "Which 1976 boxing film won Best Picture Oscar?",
    "choices": [
      "Rocky",
      "Network",
      "Taxi Driver",
      "All the President's Men"
    ],
    "correct": 0
  },
  {
    "question": "The Iran Hostage Crisis began in?",
    "choices": [
      "1977",
      "1979",
      "1981",
      "1983"
    ],
    "correct": 1
  },
  {
    "question": "Punk band Sex Pistols' lead singer was?",
    "choices": [
      "Sid Vicious",
      "Johnny Rotten",
      "Joe Strummer",
      "Iggy Pop"
    ],
    "correct": 1
  },
  {
    "question": "Steve Jobs and Steve Wozniak founded Apple in?",
    "choices": [
      "1974",
      "1976",
      "1978",
      "1980"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen70sQuizSettings): Nineteen70sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen70sQuizState, action: Nineteen70sQuizAction): Nineteen70sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen70sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
