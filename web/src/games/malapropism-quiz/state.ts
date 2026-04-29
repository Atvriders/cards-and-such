import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MalapropismQuizSettings { questions: "8" | "10" | "12"; }
export interface MalapropismQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MalapropismQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "He's the very pineapple of politeness — should be?",
    "choices": [
      "pinnacle",
      "pineapple",
      "pin",
      "prince"
    ],
    "correct": 0
  },
  {
    "question": "Texas has a lot of electrical votes — should be?",
    "choices": [
      "electoral",
      "electric",
      "elective",
      "electronic"
    ],
    "correct": 0
  },
  {
    "question": "Dance a flamingo — should be?",
    "choices": [
      "flamenco",
      "flamboyant",
      "flannel",
      "flagrant"
    ],
    "correct": 0
  },
  {
    "question": "I'm not under the affluence of alcohol — should be?",
    "choices": [
      "influence",
      "affluence",
      "effluent",
      "afferent"
    ],
    "correct": 0
  },
  {
    "question": "He's a wolf in cheap clothing — should be?",
    "choices": [
      "sheep's",
      "cheap",
      "sheik's",
      "sheath's"
    ],
    "correct": 0
  },
  {
    "question": "A rolling stone gathers no moths — should be?",
    "choices": [
      "moss",
      "moths",
      "mosses",
      "myths"
    ],
    "correct": 0
  },
  {
    "question": "My sister has extra-century perception — should be?",
    "choices": [
      "extra-sensory",
      "extra-century",
      "extra-cent",
      "extra-cellular"
    ],
    "correct": 0
  },
  {
    "question": "Don't be a sycophant of the establishment — homophonic mistake might be?",
    "choices": [
      "sycophant correct, no malaprop",
      "syco",
      "cycle",
      "cyclonic"
    ],
    "correct": 0
  },
  {
    "question": "He had to use a fire distinguisher — should be?",
    "choices": [
      "extinguisher",
      "distinguisher",
      "extinguisher",
      "exorciser"
    ],
    "correct": 0
  },
  {
    "question": "We need to nip it in the butt — should be?",
    "choices": [
      "bud",
      "butt",
      "but",
      "bot"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MalapropismQuizSettings): MalapropismQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MalapropismQuizState, action: MalapropismQuizAction): MalapropismQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MalapropismQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
