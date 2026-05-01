import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen30sQuizSettings { questions: "10" | "15"; }
export interface Nineteen30sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen30sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who was elected U.S. President in 1932?",
    "choices": [
      "Hoover",
      "Coolidge",
      "Franklin D. Roosevelt",
      "Truman"
    ],
    "correct": 2
  },
  {
    "question": "What was FDR's economic recovery program called?",
    "choices": [
      "The Big Push",
      "Fair Deal",
      "New Deal",
      "Square Deal"
    ],
    "correct": 2
  },
  {
    "question": "The Dust Bowl mainly hit which U.S. region?",
    "choices": [
      "New England",
      "Pacific Northwest",
      "Great Plains",
      "Florida"
    ],
    "correct": 2
  },
  {
    "question": "Who became Chancellor of Germany in 1933?",
    "choices": [
      "Stalin",
      "Mussolini",
      "Hitler",
      "Franco"
    ],
    "correct": 2
  },
  {
    "question": "Amelia Earhart disappeared in what year?",
    "choices": [
      "1932",
      "1935",
      "1937",
      "1939"
    ],
    "correct": 2
  },
  {
    "question": "Which 1939 film featured Dorothy and a yellow brick road?",
    "choices": [
      "Snow White",
      "The Wizard of Oz",
      "Pinocchio",
      "Fantasia"
    ],
    "correct": 1
  },
  {
    "question": "What 1936 event in Spain began with a military uprising?",
    "choices": [
      "Spanish-American War",
      "Spanish Civil War",
      "Carlist Revolt",
      "Catalan Crisis"
    ],
    "correct": 1
  },
  {
    "question": "Which 'Gone With the Wind' actress won Best Actress in 1939?",
    "choices": [
      "Bette Davis",
      "Vivien Leigh",
      "Olivia de Havilland",
      "Hattie McDaniel"
    ],
    "correct": 1
  },
  {
    "question": "Which German airship exploded at Lakehurst in 1937?",
    "choices": [
      "Graf Zeppelin",
      "Hindenburg",
      "USS Akron",
      "USS Macon"
    ],
    "correct": 1
  },
  {
    "question": "Who wrote 'The Grapes of Wrath' (1939)?",
    "choices": [
      "Faulkner",
      "Steinbeck",
      "Hemingway",
      "Wolfe"
    ],
    "correct": 1
  },
  {
    "question": "Babe Ruth retired from baseball in what year?",
    "choices": [
      "1933",
      "1935",
      "1937",
      "1939"
    ],
    "correct": 1
  },
  {
    "question": "The 1936 Berlin Olympics star sprinter was?",
    "choices": [
      "Carl Lewis",
      "Jesse Owens",
      "Eddie Tolan",
      "Ralph Metcalfe"
    ],
    "correct": 1
  },
  {
    "question": "Which Disney film, 1937, was the first feature-length animation?",
    "choices": [
      "Pinocchio",
      "Snow White and the Seven Dwarfs",
      "Bambi",
      "Dumbo"
    ],
    "correct": 1
  },
  {
    "question": "Which boxer became heavyweight champion in 1937?",
    "choices": [
      "Jack Dempsey",
      "Gene Tunney",
      "Joe Louis",
      "Rocky Marciano"
    ],
    "correct": 2
  },
  {
    "question": "The Empire State Building opened in what year?",
    "choices": [
      "1929",
      "1931",
      "1933",
      "1935"
    ],
    "correct": 1
  },
  {
    "question": "Which 1934 outlaw duo were ambushed in Louisiana?",
    "choices": [
      "Sacco-Vanzetti",
      "Bonnie and Clyde",
      "Pretty Boy Floyd & Ma Barker",
      "Baby Face Nelson & Dillinger"
    ],
    "correct": 1
  },
  {
    "question": "Who painted 'American Gothic' in 1930?",
    "choices": [
      "Edward Hopper",
      "Grant Wood",
      "Norman Rockwell",
      "Georgia O'Keeffe"
    ],
    "correct": 1
  },
  {
    "question": "Which radio drama by Orson Welles caused panic in 1938?",
    "choices": [
      "The Shadow",
      "War of the Worlds",
      "Mercury Theatre on the Air",
      "Inner Sanctum"
    ],
    "correct": 1
  },
  {
    "question": "What 1933 amendment ended Prohibition?",
    "choices": [
      "20th",
      "21st",
      "22nd",
      "23rd"
    ],
    "correct": 1
  },
  {
    "question": "Which jazz bandleader was 'King of Swing' in the 1930s?",
    "choices": [
      "Duke Ellington",
      "Benny Goodman",
      "Glenn Miller",
      "Count Basie"
    ],
    "correct": 1
  },
  {
    "question": "Which child star of the 1930s sang 'On the Good Ship Lollipop'?",
    "choices": [
      "Judy Garland",
      "Shirley Temple",
      "Mickey Rooney",
      "Deanna Durbin"
    ],
    "correct": 1
  },
  {
    "question": "What U.S. workers' law passed in 1935 created Social Security?",
    "choices": [
      "Wagner Act",
      "Social Security Act",
      "Fair Labor Standards Act",
      "Glass-Steagall"
    ],
    "correct": 1
  },
  {
    "question": "Japan invaded which Chinese region in 1931?",
    "choices": [
      "Tibet",
      "Manchuria",
      "Xinjiang",
      "Hainan"
    ],
    "correct": 1
  },
  {
    "question": "Who became British PM (1937) at the time of Munich?",
    "choices": [
      "Churchill",
      "Chamberlain",
      "Baldwin",
      "Attlee"
    ],
    "correct": 1
  },
  {
    "question": "Which radio comedian quipped 'Wanna buy a duck'?",
    "choices": [
      "Jack Benny",
      "Joe Penner",
      "Burns & Allen",
      "Fred Allen"
    ],
    "correct": 1
  },
  {
    "question": "Which 1933 King Kong setting featured the Empire State?",
    "choices": [
      "London",
      "Paris",
      "New York",
      "Chicago"
    ],
    "correct": 2
  },
  {
    "question": "Which 1930s aircraft, the DC-3, was made by what company?",
    "choices": [
      "Boeing",
      "Douglas",
      "Lockheed",
      "Curtiss"
    ],
    "correct": 1
  },
  {
    "question": "Which dictator launched the Great Purge starting in 1936?",
    "choices": [
      "Hitler",
      "Stalin",
      "Mussolini",
      "Franco"
    ],
    "correct": 1
  },
  {
    "question": "Who composed 'Porgy and Bess' (1935)?",
    "choices": [
      "Cole Porter",
      "George Gershwin",
      "Aaron Copland",
      "Richard Rodgers"
    ],
    "correct": 1
  },
  {
    "question": "What 1939 invasion started WWII in Europe?",
    "choices": [
      "Of France",
      "Of Poland",
      "Of Belgium",
      "Of Norway"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen30sQuizSettings): Nineteen30sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen30sQuizState, action: Nineteen30sQuizAction): Nineteen30sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen30sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
