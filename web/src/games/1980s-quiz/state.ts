import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen80sQuizSettings { questions: "10" | "15"; }
export interface Nineteen80sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen80sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "MTV launched in what year?",
    "choices": [
      "1979",
      "1981",
      "1983",
      "1985"
    ],
    "correct": 1
  },
  {
    "question": "Who was U.S. President for most of the 1980s?",
    "choices": [
      "Carter",
      "Reagan",
      "Bush Sr.",
      "Clinton"
    ],
    "correct": 1
  },
  {
    "question": "Michael Jackson's 1982 album was?",
    "choices": [
      "Off the Wall",
      "Thriller",
      "Bad",
      "Dangerous"
    ],
    "correct": 1
  },
  {
    "question": "The Berlin Wall fell in?",
    "choices": [
      "1987",
      "1989",
      "1991",
      "1993"
    ],
    "correct": 1
  },
  {
    "question": "Which arcade game featured a yellow circle eating dots?",
    "choices": [
      "Galaga",
      "Pac-Man",
      "Donkey Kong",
      "Defender"
    ],
    "correct": 1
  },
  {
    "question": "Madonna's debut album was released in?",
    "choices": [
      "1981",
      "1983",
      "1985",
      "1987"
    ],
    "correct": 1
  },
  {
    "question": "Which 1985 film featured a DeLorean time machine?",
    "choices": [
      "The Terminator",
      "Back to the Future",
      "WarGames",
      "Brazil"
    ],
    "correct": 1
  },
  {
    "question": "The 1986 disaster at Chernobyl was a?",
    "choices": [
      "Earthquake",
      "Nuclear meltdown",
      "Plane crash",
      "Hurricane"
    ],
    "correct": 1
  },
  {
    "question": "IBM PC was introduced in?",
    "choices": [
      "1979",
      "1981",
      "1983",
      "1985"
    ],
    "correct": 1
  },
  {
    "question": "Which Soviet leader started Perestroika?",
    "choices": [
      "Brezhnev",
      "Andropov",
      "Gorbachev",
      "Yeltsin"
    ],
    "correct": 2
  },
  {
    "question": "Live Aid concert took place in?",
    "choices": [
      "1983",
      "1985",
      "1987",
      "1989"
    ],
    "correct": 1
  },
  {
    "question": "The Rubik's Cube became a worldwide craze in?",
    "choices": [
      "1979",
      "1981",
      "1983",
      "1985"
    ],
    "correct": 1
  },
  {
    "question": "Which 1984 film featured Eddie Murphy as Axel Foley?",
    "choices": [
      "48 Hours",
      "Trading Places",
      "Beverly Hills Cop",
      "Coming to America"
    ],
    "correct": 2
  },
  {
    "question": "Princess Diana married Prince Charles in?",
    "choices": [
      "1979",
      "1981",
      "1983",
      "1985"
    ],
    "correct": 1
  },
  {
    "question": "Which arcade hit had ghosts named Blinky, Pinky, Inky, and Clyde?",
    "choices": [
      "Galaga",
      "Centipede",
      "Pac-Man",
      "Frogger"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen80sQuizSettings): Nineteen80sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen80sQuizState, action: Nineteen80sQuizAction): Nineteen80sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen80sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
