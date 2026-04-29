import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrivialPursuitStarwarsQuizSettings { questions: "10"; }
export interface TrivialPursuitStarwarsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrivialPursuitStarwarsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Star Wars: A New Hope released in which year?",
    "choices": [
      "1975",
      "1977",
      "1980",
      "1983"
    ],
    "correct": 1
  },
  {
    "question": "The original Star Wars trilogy was directed (chiefly) by?",
    "choices": [
      "George Lucas",
      "Steven Spielberg",
      "Irvin Kershner",
      "Various"
    ],
    "correct": 3
  },
  {
    "question": "Yoda's species name is?",
    "choices": [
      "Yoda",
      "Officially unknown",
      "Frog-folk",
      "Ewok"
    ],
    "correct": 1
  },
  {
    "question": "Death Star plans were stolen by which group?",
    "choices": [
      "Rogue One",
      "Phoenix Squadron",
      "Wraith Squadron",
      "Fett's Bounty"
    ],
    "correct": 0
  },
  {
    "question": "Han Solo's ship is the?",
    "choices": [
      "X-Wing",
      "Millennium Falcon",
      "Slave I",
      "Tantive IV"
    ],
    "correct": 1
  },
  {
    "question": "Lightsaber crystals are called?",
    "choices": [
      "Krystal",
      "Kyber",
      "Dilithium",
      "Cortosis"
    ],
    "correct": 1
  },
  {
    "question": "'I am your father' is said by?",
    "choices": [
      "Obi-Wan",
      "Vader",
      "Palpatine",
      "Yoda"
    ],
    "correct": 1
  },
  {
    "question": "Boba Fett's father is?",
    "choices": [
      "Boba's brother",
      "Jango Fett",
      "Cad Bane",
      "Palpatine"
    ],
    "correct": 1
  },
  {
    "question": "The Force Awakens released in?",
    "choices": [
      "2014",
      "2015",
      "2017",
      "2019"
    ],
    "correct": 1
  },
  {
    "question": "Mandalorians belong to which planet?",
    "choices": [
      "Mandalore",
      "Tatooine",
      "Coruscant",
      "Naboo"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TrivialPursuitStarwarsQuizSettings): TrivialPursuitStarwarsQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrivialPursuitStarwarsQuizState, action: TrivialPursuitStarwarsQuizAction): TrivialPursuitStarwarsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrivialPursuitStarwarsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
