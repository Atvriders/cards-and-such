import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AcademyAwardsQuizSettings { questions: "10" | "20"; }
export interface AcademyAwardsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AcademyAwardsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First Academy Awards ceremony was in?",
    "choices": [
      "1924",
      "1929",
      "1934",
      "1939"
    ],
    "correct": 1
  },
  {
    "question": "Statuette nickname?",
    "choices": [
      "Oscar",
      "Tony",
      "Emmy",
      "Grammy"
    ],
    "correct": 0
  },
  {
    "question": "Most-Oscars-ever individual?",
    "choices": [
      "Walt Disney",
      "Steven Spielberg",
      "John Ford",
      "James Cameron"
    ],
    "correct": 0
  },
  {
    "question": "How many career Oscars did Walt Disney win?",
    "choices": [
      "12",
      "16",
      "22",
      "26"
    ],
    "correct": 2
  },
  {
    "question": "Highest-honored Best Director (4 wins)?",
    "choices": [
      "Steven Spielberg",
      "John Ford",
      "William Wyler",
      "Frank Capra"
    ],
    "correct": 1
  },
  {
    "question": "First African-American Best Actor winner?",
    "choices": [
      "Sidney Poitier",
      "Denzel Washington",
      "Forest Whitaker",
      "Jamie Foxx"
    ],
    "correct": 0
  },
  {
    "question": "Picture famously misannounced in 2017?",
    "choices": [
      "Moonlight",
      "La La Land (announced first)",
      "Both",
      "Birdman"
    ],
    "correct": 2
  },
  {
    "question": "First woman Best Director winner?",
    "choices": [
      "Sofia Coppola",
      "Kathryn Bigelow",
      "Jane Campion",
      "Chloé Zhao"
    ],
    "correct": 1
  },
  {
    "question": "Best Picture for 'Hurt Locker' was in?",
    "choices": [
      "2008",
      "2009",
      "2010",
      "2011"
    ],
    "correct": 1
  },
  {
    "question": "Who hosted Oscars most times?",
    "choices": [
      "Bob Hope",
      "Billy Crystal",
      "Johnny Carson",
      "Whoopi Goldberg"
    ],
    "correct": 0
  },
  {
    "question": "Which film holds the record for most wins (11)?",
    "choices": [
      "Ben-Hur",
      "Titanic",
      "LOTR: Return of the King",
      "All three tie"
    ],
    "correct": 3
  },
  {
    "question": "First non-English Best Picture?",
    "choices": [
      "Crouching Tiger",
      "Parasite",
      "Roma",
      "The Artist"
    ],
    "correct": 1
  },
  {
    "question": "Year 'Parasite' won Best Picture?",
    "choices": [
      "2018",
      "2019",
      "2020",
      "2021"
    ],
    "correct": 2
  },
  {
    "question": "Marlon Brando declined Oscar in 1973 over?",
    "choices": [
      "Pay",
      "Native American treatment",
      "Other awards",
      "Personal feud"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AcademyAwardsQuizSettings): AcademyAwardsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AcademyAwardsQuizState, action: AcademyAwardsQuizAction): AcademyAwardsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AcademyAwardsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
