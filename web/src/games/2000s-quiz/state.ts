import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TwoThousandsQuizSettings { questions: "10" | "15"; }
export interface TwoThousandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TwoThousandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The 9/11 terrorist attacks happened in what year?",
    "choices": [
      "2000",
      "2001",
      "2002",
      "2003"
    ],
    "correct": 1
  },
  {
    "question": "Apple introduced the iPod in?",
    "choices": [
      "1999",
      "2001",
      "2003",
      "2005"
    ],
    "correct": 1
  },
  {
    "question": "Facebook was founded in?",
    "choices": [
      "2002",
      "2004",
      "2006",
      "2008"
    ],
    "correct": 1
  },
  {
    "question": "Which Harry Potter book ended the series in 2007?",
    "choices": [
      "Half-Blood Prince",
      "Goblet of Fire",
      "Deathly Hallows",
      "Order of Phoenix"
    ],
    "correct": 2
  },
  {
    "question": "YouTube was launched in?",
    "choices": [
      "2003",
      "2005",
      "2007",
      "2009"
    ],
    "correct": 1
  },
  {
    "question": "Iraq War began in?",
    "choices": [
      "2001",
      "2003",
      "2005",
      "2007"
    ],
    "correct": 1
  },
  {
    "question": "The first iPhone was released in?",
    "choices": [
      "2005",
      "2006",
      "2007",
      "2008"
    ],
    "correct": 2
  },
  {
    "question": "Hurricane Katrina hit New Orleans in?",
    "choices": [
      "2003",
      "2005",
      "2007",
      "2009"
    ],
    "correct": 1
  },
  {
    "question": "Which 2003 film won Best Picture Oscar (LOTR finale)?",
    "choices": [
      "Two Towers",
      "Return of the King",
      "Fellowship",
      "Hobbit"
    ],
    "correct": 1
  },
  {
    "question": "Barack Obama was elected President in?",
    "choices": [
      "2004",
      "2008",
      "2012",
      "2016"
    ],
    "correct": 1
  },
  {
    "question": "Which reality singing show debuted in 2002?",
    "choices": [
      "The Voice",
      "X Factor",
      "American Idol",
      "Pop Idol"
    ],
    "correct": 2
  },
  {
    "question": "The 2008 financial crisis was triggered largely by?",
    "choices": [
      "Tech bubble",
      "Housing bubble",
      "Oil shock",
      "Banking strike"
    ],
    "correct": 1
  },
  {
    "question": "Which Pixar film featured a robot in 2008?",
    "choices": [
      "Cars",
      "Up",
      "WALL-E",
      "Ratatouille"
    ],
    "correct": 2
  },
  {
    "question": "Britney Spears released 'Toxic' in?",
    "choices": [
      "2002",
      "2004",
      "2006",
      "2008"
    ],
    "correct": 1
  },
  {
    "question": "Twitter was founded in?",
    "choices": [
      "2004",
      "2006",
      "2008",
      "2010"
    ],
    "correct": 1
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
