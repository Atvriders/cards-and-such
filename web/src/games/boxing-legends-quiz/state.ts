import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BoxingLegendsQuizSettings { questions: "10" | "20" | "30"; }
export interface BoxingLegendsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BoxingLegendsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who is 'The Greatest'?",
    "choices": [
      "Muhammad Ali",
      "Mike Tyson",
      "Sugar Ray Leonard",
      "Joe Frazier"
    ],
    "correct": 0
  },
  {
    "question": "Muhammad Ali was born as?",
    "choices": [
      "Cassius Clay",
      "Walker Smith",
      "Joe Louis Barrow",
      "Rocky Marciano"
    ],
    "correct": 0
  },
  {
    "question": "Rocky Marciano retired with what record?",
    "choices": [
      "49-0",
      "50-0",
      "48-1",
      "47-2"
    ],
    "correct": 0
  },
  {
    "question": "Floyd Mayweather Jr. retired with what record?",
    "choices": [
      "50-0",
      "49-0",
      "51-0",
      "48-0"
    ],
    "correct": 0
  },
  {
    "question": "Mike Tyson became the youngest heavyweight champ at age?",
    "choices": [
      "20",
      "21",
      "22",
      "19"
    ],
    "correct": 0
  },
  {
    "question": "Joe Louis was nicknamed?",
    "choices": [
      "Brown Bomber",
      "Iron Mike",
      "Sugar Ray",
      "The Greatest"
    ],
    "correct": 0
  },
  {
    "question": "How long did Joe Louis hold the heavyweight title?",
    "choices": [
      "~12 years",
      "~5 years",
      "~8 years",
      "~10 years"
    ],
    "correct": 0
  },
  {
    "question": "Sugar Ray Robinson is widely considered?",
    "choices": [
      "Pound-for-pound greatest",
      "Heaviest puncher",
      "Best showman",
      "Best chinned"
    ],
    "correct": 0
  },
  {
    "question": "The 'Rumble in the Jungle' was Ali vs?",
    "choices": [
      "Foreman",
      "Frazier",
      "Liston",
      "Norton"
    ],
    "correct": 0
  },
  {
    "question": "Where was the 'Rumble in the Jungle'?",
    "choices": [
      "Zaire",
      "Manila",
      "New Orleans",
      "Las Vegas"
    ],
    "correct": 0
  },
  {
    "question": "The 'Thrilla in Manila' was Ali vs?",
    "choices": [
      "Frazier",
      "Foreman",
      "Spinks",
      "Norton"
    ],
    "correct": 0
  },
  {
    "question": "Roberto Duran's nickname?",
    "choices": [
      "Hands of Stone",
      "Iron Fist",
      "Stone Hands",
      "Rock Hands"
    ],
    "correct": 0
  },
  {
    "question": "Sugar Ray Leonard fought multiple weight classes including?",
    "choices": [
      "Welterweight to Light heavyweight",
      "Featherweight only",
      "Heavyweight only",
      "Bantamweight only"
    ],
    "correct": 0
  },
  {
    "question": "Marvin Hagler reigned at?",
    "choices": [
      "Middleweight",
      "Welterweight",
      "Light heavy",
      "Heavy"
    ],
    "correct": 0
  },
  {
    "question": "Tommy Hearns was known as?",
    "choices": [
      "The Hitman",
      "The Heat",
      "The Hammer",
      "Iron Tom"
    ],
    "correct": 0
  },
  {
    "question": "Manny Pacquiao is from?",
    "choices": [
      "Philippines",
      "Mexico",
      "Thailand",
      "Indonesia"
    ],
    "correct": 0
  },
  {
    "question": "Pacquiao is famous for winning titles in how many divisions?",
    "choices": [
      "5",
      "8",
      "6",
      "7"
    ],
    "correct": 1
  },
  {
    "question": "Oscar De La Hoya's nickname?",
    "choices": [
      "Golden Boy",
      "Golden Glove",
      "Golden Hand",
      "Golden Star"
    ],
    "correct": 0
  },
  {
    "question": "Lennox Lewis won the lineal heavyweight title in?",
    "choices": [
      "1999",
      "2001",
      "1997",
      "2003"
    ],
    "correct": 0
  },
  {
    "question": "Who was the first boxer to win heavyweight titles in 3 separate reigns?",
    "choices": [
      "Muhammad Ali",
      "Evander Holyfield",
      "Lennox Lewis",
      "Joe Louis"
    ],
    "correct": 0
  },
  {
    "question": "Tyson Fury fights as?",
    "choices": [
      "Heavyweight",
      "Cruiserweight",
      "Light heavyweight",
      "Middleweight"
    ],
    "correct": 0
  },
  {
    "question": "Jack Dempsey was active in which decade primarily?",
    "choices": [
      "1920s",
      "1930s",
      "1940s",
      "1950s"
    ],
    "correct": 0
  },
  {
    "question": "Jack Johnson was the first?",
    "choices": [
      "Black heavyweight champion",
      "White heavyweight champion",
      "WBA champion",
      "Olympic boxer"
    ],
    "correct": 0
  },
  {
    "question": "Julio Cesar Chavez is from?",
    "choices": [
      "Mexico",
      "Cuba",
      "Spain",
      "USA"
    ],
    "correct": 0
  },
  {
    "question": "Roy Jones Jr. was famous in which weight classes?",
    "choices": [
      "Middleweight to Heavyweight",
      "Featherweight only",
      "Bantam only",
      "Light only"
    ],
    "correct": 0
  },
  {
    "question": "Bernard Hopkins is famed for?",
    "choices": [
      "Longevity at top",
      "Punching power only",
      "Being knocked out",
      "Being a one-fight wonder"
    ],
    "correct": 0
  },
  {
    "question": "Floyd Patterson was the first to do what?",
    "choices": [
      "Regain heavyweight title",
      "Lose at the Olympics",
      "Fight in 4 weight classes",
      "Win pro debut"
    ],
    "correct": 0
  },
  {
    "question": "George Foreman's age when he reclaimed heavyweight title?",
    "choices": [
      "45",
      "40",
      "50",
      "42"
    ],
    "correct": 0
  },
  {
    "question": "Vitali Klitschko held titles in?",
    "choices": [
      "Heavyweight",
      "Middleweight",
      "Welterweight",
      "Featherweight"
    ],
    "correct": 0
  },
  {
    "question": "Wladimir Klitschko's reign as heavyweight champ totaled approximately how many years?",
    "choices": [
      "~9",
      "~5",
      "~12",
      "~15"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BoxingLegendsQuizSettings): BoxingLegendsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BoxingLegendsQuizState, action: BoxingLegendsQuizAction): BoxingLegendsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BoxingLegendsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
