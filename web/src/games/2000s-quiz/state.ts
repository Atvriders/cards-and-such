import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TwoThousandsQuizSettings { questions: "10" | "15"; }
export interface TwoThousandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TwoThousandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which day did the September 11 attacks occur?",
    "choices": [
      "September 9, 2001",
      "September 10, 2001",
      "September 11, 2001",
      "September 12, 2001"
    ],
    "correct": 2
  },
  {
    "question": "Who founded Facebook in 2004?",
    "choices": [
      "Jack Dorsey",
      "Mark Zuckerberg",
      "Evan Spiegel",
      "Steve Chen"
    ],
    "correct": 1
  },
  {
    "question": "The first iPhone was released in what year?",
    "choices": [
      "2005",
      "2006",
      "2007",
      "2008"
    ],
    "correct": 2
  },
  {
    "question": "Which 2008 U.S. President was the first African American elected?",
    "choices": [
      "George W. Bush",
      "John McCain",
      "Barack Obama",
      "Joe Biden"
    ],
    "correct": 2
  },
  {
    "question": "Which 2004 disaster killed over 200,000 in the Indian Ocean?",
    "choices": [
      "Hurricane",
      "Earthquake",
      "Tsunami",
      "Volcanic eruption"
    ],
    "correct": 2
  },
  {
    "question": "YouTube was founded in?",
    "choices": [
      "2003",
      "2004",
      "2005",
      "2006"
    ],
    "correct": 2
  },
  {
    "question": "Which 2003 film won Best Picture and 11 Academy Awards (LOTR)?",
    "choices": [
      "The Two Towers",
      "Return of the King",
      "Fellowship of the Ring",
      "The Hobbit"
    ],
    "correct": 1
  },
  {
    "question": "Hurricane Katrina devastated which U.S. city in 2005?",
    "choices": [
      "Houston",
      "New Orleans",
      "Mobile",
      "Tampa"
    ],
    "correct": 1
  },
  {
    "question": "Which 2001 country was first invaded by U.S. after 9/11?",
    "choices": [
      "Iraq",
      "Afghanistan",
      "Syria",
      "Libya"
    ],
    "correct": 1
  },
  {
    "question": "The U.S. invaded Iraq in?",
    "choices": [
      "2002",
      "2003",
      "2004",
      "2005"
    ],
    "correct": 1
  },
  {
    "question": "Which 2007 financial crisis triggered the Great Recession?",
    "choices": [
      "Dot-com crash",
      "Subprime mortgage crisis",
      "Asian flu",
      "Black Monday"
    ],
    "correct": 1
  },
  {
    "question": "Which 2009 King of Pop died on June 25?",
    "choices": [
      "Prince",
      "Michael Jackson",
      "David Bowie",
      "Whitney Houston"
    ],
    "correct": 1
  },
  {
    "question": "Twitter launched in?",
    "choices": [
      "2004",
      "2005",
      "2006",
      "2007"
    ],
    "correct": 2
  },
  {
    "question": "Which 2002 currency replaced national notes in 12 EU countries?",
    "choices": [
      "Euro",
      "ECU",
      "Mark",
      "Franc"
    ],
    "correct": 0
  },
  {
    "question": "Which 2000 'hanging chad' U.S. presidential election was decided by Florida?",
    "choices": [
      "Bush vs Gore",
      "Bush vs Kerry",
      "Obama vs McCain",
      "Clinton vs Dole"
    ],
    "correct": 0
  },
  {
    "question": "Pope John Paul II died in what year?",
    "choices": [
      "2003",
      "2004",
      "2005",
      "2006"
    ],
    "correct": 2
  },
  {
    "question": "Which 2008 Beijing event China hosted with great fanfare?",
    "choices": [
      "World Cup",
      "Summer Olympics",
      "Winter Olympics",
      "Asian Games"
    ],
    "correct": 1
  },
  {
    "question": "Which 2001 Pixar/Disney film featured monsters from a closet world?",
    "choices": [
      "Monsters, Inc.",
      "Finding Nemo",
      "Up",
      "Cars"
    ],
    "correct": 0
  },
  {
    "question": "Which 2005 social network was overtaken by Facebook later?",
    "choices": [
      "Friendster",
      "MySpace",
      "Bebo",
      "Orkut"
    ],
    "correct": 1
  },
  {
    "question": "Which 2007 series finale was 'Harry Potter and the Deathly Hallows'?",
    "choices": [
      "Book series",
      "TV series",
      "Video game series",
      "Comic series"
    ],
    "correct": 0
  },
  {
    "question": "Saddam Hussein was executed in what year?",
    "choices": [
      "2004",
      "2005",
      "2006",
      "2007"
    ],
    "correct": 2
  },
  {
    "question": "Which 2008 Pixar film featured a robot left on Earth?",
    "choices": [
      "Up",
      "WALL-E",
      "Ratatouille",
      "Cars"
    ],
    "correct": 1
  },
  {
    "question": "The Human Genome Project was completed in?",
    "choices": [
      "2001",
      "2002",
      "2003",
      "2004"
    ],
    "correct": 2
  },
  {
    "question": "Which 2007 series finale aired for The Sopranos?",
    "choices": [
      "Cut to black",
      "Tony dies",
      "Tony arrested",
      "Tony retires"
    ],
    "correct": 0
  },
  {
    "question": "Which 2002 Winter Olympics city hosted in Utah?",
    "choices": [
      "Salt Lake City",
      "Park City",
      "Denver",
      "Aspen"
    ],
    "correct": 0
  },
  {
    "question": "Wikipedia was launched in?",
    "choices": [
      "2000",
      "2001",
      "2002",
      "2003"
    ],
    "correct": 1
  },
  {
    "question": "Which 2003 Apple service revolutionized digital music sales?",
    "choices": [
      "iPod",
      "iTunes Store",
      "Apple Music",
      "Beats"
    ],
    "correct": 1
  },
  {
    "question": "The Boxing Day tsunami occurred in?",
    "choices": [
      "2003",
      "2004",
      "2005",
      "2006"
    ],
    "correct": 1
  },
  {
    "question": "Which 2006 demoted celestial body lost planet status?",
    "choices": [
      "Ceres",
      "Pluto",
      "Eris",
      "Sedna"
    ],
    "correct": 1
  },
  {
    "question": "Which 2009 Avatar film by James Cameron set box office records?",
    "choices": [
      "Avatar",
      "Titanic 2",
      "Aliens",
      "The Abyss"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TwoThousandsQuizSettings): TwoThousandsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TwoThousandsQuizState, action: TwoThousandsQuizAction): TwoThousandsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TwoThousandsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
