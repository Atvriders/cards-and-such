import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DiscoEraQuizSettings { questions: "10" | "20" | "30"; }
export interface DiscoEraQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DiscoEraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "'Saturday Night Fever' starred which actor?",
    "choices": [
      "Sylvester Stallone",
      "John Travolta",
      "Tom Cruise",
      "Burt Reynolds"
    ],
    "correct": 1
  },
  {
    "question": "Studio 54 was located in which city?",
    "choices": [
      "Los Angeles",
      "Las Vegas",
      "New York",
      "Chicago"
    ],
    "correct": 2
  },
  {
    "question": "'Stayin' Alive' was a hit by which group?",
    "choices": [
      "Bee Gees",
      "Donna Summer",
      "ABBA",
      "KC and the Sunshine Band"
    ],
    "correct": 0
  },
  {
    "question": "Which year is often called disco's peak?",
    "choices": [
      "1975",
      "1977",
      "1979",
      "1981"
    ],
    "correct": 2
  },
  {
    "question": "Disco Demolition Night took place at which ballpark?",
    "choices": [
      "Wrigley Field",
      "Comiskey Park",
      "Fenway Park",
      "Tiger Stadium"
    ],
    "correct": 1
  },
  {
    "question": "Donna Summer was nicknamed the?",
    "choices": [
      "Disco Diva",
      "Queen of Disco",
      "Disco Lady",
      "Glitter Queen"
    ],
    "correct": 1
  },
  {
    "question": "'Le Freak' was a 1978 hit by?",
    "choices": [
      "Chic",
      "Earth, Wind & Fire",
      "Sister Sledge",
      "KC and the Sunshine Band"
    ],
    "correct": 0
  },
  {
    "question": "'Boogie Wonderland' was performed by?",
    "choices": [
      "Bee Gees",
      "Earth, Wind & Fire",
      "Chic",
      "ABBA"
    ],
    "correct": 1
  },
  {
    "question": "'Y.M.C.A.' was performed by?",
    "choices": [
      "Bee Gees",
      "Village People",
      "ABBA",
      "Chic"
    ],
    "correct": 1
  },
  {
    "question": "A glitter ball is also commonly called a?",
    "choices": [
      "Mirror ball",
      "Strobe",
      "Lava lamp",
      "Sphere"
    ],
    "correct": 0
  },
  {
    "question": "ABBA originated in which country?",
    "choices": [
      "Norway",
      "Sweden",
      "Finland",
      "Denmark"
    ],
    "correct": 1
  },
  {
    "question": "A signature disco fashion item was bell-bottom?",
    "choices": [
      "Pants",
      "Shirts",
      "Shoes",
      "Hats"
    ],
    "correct": 0
  },
  {
    "question": "Gloria Gaynor's biggest disco anthem was?",
    "choices": [
      "I Will Survive",
      "Last Dance",
      "Hot Stuff",
      "Funkytown"
    ],
    "correct": 0
  },
  {
    "question": "'Funkytown' was a 1980 hit by?",
    "choices": [
      "Lipps Inc.",
      "Chic",
      "KC",
      "A Taste of Honey"
    ],
    "correct": 0
  },
  {
    "question": "'I Feel Love' was produced by Giorgio Moroder for?",
    "choices": [
      "Donna Summer",
      "Diana Ross",
      "Cher",
      "Gloria Gaynor"
    ],
    "correct": 0
  },
  {
    "question": "Which film popularized disco worldwide in 1977?",
    "choices": [
      "Thank God It's Friday",
      "Saturday Night Fever",
      "Roller Boogie",
      "Xanadu"
    ],
    "correct": 1
  },
  {
    "question": "Nile Rodgers was the guitarist for which disco band?",
    "choices": [
      "Chic",
      "KC",
      "Heatwave",
      "Sister Sledge"
    ],
    "correct": 0
  },
  {
    "question": "'We Are Family' was by?",
    "choices": [
      "Sister Sledge",
      "Pointer Sisters",
      "The Three Degrees",
      "Labelle"
    ],
    "correct": 0
  },
  {
    "question": "'Dancing Queen' was released by ABBA in?",
    "choices": [
      "1974",
      "1976",
      "1978",
      "1980"
    ],
    "correct": 1
  },
  {
    "question": "Which DJ is credited with pioneering modern club mixing?",
    "choices": [
      "Larry Levan",
      "Frankie Knuckles",
      "Francis Grasso",
      "David Mancuso"
    ],
    "correct": 2
  },
  {
    "question": "The Loft parties were hosted by?",
    "choices": [
      "David Mancuso",
      "Larry Levan",
      "Nicky Siano",
      "Tee Scott"
    ],
    "correct": 0
  },
  {
    "question": "Paradise Garage was located in?",
    "choices": [
      "New York",
      "Chicago",
      "Newark",
      "Philadelphia"
    ],
    "correct": 0
  },
  {
    "question": "'Don't Leave Me This Way' was a hit for which singer?",
    "choices": [
      "Thelma Houston",
      "Diana Ross",
      "Gloria Gaynor",
      "Cher"
    ],
    "correct": 0
  },
  {
    "question": "KC and the Sunshine Band hailed from?",
    "choices": [
      "Miami",
      "New York",
      "Detroit",
      "Atlanta"
    ],
    "correct": 0
  },
  {
    "question": "Which Rolling Stones song embraced disco in 1978?",
    "choices": [
      "Miss You",
      "Start Me Up",
      "Angie",
      "Beast of Burden"
    ],
    "correct": 0
  },
  {
    "question": "'Ring My Bell' was a 1979 disco hit by?",
    "choices": [
      "Anita Ward",
      "Evelyn King",
      "Chaka Khan",
      "Patrice Rushen"
    ],
    "correct": 0
  },
  {
    "question": "'Got to Be Real' was sung by?",
    "choices": [
      "Cheryl Lynn",
      "Evelyn King",
      "Stephanie Mills",
      "Deniece Williams"
    ],
    "correct": 0
  },
  {
    "question": "Which Diana Ross song was produced by Chic?",
    "choices": [
      "Upside Down",
      "Love Hangover",
      "I'm Coming Out",
      "Both A and C"
    ],
    "correct": 3
  },
  {
    "question": "Which Michael Jackson album rode the disco wave in 1979?",
    "choices": [
      "Thriller",
      "Off the Wall",
      "Bad",
      "Dangerous"
    ],
    "correct": 1
  },
  {
    "question": "Which dance was a disco floor staple?",
    "choices": [
      "The Hustle",
      "The Twist",
      "The Charleston",
      "The Jitterbug"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DiscoEraQuizSettings): DiscoEraQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DiscoEraQuizState, action: DiscoEraQuizAction): DiscoEraQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DiscoEraQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
