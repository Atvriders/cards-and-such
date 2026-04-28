import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ArtHeistsQuizSettings { questions: "10" | "20"; }
export interface ArtHeistsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ArtHeistsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "What was stolen from the Louvre in 1911?",
    "choices": [
      "The Mona Lisa",
      "Liberty Leading the People",
      "The Coronation of Napoleon",
      "Venus de Milo"
    ],
    "correct": 0
  },
  {
    "question": "Year of the Isabella Stewart Gardner heist?",
    "choices": [
      "1985",
      "1990",
      "1996",
      "2001"
    ],
    "correct": 1
  },
  {
    "question": "Which Vermeer was stolen in the Gardner heist?",
    "choices": [
      "Girl with a Pearl Earring",
      "The Concert",
      "The Milkmaid",
      "The Geographer"
    ],
    "correct": 1
  },
  {
    "question": "City of the Gardner Museum?",
    "choices": [
      "New York",
      "Boston",
      "Philadelphia",
      "Chicago"
    ],
    "correct": 1
  },
  {
    "question": "Munch painting stolen in Oslo (2004, recovered 2006)?",
    "choices": [
      "The Sun",
      "The Scream",
      "Starry Night",
      "Madonna"
    ],
    "correct": 1
  },
  {
    "question": "Vincenzo Peruggia stole the Mona Lisa to?",
    "choices": [
      "Sell it",
      "Return it to Italy",
      "Keep at home",
      "Frame a rival"
    ],
    "correct": 1
  },
  {
    "question": "How long was the Mona Lisa missing?",
    "choices": [
      "3 weeks",
      "9 months",
      "Just over 2 years",
      "5 years"
    ],
    "correct": 2
  },
  {
    "question": "Approximate value (today) of Gardner stolen art?",
    "choices": [
      "$50 million",
      "$200 million",
      "$500 million",
      "$5 billion"
    ],
    "correct": 2
  },
  {
    "question": "Stéphane Breitwieser is famous for stealing how many works?",
    "choices": [
      "~6",
      "~30",
      "~100",
      "~239"
    ],
    "correct": 3
  },
  {
    "question": "Paris Modern Art Museum was hit in?",
    "choices": [
      "2008",
      "2010",
      "2013",
      "2018"
    ],
    "correct": 1
  },
  {
    "question": "Edvard Munch's 'The Scream' is from which country?",
    "choices": [
      "Sweden",
      "Norway",
      "Denmark",
      "Germany"
    ],
    "correct": 1
  },
  {
    "question": "Rembrandt's only seascape was stolen in which heist?",
    "choices": [
      "Gardner",
      "Louvre",
      "Van Gogh Museum",
      "Kunsthal"
    ],
    "correct": 0
  },
  {
    "question": "The Gardner thieves disguised themselves as?",
    "choices": [
      "Construction workers",
      "Tourists",
      "Police officers",
      "Custodians"
    ],
    "correct": 2
  },
  {
    "question": "Most stolen artist's name in history?",
    "choices": [
      "Picasso",
      "Van Gogh",
      "Rembrandt",
      "Monet"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ArtHeistsQuizSettings): ArtHeistsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ArtHeistsQuizState, action: ArtHeistsQuizAction): ArtHeistsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ArtHeistsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
