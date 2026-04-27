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
    "question": "Brown v. Board of Education ruled what unconstitutional?",
    "choices": [
      "Poll taxes",
      "School segregation",
      "Anti-miscegenation laws",
      "Literacy tests"
    ],
    "correct": 1
  },
  {
    "question": "Marilyn Monroe starred in which 1959 film?",
    "choices": [
      "Niagara",
      "Some Like It Hot",
      "The Misfits",
      "Bus Stop"
    ],
    "correct": 1
  },
  {
    "question": "Senator Joseph McCarthy is associated with hunting?",
    "choices": [
      "Civil rights leaders",
      "Communists",
      "Beatniks",
      "Mobsters"
    ],
    "correct": 1
  },
  {
    "question": "The Salk vaccine of the 1950s targeted which disease?",
    "choices": [
      "Smallpox",
      "Polio",
      "Measles",
      "Tuberculosis"
    ],
    "correct": 1
  },
  {
    "question": "Eisenhower was U.S. President from?",
    "choices": [
      "1949-1957",
      "1953-1961",
      "1957-1965",
      "1961-1969"
    ],
    "correct": 1
  },
  {
    "question": "Which 1956 film starred James Dean as Cal Trask?",
    "choices": [
      "Rebel Without a Cause",
      "East of Eden",
      "Giant",
      "On the Waterfront"
    ],
    "correct": 1
  },
  {
    "question": "The Hula Hoop became a craze in?",
    "choices": [
      "1955",
      "1958",
      "1960",
      "1962"
    ],
    "correct": 1
  },
  {
    "question": "Mickey Mantle played for which MLB team?",
    "choices": [
      "Boston Red Sox",
      "New York Yankees",
      "Brooklyn Dodgers",
      "Chicago Cubs"
    ],
    "correct": 1
  },
  {
    "question": "Disneyland opened in California in?",
    "choices": [
      "1953",
      "1955",
      "1957",
      "1959"
    ],
    "correct": 1
  },
  {
    "question": "The Beat Generation novel 'On the Road' was by?",
    "choices": [
      "Allen Ginsberg",
      "Jack Kerouac",
      "William S. Burroughs",
      "Lawrence Ferlinghetti"
    ],
    "correct": 1
  },
  {
    "question": "Rosa Parks refused to give up her bus seat in which city?",
    "choices": [
      "Birmingham",
      "Selma",
      "Montgomery",
      "Atlanta"
    ],
    "correct": 2
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
