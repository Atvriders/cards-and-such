import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen50sQuizSettings { questions: "10" | "15"; }
export interface Nineteen50sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen50sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who was nicknamed 'The King of Rock and Roll'?",
    "choices": [
      "Buddy Holly",
      "Chuck Berry",
      "Elvis Presley",
      "Little Richard"
    ],
    "correct": 2
  },
  {
    "question": "Which 1950s sitcom starred a redhead named Lucy?",
    "choices": [
      "The Honeymooners",
      "I Love Lucy",
      "Father Knows Best",
      "Leave It to Beaver"
    ],
    "correct": 1
  },
  {
    "question": "The Korean War lasted from?",
    "choices": [
      "1945-1948",
      "1950-1953",
      "1955-1958",
      "1960-1963"
    ],
    "correct": 1
  },
  {
    "question": "Sputnik was launched by the USSR in?",
    "choices": [
      "1955",
      "1957",
      "1959",
      "1961"
    ],
    "correct": 1
  },
  {
    "question": "Brown v. Board of Education (1954) ruled what unconstitutional?",
    "choices": [
      "Poll taxes",
      "School segregation",
      "Literacy tests",
      "Jim Crow buses"
    ],
    "correct": 1
  },
  {
    "question": "Who refused to give up her bus seat in 1955 Montgomery?",
    "choices": [
      "Coretta Scott",
      "Rosa Parks",
      "Ella Baker",
      "Daisy Bates"
    ],
    "correct": 1
  },
  {
    "question": "Which 1955 Disney park opened in Anaheim?",
    "choices": [
      "Disney World",
      "Disneyland",
      "EPCOT",
      "Magic Kingdom"
    ],
    "correct": 1
  },
  {
    "question": "Hawaii became the 50th U.S. state in?",
    "choices": [
      "1957",
      "1958",
      "1959",
      "1960"
    ],
    "correct": 2
  },
  {
    "question": "Who developed the polio vaccine announced in 1955?",
    "choices": [
      "Albert Sabin",
      "Jonas Salk",
      "Alexander Fleming",
      "Louis Pasteur"
    ],
    "correct": 1
  },
  {
    "question": "Which 1956 musical featured 'Tonight' and the Sharks vs. Jets?",
    "choices": [
      "My Fair Lady",
      "West Side Story",
      "South Pacific",
      "The King and I"
    ],
    "correct": 1
  },
  {
    "question": "Castro overthrew which Cuban leader in 1959?",
    "choices": [
      "Batista",
      "Machado",
      "Estrada",
      "Grau"
    ],
    "correct": 0
  },
  {
    "question": "Eisenhower's vice president throughout the 1950s was?",
    "choices": [
      "Nixon",
      "JFK",
      "LBJ",
      "Humphrey"
    ],
    "correct": 0
  },
  {
    "question": "Which 1953 Everest climber reached the summit with Tenzing?",
    "choices": [
      "George Mallory",
      "Edmund Hillary",
      "Reinhold Messner",
      "Chris Bonington"
    ],
    "correct": 1
  },
  {
    "question": "DNA's double helix was described in 1953 by?",
    "choices": [
      "Pauling & Corey",
      "Watson & Crick",
      "Franklin alone",
      "Mendel & Morgan"
    ],
    "correct": 1
  },
  {
    "question": "Which 1956 Elvis hit topped Billboard's first Hot 100 era?",
    "choices": [
      "Hound Dog",
      "Heartbreak Hotel",
      "Jailhouse Rock",
      "All Shook Up"
    ],
    "correct": 1
  },
  {
    "question": "Marilyn Monroe famously sang 'Happy Birthday' to JFK in 1962, but in 1955 starred in which film?",
    "choices": [
      "Some Like It Hot",
      "The Seven Year Itch",
      "Bus Stop",
      "How to Marry a Millionaire"
    ],
    "correct": 1
  },
  {
    "question": "What was the first satellite, launched 1957?",
    "choices": [
      "Explorer 1",
      "Sputnik 1",
      "Vanguard",
      "Luna 1"
    ],
    "correct": 1
  },
  {
    "question": "Queen Elizabeth II was crowned in?",
    "choices": [
      "1952",
      "1953",
      "1955",
      "1957"
    ],
    "correct": 1
  },
  {
    "question": "Who pitched a perfect game in the 1956 World Series?",
    "choices": [
      "Sandy Koufax",
      "Don Larsen",
      "Whitey Ford",
      "Bob Feller"
    ],
    "correct": 1
  },
  {
    "question": "Which 1957 Kerouac novel defined the Beat Generation?",
    "choices": [
      "Howl",
      "On the Road",
      "Naked Lunch",
      "The Dharma Bums"
    ],
    "correct": 1
  },
  {
    "question": "McCarthy's anti-communist hearings targeted which industry?",
    "choices": [
      "Oil",
      "Hollywood",
      "Auto",
      "Steel"
    ],
    "correct": 1
  },
  {
    "question": "Which 1955 James Dean film featured a knife fight?",
    "choices": [
      "Giant",
      "Rebel Without a Cause",
      "East of Eden",
      "On the Waterfront"
    ],
    "correct": 1
  },
  {
    "question": "Buddy Holly died in a 1959 plane crash with whom?",
    "choices": [
      "Elvis & Sinatra",
      "Ritchie Valens & Big Bopper",
      "Roy Orbison & Eddie Cochran",
      "Chuck Berry & Little Richard"
    ],
    "correct": 1
  },
  {
    "question": "Alaska became a U.S. state in?",
    "choices": [
      "1957",
      "1958",
      "1959",
      "1960"
    ],
    "correct": 2
  },
  {
    "question": "Which 1953 Arthur Miller play allegorized McCarthyism via Salem?",
    "choices": [
      "Death of a Salesman",
      "The Crucible",
      "All My Sons",
      "A View from the Bridge"
    ],
    "correct": 1
  },
  {
    "question": "'Rock Around the Clock' (1954) was performed by?",
    "choices": [
      "Elvis Presley",
      "Bill Haley & His Comets",
      "Chuck Berry",
      "Little Richard"
    ],
    "correct": 1
  },
  {
    "question": "Which 1959 Cadillac was famous for its huge tail fins?",
    "choices": [
      "DeVille",
      "Eldorado",
      "Fleetwood",
      "Series 62"
    ],
    "correct": 1
  },
  {
    "question": "Suez Crisis happened in?",
    "choices": [
      "1955",
      "1956",
      "1957",
      "1958"
    ],
    "correct": 1
  },
  {
    "question": "Which 1950s toy was a metal spring that 'walks' down stairs?",
    "choices": [
      "Hula Hoop",
      "Slinky",
      "Etch A Sketch",
      "Mr. Potato Head"
    ],
    "correct": 1
  },
  {
    "question": "Who broke the four-minute mile in 1954?",
    "choices": [
      "Roger Bannister",
      "John Landy",
      "Jim Ryun",
      "Herb Elliott"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen50sQuizSettings): Nineteen50sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen50sQuizState, action: Nineteen50sQuizAction): Nineteen50sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen50sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
