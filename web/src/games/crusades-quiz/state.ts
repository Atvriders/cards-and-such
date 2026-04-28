import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CrusadesQuizSettings { questions: "10" | "20" | "30"; }
export interface CrusadesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CrusadesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First Crusade was called by?",
    "choices": [
      "Pope Urban II",
      "Pope Innocent III",
      "Pope Gregory VII",
      "Pope Leo IX"
    ],
    "correct": 0
  },
  {
    "question": "First Crusade year?",
    "choices": [
      "1054",
      "1066",
      "1095",
      "1099"
    ],
    "correct": 2
  },
  {
    "question": "Jerusalem captured by Crusaders in?",
    "choices": [
      "1095",
      "1099",
      "1187",
      "1204"
    ],
    "correct": 1
  },
  {
    "question": "Saladin retook Jerusalem in?",
    "choices": [
      "1099",
      "1187",
      "1192",
      "1204"
    ],
    "correct": 1
  },
  {
    "question": "Third Crusade leader?",
    "choices": [
      "Frederick I",
      "Richard I",
      "Saladin",
      "All three"
    ],
    "correct": 3
  },
  {
    "question": "Fourth Crusade infamously sacked?",
    "choices": [
      "Cairo",
      "Constantinople",
      "Damascus",
      "Antioch"
    ],
    "correct": 1
  },
  {
    "question": "Knights Templar founded in?",
    "choices": [
      "1099",
      "1119",
      "1187",
      "1200"
    ],
    "correct": 1
  },
  {
    "question": "Children's Crusade was in?",
    "choices": [
      "1095",
      "1212",
      "1244",
      "1291"
    ],
    "correct": 1
  },
  {
    "question": "Acre fell in?",
    "choices": [
      "1187",
      "1191",
      "1244",
      "1291"
    ],
    "correct": 3
  },
  {
    "question": "Albigensian Crusade targeted?",
    "choices": [
      "Muslims",
      "Jews",
      "Cathars",
      "Mongols"
    ],
    "correct": 2
  },
  {
    "question": "Krak des Chevaliers was a?",
    "choices": [
      "City",
      "Castle",
      "Battle",
      "Treaty"
    ],
    "correct": 1
  },
  {
    "question": "Saladin was leader of?",
    "choices": [
      "Seljuks",
      "Ayyubids",
      "Mamluks",
      "Ottomans"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CrusadesQuizSettings): CrusadesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CrusadesQuizState, action: CrusadesQuizAction): CrusadesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CrusadesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
