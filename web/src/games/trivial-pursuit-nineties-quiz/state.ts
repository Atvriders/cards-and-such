import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrivialPursuitNinetiesQuizSettings { questions: "10"; }
export interface TrivialPursuitNinetiesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrivialPursuitNinetiesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Trivial Pursuit 1990s focuses entirely on?",
    "choices": [
      "The 1990s decade",
      "All decades",
      "Sports",
      "Films only"
    ],
    "correct": 0
  },
  {
    "question": "Which 1990s sitcom ran from 1990 to 1995?",
    "choices": [
      "Seinfeld",
      "Friends",
      "Frasier",
      "Fresh Prince of Bel-Air"
    ],
    "correct": 3
  },
  {
    "question": "Which 1990s film won Best Picture in 1994?",
    "choices": [
      "Forrest Gump",
      "Pulp Fiction",
      "The Shawshank Redemption",
      "Quiz Show"
    ],
    "correct": 0
  },
  {
    "question": "'I Will Always Love You' in 1992 was sung by?",
    "choices": [
      "Mariah Carey",
      "Whitney Houston",
      "Celine Dion",
      "Madonna"
    ],
    "correct": 1
  },
  {
    "question": "Which 1995 OS launched a Windows tile bar?",
    "choices": [
      "Windows 95",
      "Windows 98",
      "Windows ME",
      "Windows NT"
    ],
    "correct": 0
  },
  {
    "question": "Which Mac/PC web browser launched in 1994?",
    "choices": [
      "Mosaic",
      "Netscape Navigator",
      "Internet Explorer",
      "Firefox"
    ],
    "correct": 1
  },
  {
    "question": "'Macarena' became a U.S. hit in?",
    "choices": [
      "1992",
      "1993",
      "1995",
      "1996"
    ],
    "correct": 3
  },
  {
    "question": "Beanie Babies craze peaked in which decade?",
    "choices": [
      "1980s",
      "1990s",
      "2000s",
      "2010s"
    ],
    "correct": 1
  },
  {
    "question": "Princess Diana died in?",
    "choices": [
      "1995",
      "1996",
      "1997",
      "1999"
    ],
    "correct": 2
  },
  {
    "question": "Which video game console launched in 1994?",
    "choices": [
      "PlayStation",
      "Nintendo 64",
      "Dreamcast",
      "GameCube"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TrivialPursuitNinetiesQuizSettings): TrivialPursuitNinetiesQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrivialPursuitNinetiesQuizState, action: TrivialPursuitNinetiesQuizAction): TrivialPursuitNinetiesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrivialPursuitNinetiesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
