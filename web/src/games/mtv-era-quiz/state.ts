import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MtvEraQuizSettings { questions: "10" | "20" | "30"; }
export interface MtvEraQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MtvEraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "MTV launched on?",
    "choices": [
      "August 1, 1981",
      "July 4, 1980",
      "January 1, 1982",
      "September 5, 1979"
    ],
    "correct": 0
  },
  {
    "question": "The first music video aired on MTV was?",
    "choices": [
      "Video Killed the Radio Star",
      "Money for Nothing",
      "Thriller",
      "Sledgehammer"
    ],
    "correct": 0
  },
  {
    "question": "Which Michael Jackson video premiered as a 14-minute event in 1983?",
    "choices": [
      "Beat It",
      "Billie Jean",
      "Thriller",
      "Bad"
    ],
    "correct": 2
  },
  {
    "question": "Madonna's 1984 VMA performance featured which song?",
    "choices": [
      "Like a Virgin",
      "Material Girl",
      "Vogue",
      "Express Yourself"
    ],
    "correct": 0
  },
  {
    "question": "MTV's first VJ lineup included Nina Blackwood and?",
    "choices": [
      "Mark Goodman",
      "Carson Daly",
      "Kennedy",
      "Adam Curry"
    ],
    "correct": 0
  },
  {
    "question": "'Money for Nothing' included the line about MTV by?",
    "choices": [
      "Dire Straits",
      "Phil Collins",
      "Bruce Springsteen",
      "Genesis"
    ],
    "correct": 0
  },
  {
    "question": "Which animated MTV duo debuted in 1993?",
    "choices": [
      "Beavis and Butt-Head",
      "Daria",
      "The Maxx",
      "Aeon Flux"
    ],
    "correct": 0
  },
  {
    "question": "'Yo! MTV Raps' premiered in?",
    "choices": [
      "1986",
      "1988",
      "1990",
      "1992"
    ],
    "correct": 1
  },
  {
    "question": "'Total Request Live' was hosted in early years by?",
    "choices": [
      "Carson Daly",
      "Kurt Loder",
      "Tabitha Soren",
      "John Norris"
    ],
    "correct": 0
  },
  {
    "question": "MTV Unplugged's most famous 1993 episode featured?",
    "choices": [
      "Eric Clapton",
      "Nirvana",
      "Pearl Jam",
      "10,000 Maniacs"
    ],
    "correct": 1
  },
  {
    "question": "'The Real World' premiered in?",
    "choices": [
      "1990",
      "1992",
      "1994",
      "1996"
    ],
    "correct": 1
  },
  {
    "question": "Which 'Real World' city was the first season set in?",
    "choices": [
      "Los Angeles",
      "New York",
      "San Francisco",
      "London"
    ],
    "correct": 1
  },
  {
    "question": "MTV2 launched in?",
    "choices": [
      "1994",
      "1996",
      "1998",
      "2000"
    ],
    "correct": 1
  },
  {
    "question": "Which Aerosmith video starred Alicia Silverstone?",
    "choices": [
      "Cryin'",
      "Crazy",
      "Amazing",
      "All three"
    ],
    "correct": 3
  },
  {
    "question": "Peter Gabriel's claymation video was for?",
    "choices": [
      "Sledgehammer",
      "Big Time",
      "Shock the Monkey",
      "Steam"
    ],
    "correct": 0
  },
  {
    "question": "A-ha's 'Take On Me' video used which animation style?",
    "choices": [
      "Rotoscoping",
      "Stop motion",
      "CGI",
      "Cel animation"
    ],
    "correct": 0
  },
  {
    "question": "'Smells Like Teen Spirit' video set was a?",
    "choices": [
      "Pep rally",
      "Concert",
      "Mall",
      "Beach"
    ],
    "correct": 0
  },
  {
    "question": "Which annual MTV awards were first held in 1984?",
    "choices": [
      "VMAs",
      "EMAs",
      "Movie Awards",
      "TRL Awards"
    ],
    "correct": 0
  },
  {
    "question": "The MTV Moon Man trophy honors which historic event?",
    "choices": [
      "Apollo 11",
      "Sputnik",
      "Mercury 1",
      "Apollo 13"
    ],
    "correct": 0
  },
  {
    "question": "Which 1990s MTV show featured pranks before YouTube existed?",
    "choices": [
      "Jackass",
      "Punk'd",
      "Wonder Showzen",
      "Fear"
    ],
    "correct": 0
  },
  {
    "question": "Britney Spears performed with a snake at the 2001 VMAs to?",
    "choices": [
      "I'm a Slave 4 U",
      "Toxic",
      "Oops!… I Did It Again",
      "Stronger"
    ],
    "correct": 0
  },
  {
    "question": "Madonna kissed which singer at the 2003 VMAs?",
    "choices": [
      "Britney Spears",
      "Christina Aguilera",
      "Both A and B",
      "Beyonce"
    ],
    "correct": 2
  },
  {
    "question": "Kurt Loder anchored which MTV news block?",
    "choices": [
      "MTV News",
      "TRL",
      "120 Minutes",
      "The Week in Rock"
    ],
    "correct": 0
  },
  {
    "question": "'Headbangers Ball' focused on which genre?",
    "choices": [
      "Heavy metal",
      "Hip hop",
      "Pop",
      "Country"
    ],
    "correct": 0
  },
  {
    "question": "'120 Minutes' focused on which genre?",
    "choices": [
      "Alternative rock",
      "Hip hop",
      "Country",
      "R&B"
    ],
    "correct": 0
  },
  {
    "question": "Which boy band ruled TRL in 2000?",
    "choices": [
      "Backstreet Boys",
      "NSYNC",
      "Both A and B",
      "98 Degrees"
    ],
    "correct": 2
  },
  {
    "question": "Which 1981 slogan defined MTV's mission?",
    "choices": [
      "I Want My MTV",
      "Music First",
      "Yo! MTV",
      "Stay Tuned"
    ],
    "correct": 0
  },
  {
    "question": "MTV's parent company at launch was?",
    "choices": [
      "Warner-Amex",
      "Viacom",
      "NBC",
      "CBS"
    ],
    "correct": 0
  },
  {
    "question": "Which video has been the most-played in MTV's history (early years)?",
    "choices": [
      "Sledgehammer",
      "Thriller",
      "Take On Me",
      "Beat It"
    ],
    "correct": 0
  },
  {
    "question": "Which long-running MTV dating show began in 1995?",
    "choices": [
      "Singled Out",
      "Next",
      "Date My Mom",
      "Room Raiders"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MtvEraQuizSettings): MtvEraQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MtvEraQuizState, action: MtvEraQuizAction): MtvEraQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MtvEraQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
