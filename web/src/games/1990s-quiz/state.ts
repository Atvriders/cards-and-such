import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen90sQuizSettings { questions: "10" | "15"; }
export interface Nineteen90sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen90sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which Seattle band's 'Smells Like Teen Spirit' came out in 1991?",
    "choices": [
      "Pearl Jam",
      "Soundgarden",
      "Nirvana",
      "Alice in Chains"
    ],
    "correct": 2
  },
  {
    "question": "Which sitcom about 'nothing' aired from 1989-1998?",
    "choices": [
      "Cheers",
      "Seinfeld",
      "Friends",
      "Frasier"
    ],
    "correct": 1
  },
  {
    "question": "Tim Berners-Lee invented what at CERN?",
    "choices": [
      "Email",
      "Internet",
      "World Wide Web",
      "Search engine"
    ],
    "correct": 2
  },
  {
    "question": "Which 1994 film starred Tom Hanks running a lot?",
    "choices": [
      "Big",
      "Apollo 13",
      "Forrest Gump",
      "Cast Away"
    ],
    "correct": 2
  },
  {
    "question": "The Soviet Union dissolved in?",
    "choices": [
      "1989",
      "1991",
      "1993",
      "1995"
    ],
    "correct": 1
  },
  {
    "question": "Which 1993 film featured cloned dinosaurs?",
    "choices": [
      "Independence Day",
      "Jurassic Park",
      "Twister",
      "Anaconda"
    ],
    "correct": 1
  },
  {
    "question": "Microsoft Windows 95 launched in?",
    "choices": [
      "1993",
      "1995",
      "1997",
      "1999"
    ],
    "correct": 1
  },
  {
    "question": "Princess Diana died in?",
    "choices": [
      "1995",
      "1997",
      "1999",
      "2001"
    ],
    "correct": 1
  },
  {
    "question": "Which boy band released 'I Want It That Way' in 1999?",
    "choices": [
      "NSYNC",
      "Backstreet Boys",
      "98 Degrees",
      "Boyzone"
    ],
    "correct": 1
  },
  {
    "question": "Which 1997 film became the highest-grossing of the decade?",
    "choices": [
      "Independence Day",
      "Titanic",
      "The Lion King",
      "Star Wars Episode I"
    ],
    "correct": 1
  },
  {
    "question": "Which video game console launched in 1994 (in Japan) by Sony?",
    "choices": [
      "Nintendo 64",
      "Sega Saturn",
      "PlayStation",
      "Dreamcast"
    ],
    "correct": 2
  },
  {
    "question": "Bill Clinton's VP was?",
    "choices": [
      "Bush Sr.",
      "Al Gore",
      "Dan Quayle",
      "Joe Biden"
    ],
    "correct": 1
  },
  {
    "question": "The hit show 'Friends' premiered in?",
    "choices": [
      "1992",
      "1994",
      "1996",
      "1998"
    ],
    "correct": 1
  },
  {
    "question": "Which rapper released 'The Chronic' in 1992?",
    "choices": [
      "Tupac",
      "Snoop Dogg",
      "Dr. Dre",
      "Ice Cube"
    ],
    "correct": 2
  },
  {
    "question": "Y2K bug worried about?",
    "choices": [
      "Spaceships crashing",
      "Computers misreading dates",
      "Power grids exploding",
      "Phones jamming"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen90sQuizSettings): Nineteen90sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen90sQuizState, action: Nineteen90sQuizAction): Nineteen90sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen90sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
