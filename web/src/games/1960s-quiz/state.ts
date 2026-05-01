import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen60sQuizSettings { questions: "10" | "15"; }
export interface Nineteen60sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen60sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who was U.S. President when assassinated in 1963?",
    "choices": [
      "Eisenhower",
      "JFK",
      "LBJ",
      "Nixon"
    ],
    "correct": 1
  },
  {
    "question": "The first man on the moon, in 1969, was?",
    "choices": [
      "Buzz Aldrin",
      "Neil Armstrong",
      "John Glenn",
      "Yuri Gagarin"
    ],
    "correct": 1
  },
  {
    "question": "Which British band released 'Sgt. Pepper's Lonely Hearts Club Band'?",
    "choices": [
      "The Rolling Stones",
      "The Beatles",
      "The Who",
      "The Kinks"
    ],
    "correct": 1
  },
  {
    "question": "The Cuban Missile Crisis occurred in?",
    "choices": [
      "1960",
      "1961",
      "1962",
      "1963"
    ],
    "correct": 2
  },
  {
    "question": "MLK's 'I Have a Dream' speech was given in?",
    "choices": [
      "1961",
      "1962",
      "1963",
      "1964"
    ],
    "correct": 2
  },
  {
    "question": "The Berlin Wall was built in?",
    "choices": [
      "1959",
      "1961",
      "1963",
      "1965"
    ],
    "correct": 1
  },
  {
    "question": "Woodstock music festival took place in?",
    "choices": [
      "1967",
      "1968",
      "1969",
      "1970"
    ],
    "correct": 2
  },
  {
    "question": "Who first orbited Earth in 1961?",
    "choices": [
      "John Glenn",
      "Yuri Gagarin",
      "Alan Shepard",
      "Gherman Titov"
    ],
    "correct": 1
  },
  {
    "question": "The Civil Rights Act was signed by which president in 1964?",
    "choices": [
      "JFK",
      "LBJ",
      "Nixon",
      "Ford"
    ],
    "correct": 1
  },
  {
    "question": "Which 1965 Vietnam buildup operation bombed the North?",
    "choices": [
      "Rolling Thunder",
      "Linebacker",
      "Tet Offensive",
      "Market Time"
    ],
    "correct": 0
  },
  {
    "question": "Who painted Campbell's Soup Cans in 1962?",
    "choices": [
      "Lichtenstein",
      "Andy Warhol",
      "Jasper Johns",
      "Robert Rauschenberg"
    ],
    "correct": 1
  },
  {
    "question": "The Beatles first appeared on Ed Sullivan in?",
    "choices": [
      "1962",
      "1963",
      "1964",
      "1965"
    ],
    "correct": 2
  },
  {
    "question": "Which 1968 figure was assassinated at the Lorraine Motel?",
    "choices": [
      "RFK",
      "MLK",
      "Malcolm X",
      "Medgar Evers"
    ],
    "correct": 1
  },
  {
    "question": "Which 1969 film won Best Picture and was X-rated?",
    "choices": [
      "Easy Rider",
      "Midnight Cowboy",
      "Bonnie and Clyde",
      "The Graduate"
    ],
    "correct": 1
  },
  {
    "question": "Who became Prime Minister of the UK in 1964 (Labour)?",
    "choices": [
      "Macmillan",
      "Wilson",
      "Heath",
      "Callaghan"
    ],
    "correct": 1
  },
  {
    "question": "Which 1962 'Dr.' film launched the James Bond franchise?",
    "choices": [
      "From Russia with Love",
      "Dr. No",
      "Goldfinger",
      "Thunderball"
    ],
    "correct": 1
  },
  {
    "question": "Bob Dylan went electric at which 1965 festival?",
    "choices": [
      "Monterey",
      "Newport Folk",
      "Woodstock",
      "Isle of Wight"
    ],
    "correct": 1
  },
  {
    "question": "The Tet Offensive happened in?",
    "choices": [
      "1966",
      "1967",
      "1968",
      "1969"
    ],
    "correct": 2
  },
  {
    "question": "Which 1960 birth-control milestone was approved by FDA?",
    "choices": [
      "IUD",
      "The Pill",
      "Patch",
      "Diaphragm"
    ],
    "correct": 1
  },
  {
    "question": "Cassius Clay (Muhammad Ali) won the heavyweight title from whom in 1964?",
    "choices": [
      "Floyd Patterson",
      "Sonny Liston",
      "Joe Frazier",
      "George Foreman"
    ],
    "correct": 1
  },
  {
    "question": "Which 1963 musical film stars Julie Andrews as a nanny?",
    "choices": [
      "The Sound of Music",
      "Mary Poppins",
      "My Fair Lady",
      "Funny Girl"
    ],
    "correct": 1
  },
  {
    "question": "The Six-Day War in 1967 involved Israel and which neighbors?",
    "choices": [
      "Iran/Iraq/Syria",
      "Egypt/Syria/Jordan",
      "Libya/Egypt/Sudan",
      "Lebanon/Iraq/Saudi"
    ],
    "correct": 1
  },
  {
    "question": "Which 1969 festival ended in a stabbing death (Hells Angels)?",
    "choices": [
      "Monterey Pop",
      "Altamont",
      "Isle of Wight",
      "Woodstock"
    ],
    "correct": 1
  },
  {
    "question": "The Apollo 11 lunar module was named?",
    "choices": [
      "Columbia",
      "Eagle",
      "Falcon",
      "Antares"
    ],
    "correct": 1
  },
  {
    "question": "Who was assassinated in California after winning 1968 primary?",
    "choices": [
      "MLK",
      "RFK",
      "Malcolm X",
      "George Wallace"
    ],
    "correct": 1
  },
  {
    "question": "Which 1964 Beatles film featured 'A Hard Day's Night'?",
    "choices": [
      "Help!",
      "A Hard Day's Night",
      "Let It Be",
      "Magical Mystery Tour"
    ],
    "correct": 1
  },
  {
    "question": "Who founded Motown Records?",
    "choices": [
      "Quincy Jones",
      "Berry Gordy",
      "Smokey Robinson",
      "Marvin Gaye"
    ],
    "correct": 1
  },
  {
    "question": "Stonewall riots in NYC sparked which movement in 1969?",
    "choices": [
      "Anti-war",
      "Gay rights",
      "Feminist",
      "Civil rights"
    ],
    "correct": 1
  },
  {
    "question": "The 1969 Manson Family murders were in which city?",
    "choices": [
      "San Francisco",
      "Los Angeles",
      "Las Vegas",
      "Sacramento"
    ],
    "correct": 1
  },
  {
    "question": "'In the Heat of the Night' (1967 Best Picture) starred whom as Detective Tibbs?",
    "choices": [
      "Sammy Davis Jr.",
      "Sidney Poitier",
      "Harry Belafonte",
      "James Earl Jones"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen60sQuizSettings): Nineteen60sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen60sQuizState, action: Nineteen60sQuizAction): Nineteen60sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen60sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
