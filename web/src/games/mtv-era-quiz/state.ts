import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MtvEraQuizSettings { questions: "10" | "20" | "30"; }
export interface MtvEraQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MtvEraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "MTV launched in?",
    "choices": [
      "1979",
      "1981",
      "1983",
      "1985"
    ],
    "correct": 1
  },
  {
    "question": "First MTV video aired was?",
    "choices": [
      "Thriller",
      "Video Killed the Radio Star",
      "Billie Jean",
      "Take On Me"
    ],
    "correct": 1
  },
  {
    "question": "Michael Jackson's 'Thriller' video aired?",
    "choices": [
      "1981",
      "1983",
      "1984",
      "1985"
    ],
    "correct": 1
  },
  {
    "question": "'I want my MTV' was sung by?",
    "choices": [
      "Sting",
      "Madonna",
      "Mark Knopfler",
      "Mick Jagger"
    ],
    "correct": 2
  },
  {
    "question": "'Take On Me' band?",
    "choices": [
      "a-ha",
      "Tears for Fears",
      "Duran Duran",
      "Wham!"
    ],
    "correct": 0
  },
  {
    "question": "MTV Unplugged was?",
    "choices": [
      "Live show",
      "Acoustic series",
      "News show",
      "Music block"
    ],
    "correct": 1
  },
  {
    "question": "VMAs first held in?",
    "choices": [
      "1981",
      "1982",
      "1984",
      "1986"
    ],
    "correct": 2
  },
  {
    "question": "Kurt Loder hosted?",
    "choices": [
      "TRL",
      "MTV News",
      "Yo MTV Raps",
      "Real World"
    ],
    "correct": 1
  },
  {
    "question": "Beavis and Butt-Head debuted on MTV in?",
    "choices": [
      "1990",
      "1993",
      "1995",
      "1997"
    ],
    "correct": 1
  },
  {
    "question": "Original VJ Martha Quinn co-hosted with?",
    "choices": [
      "JJ Jackson",
      "Mark Goodman",
      "Nina Blackwood",
      "All of these"
    ],
    "correct": 3
  },
  {
    "question": "'Yo! MTV Raps' premiered?",
    "choices": [
      "1985",
      "1987",
      "1988",
      "1991"
    ],
    "correct": 2
  },
  {
    "question": "MTV initials stand for?",
    "choices": [
      "Music Television",
      "Multi TV",
      "Music Tomorrow",
      "Music Tour Vision"
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
