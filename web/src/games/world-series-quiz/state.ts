import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WorldSeriesQuizSettings { questions: "10" | "20" | "30"; }
export interface WorldSeriesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WorldSeriesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which team has the most World Series titles?",
    "choices": [
      "Yankees",
      "Cardinals",
      "Dodgers",
      "Giants"
    ],
    "correct": 0
  },
  {
    "question": "How many championships do the Yankees have?",
    "choices": [
      "25",
      "26",
      "27",
      "28"
    ],
    "correct": 2
  },
  {
    "question": "Which team broke an 86-year drought in 2004?",
    "choices": [
      "Red Sox",
      "Cubs",
      "White Sox",
      "Indians"
    ],
    "correct": 0
  },
  {
    "question": "Which team broke a 108-year drought in 2016?",
    "choices": [
      "Cubs",
      "Indians",
      "Red Sox",
      "Astros"
    ],
    "correct": 0
  },
  {
    "question": "Who hit the famous 'called shot'?",
    "choices": [
      "Babe Ruth",
      "Lou Gehrig",
      "Joe DiMaggio",
      "Mickey Mantle"
    ],
    "correct": 0
  },
  {
    "question": "Which team won the 2023 World Series?",
    "choices": [
      "Rangers",
      "Diamondbacks",
      "Astros",
      "Phillies"
    ],
    "correct": 0
  },
  {
    "question": "Who pitched a perfect game in the 1956 World Series?",
    "choices": [
      "Don Larsen",
      "Sandy Koufax",
      "Bob Gibson",
      "Whitey Ford"
    ],
    "correct": 0
  },
  {
    "question": "Which team won the 2020 World Series?",
    "choices": [
      "Dodgers",
      "Rays",
      "Astros",
      "Yankees"
    ],
    "correct": 0
  },
  {
    "question": "Who is known as 'Mr. October'?",
    "choices": [
      "Reggie Jackson",
      "Derek Jeter",
      "Babe Ruth",
      "Yogi Berra"
    ],
    "correct": 0
  },
  {
    "question": "Which team was 'The Curse of the Bambino' about?",
    "choices": [
      "Red Sox",
      "Yankees",
      "Cubs",
      "Indians"
    ],
    "correct": 0
  },
  {
    "question": "Who hit a walk-off HR in the 1993 World Series Game 6?",
    "choices": [
      "Joe Carter",
      "Mitch Williams",
      "Roberto Alomar",
      "Paul Molitor"
    ],
    "correct": 0
  },
  {
    "question": "Which team won the 2017 title (later marred by sign-stealing)?",
    "choices": [
      "Astros",
      "Dodgers",
      "Cubs",
      "Indians"
    ],
    "correct": 0
  },
  {
    "question": "Who hit a famous gimpy walk-off HR in 1988 Game 1?",
    "choices": [
      "Kirk Gibson",
      "Dennis Eckersley",
      "Jose Canseco",
      "Mark McGwire"
    ],
    "correct": 0
  },
  {
    "question": "Which team won the 2021 World Series?",
    "choices": [
      "Braves",
      "Astros",
      "Red Sox",
      "Dodgers"
    ],
    "correct": 0
  },
  {
    "question": "Who managed the 1986 Mets to victory?",
    "choices": [
      "Davey Johnson",
      "Bobby Valentine",
      "Joe Torre",
      "Bobby Cox"
    ],
    "correct": 0
  },
  {
    "question": "What kind of grounder went through Buckner's legs in 1986?",
    "choices": [
      "Mookie Wilson grounder",
      "Knuckleball",
      "Pop fly",
      "Liner"
    ],
    "correct": 0
  },
  {
    "question": "Who was MVP of the 2016 World Series?",
    "choices": [
      "Ben Zobrist",
      "Kris Bryant",
      "Anthony Rizzo",
      "Jon Lester"
    ],
    "correct": 0
  },
  {
    "question": "Which team did the Cubs beat in 2016?",
    "choices": [
      "Indians",
      "Dodgers",
      "Mets",
      "Giants"
    ],
    "correct": 0
  },
  {
    "question": "Who won the 2019 World Series?",
    "choices": [
      "Nationals",
      "Astros",
      "Dodgers",
      "Yankees"
    ],
    "correct": 0
  },
  {
    "question": "Who hit the walk-off HR in 1960 Game 7?",
    "choices": [
      "Bill Mazeroski",
      "Mickey Mantle",
      "Roger Maris",
      "Yogi Berra"
    ],
    "correct": 0
  },
  {
    "question": "Which team won the 2018 World Series?",
    "choices": [
      "Red Sox",
      "Dodgers",
      "Astros",
      "Brewers"
    ],
    "correct": 0
  },
  {
    "question": "Who was the 1955 World Series Game 7 winning pitcher for Brooklyn?",
    "choices": [
      "Johnny Podres",
      "Duke Snider",
      "Jackie Robinson",
      "Roy Campanella"
    ],
    "correct": 0
  },
  {
    "question": "Which Yankee hit 3 HRs in Game 6 in 1977?",
    "choices": [
      "Reggie Jackson",
      "Thurman Munson",
      "Graig Nettles",
      "Bucky Dent"
    ],
    "correct": 0
  },
  {
    "question": "In which year did the Black Sox scandal occur?",
    "choices": [
      "1917",
      "1918",
      "1919",
      "1920"
    ],
    "correct": 2
  },
  {
    "question": "Who recorded the last out of the 2001 World Series?",
    "choices": [
      "Mariano Rivera",
      "Curt Schilling",
      "Randy Johnson",
      "Luis Gonzalez"
    ],
    "correct": 2
  },
  {
    "question": "Which team won the 2022 World Series?",
    "choices": [
      "Astros",
      "Phillies",
      "Braves",
      "Dodgers"
    ],
    "correct": 0
  },
  {
    "question": "Who was MVP of the 2022 World Series?",
    "choices": [
      "Jeremy Pena",
      "Yordan Alvarez",
      "Justin Verlander",
      "Jose Altuve"
    ],
    "correct": 0
  },
  {
    "question": "Which 'Miracle' team upset the Orioles in 1969?",
    "choices": [
      "Mets",
      "Cubs",
      "Pirates",
      "Phillies"
    ],
    "correct": 0
  },
  {
    "question": "Who pitched 10 innings in Game 7 of the 1991 World Series?",
    "choices": [
      "Jack Morris",
      "Tom Glavine",
      "John Smoltz",
      "Jim Kaat"
    ],
    "correct": 0
  },
  {
    "question": "Which year was the World Series cancelled by strike?",
    "choices": [
      "1981",
      "1994",
      "2002",
      "2020"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WorldSeriesQuizSettings): WorldSeriesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WorldSeriesQuizState, action: WorldSeriesQuizAction): WorldSeriesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WorldSeriesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
