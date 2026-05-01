import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen40sQuizSettings { questions: "10" | "15"; }
export interface Nineteen40sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen40sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "What 1941 attack brought the U.S. into WWII?",
    "choices": [
      "Battle of Midway",
      "Pearl Harbor",
      "Iwo Jima",
      "Stalingrad"
    ],
    "correct": 1
  },
  {
    "question": "D-Day landings occurred on which beaches?",
    "choices": [
      "Sicily",
      "Normandy",
      "Anzio",
      "Okinawa"
    ],
    "correct": 1
  },
  {
    "question": "The atomic bomb was dropped on what two Japanese cities?",
    "choices": [
      "Tokyo & Osaka",
      "Hiroshima & Nagasaki",
      "Kyoto & Kobe",
      "Yokohama & Sendai"
    ],
    "correct": 1
  },
  {
    "question": "Who succeeded FDR as U.S. President in 1945?",
    "choices": [
      "Eisenhower",
      "Truman",
      "Wallace",
      "Marshall"
    ],
    "correct": 1
  },
  {
    "question": "The United Nations was founded in what year?",
    "choices": [
      "1942",
      "1944",
      "1945",
      "1948"
    ],
    "correct": 2
  },
  {
    "question": "Which 1942 film features 'Here's looking at you, kid'?",
    "choices": [
      "Citizen Kane",
      "Casablanca",
      "The Maltese Falcon",
      "Double Indemnity"
    ],
    "correct": 1
  },
  {
    "question": "Operation Overlord refers to what?",
    "choices": [
      "Battle of Bulge",
      "D-Day",
      "Pearl Harbor",
      "Berlin airlift"
    ],
    "correct": 1
  },
  {
    "question": "VE Day, marking Nazi surrender, was in what month/year?",
    "choices": [
      "May 1945",
      "August 1945",
      "May 1944",
      "September 1945"
    ],
    "correct": 0
  },
  {
    "question": "Who led the Soviet Union during WWII?",
    "choices": [
      "Lenin",
      "Stalin",
      "Khrushchev",
      "Trotsky"
    ],
    "correct": 1
  },
  {
    "question": "Which 1948 country declared independence in the Middle East?",
    "choices": [
      "Egypt",
      "Israel",
      "Iraq",
      "Jordan"
    ],
    "correct": 1
  },
  {
    "question": "The Marshall Plan was created to rebuild what?",
    "choices": [
      "Asia",
      "Europe",
      "Africa",
      "Latin America"
    ],
    "correct": 1
  },
  {
    "question": "Which 1947 invention by Bell Labs led to modern electronics?",
    "choices": [
      "Vacuum tube",
      "Transistor",
      "Integrated circuit",
      "LED"
    ],
    "correct": 1
  },
  {
    "question": "Mahatma Gandhi was assassinated in?",
    "choices": [
      "1946",
      "1947",
      "1948",
      "1949"
    ],
    "correct": 2
  },
  {
    "question": "'A Streetcar Named Desire' premiered on Broadway by which playwright (1947)?",
    "choices": [
      "Arthur Miller",
      "Tennessee Williams",
      "Eugene O'Neill",
      "Lillian Hellman"
    ],
    "correct": 1
  },
  {
    "question": "Jackie Robinson broke MLB's color barrier with which team in 1947?",
    "choices": [
      "NY Yankees",
      "Brooklyn Dodgers",
      "Boston Braves",
      "Cleveland Indians"
    ],
    "correct": 1
  },
  {
    "question": "Which 1944 conference set post-war monetary order (IMF/World Bank)?",
    "choices": [
      "Yalta",
      "Tehran",
      "Bretton Woods",
      "Potsdam"
    ],
    "correct": 2
  },
  {
    "question": "The Berlin Airlift took place in?",
    "choices": [
      "1946-47",
      "1947-48",
      "1948-49",
      "1949-50"
    ],
    "correct": 2
  },
  {
    "question": "Who designed the famous 'Rosie the Riveter' poster lookalike for WWII labor?",
    "choices": [
      "Norman Rockwell",
      "J. Howard Miller",
      "Charles Schulz",
      "Saul Bass"
    ],
    "correct": 1
  },
  {
    "question": "Mao Zedong proclaimed the People's Republic of China in?",
    "choices": [
      "1947",
      "1948",
      "1949",
      "1950"
    ],
    "correct": 2
  },
  {
    "question": "Which 1946 Frank Capra film stars James Stewart as George Bailey?",
    "choices": [
      "Mr. Smith Goes to Washington",
      "It's a Wonderful Life",
      "Meet John Doe",
      "You Can't Take It With You"
    ],
    "correct": 1
  },
  {
    "question": "Pakistan and India gained independence from Britain in?",
    "choices": [
      "1945",
      "1946",
      "1947",
      "1948"
    ],
    "correct": 2
  },
  {
    "question": "ENIAC, an early electronic computer, was unveiled in?",
    "choices": [
      "1942",
      "1944",
      "1946",
      "1948"
    ],
    "correct": 2
  },
  {
    "question": "Who was British PM during most of WWII?",
    "choices": [
      "Chamberlain",
      "Churchill",
      "Attlee",
      "Eden"
    ],
    "correct": 1
  },
  {
    "question": "The Nuremberg Trials began in?",
    "choices": [
      "1944",
      "1945",
      "1946",
      "1947"
    ],
    "correct": 1
  },
  {
    "question": "Which 1949 NATO founding was a Western military alliance?",
    "choices": [
      "UN",
      "Warsaw Pact",
      "NATO",
      "SEATO"
    ],
    "correct": 2
  },
  {
    "question": "Who painted 'Number 1A' (drip paintings) gaining fame in late 1940s?",
    "choices": [
      "Mark Rothko",
      "Jackson Pollock",
      "Willem de Kooning",
      "Andy Warhol"
    ],
    "correct": 1
  },
  {
    "question": "Which 1949 novel by Orwell warned of totalitarianism?",
    "choices": [
      "Animal Farm",
      "1984",
      "Brave New World",
      "Fahrenheit 451"
    ],
    "correct": 1
  },
  {
    "question": "Which singer crooned 'White Christmas' (1942 Bing Crosby hit)?",
    "choices": [
      "Frank Sinatra",
      "Bing Crosby",
      "Perry Como",
      "Dean Martin"
    ],
    "correct": 1
  },
  {
    "question": "The Manhattan Project produced what?",
    "choices": [
      "Radar",
      "Atomic bomb",
      "Penicillin",
      "Jet engine"
    ],
    "correct": 1
  },
  {
    "question": "'Diary of a Young Girl' (published 1947) was written by whom?",
    "choices": [
      "Anne Frank",
      "Elie Wiesel",
      "Primo Levi",
      "Viktor Frankl"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen40sQuizSettings): Nineteen40sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen40sQuizState, action: Nineteen40sQuizAction): Nineteen40sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen40sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
