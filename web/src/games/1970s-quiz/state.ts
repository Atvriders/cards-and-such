import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen70sQuizSettings { questions: "10" | "15"; }
export interface Nineteen70sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen70sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which scandal led to U.S. President Nixon's resignation in 1974?",
    "choices": [
      "Iran-Contra",
      "Watergate",
      "Whitewater",
      "Teapot Dome"
    ],
    "correct": 1
  },
  {
    "question": "In what year did Saigon fall, ending the Vietnam War?",
    "choices": [
      "1973",
      "1974",
      "1975",
      "1976"
    ],
    "correct": 2
  },
  {
    "question": "Which 1977 George Lucas film became a cultural phenomenon?",
    "choices": [
      "Close Encounters of the Third Kind",
      "Star Wars",
      "Saturday Night Fever",
      "Rocky"
    ],
    "correct": 1
  },
  {
    "question": "Who became the first non-Italian Pope in over 400 years in 1978?",
    "choices": [
      "John Paul I",
      "John Paul II",
      "Paul VI",
      "Benedict XVI"
    ],
    "correct": 1
  },
  {
    "question": "Which British monarch celebrated her Silver Jubilee in 1977?",
    "choices": [
      "Queen Mary",
      "Queen Elizabeth II",
      "Princess Margaret",
      "Queen Victoria II"
    ],
    "correct": 1
  },
  {
    "question": "Margaret Thatcher became UK Prime Minister in what year?",
    "choices": [
      "1977",
      "1978",
      "1979",
      "1980"
    ],
    "correct": 2
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
    "question": "The Iran hostage crisis began in November of which year?",
    "choices": [
      "1977",
      "1978",
      "1979",
      "1980"
    ],
    "correct": 2
  },
  {
    "question": "What 1979 nuclear accident occurred in Pennsylvania?",
    "choices": [
      "Chernobyl",
      "Three Mile Island",
      "Fukushima",
      "Hanford"
    ],
    "correct": 1
  },
  {
    "question": "Which 1972 video game by Atari was a major arcade hit?",
    "choices": [
      "Asteroids",
      "Space Invaders",
      "Pong",
      "Pac-Man"
    ],
    "correct": 2
  },
  {
    "question": "Apple Computer was founded in what year?",
    "choices": [
      "1974",
      "1975",
      "1976",
      "1977"
    ],
    "correct": 2
  },
  {
    "question": "Which 1976 film starring Sylvester Stallone won Best Picture?",
    "choices": [
      "Rocky",
      "Network",
      "Taxi Driver",
      "All the President's Men"
    ],
    "correct": 0
  },
  {
    "question": "Who was the lead singer of the Sex Pistols?",
    "choices": [
      "Sid Vicious",
      "Johnny Rotten",
      "Joe Strummer",
      "Iggy Pop"
    ],
    "correct": 1
  },
  {
    "question": "Pol Pot's Khmer Rouge ruled which country in the late 1970s?",
    "choices": [
      "Vietnam",
      "Cambodia",
      "Laos",
      "Thailand"
    ],
    "correct": 1
  },
  {
    "question": "Which Saturday Night Fever star helped define disco era fashion?",
    "choices": [
      "John Travolta",
      "Robert De Niro",
      "Al Pacino",
      "Burt Reynolds"
    ],
    "correct": 0
  },
  {
    "question": "The first test-tube baby, Louise Brown, was born in what year?",
    "choices": [
      "1976",
      "1977",
      "1978",
      "1979"
    ],
    "correct": 2
  },
  {
    "question": "Who succeeded Nixon as U.S. President in 1974?",
    "choices": [
      "Jimmy Carter",
      "Gerald Ford",
      "Spiro Agnew",
      "Ronald Reagan"
    ],
    "correct": 1
  },
  {
    "question": "Which 1975 Steven Spielberg film created the summer blockbuster?",
    "choices": [
      "Close Encounters",
      "Jaws",
      "1941",
      "The Sugarland Express"
    ],
    "correct": 1
  },
  {
    "question": "OPEC's 1973 oil embargo was triggered by which conflict?",
    "choices": [
      "Six-Day War",
      "Yom Kippur War",
      "Iran-Iraq War",
      "Suez Crisis"
    ],
    "correct": 1
  },
  {
    "question": "Elvis Presley died in what year?",
    "choices": [
      "1975",
      "1976",
      "1977",
      "1978"
    ],
    "correct": 2
  },
  {
    "question": "Which Swedish pop group won Eurovision in 1974 with 'Waterloo'?",
    "choices": [
      "ABBA",
      "Roxette",
      "Ace of Base",
      "A-ha"
    ],
    "correct": 0
  },
  {
    "question": "Who painted himself onto the cover of his 1977 album 'Low'?",
    "choices": [
      "David Bowie",
      "Iggy Pop",
      "Lou Reed",
      "Brian Eno"
    ],
    "correct": 0
  },
  {
    "question": "The Camp David Accords were signed in 1978 between Israel and?",
    "choices": [
      "Jordan",
      "Egypt",
      "Syria",
      "Lebanon"
    ],
    "correct": 1
  },
  {
    "question": "Which 1972 Francis Ford Coppola film won Best Picture?",
    "choices": [
      "Chinatown",
      "The Godfather",
      "The Conversation",
      "Apocalypse Now"
    ],
    "correct": 1
  },
  {
    "question": "Mao Zedong died in what year?",
    "choices": [
      "1974",
      "1975",
      "1976",
      "1977"
    ],
    "correct": 2
  },
  {
    "question": "Which 1979 Soviet invasion began the Cold War's last major proxy conflict?",
    "choices": [
      "Hungary",
      "Czechoslovakia",
      "Afghanistan",
      "Poland"
    ],
    "correct": 2
  },
  {
    "question": "Pink Floyd's 1973 landmark concept album was titled?",
    "choices": [
      "Animals",
      "Wish You Were Here",
      "The Dark Side of the Moon",
      "The Wall"
    ],
    "correct": 2
  },
  {
    "question": "Which Olympics were marred by a Palestinian terrorist attack in 1972?",
    "choices": [
      "Mexico City",
      "Munich",
      "Montreal",
      "Moscow"
    ],
    "correct": 1
  },
  {
    "question": "The Sony Walkman portable cassette player launched in?",
    "choices": [
      "1977",
      "1978",
      "1979",
      "1980"
    ],
    "correct": 2
  },
  {
    "question": "Which Beatles member was assassinated in December 1980 (just after the decade)?",
    "choices": [
      "Paul McCartney",
      "John Lennon",
      "George Harrison",
      "Ringo Starr"
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
