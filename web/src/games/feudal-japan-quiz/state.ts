import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FeudalJapanQuizSettings { questions: "10" | "20" | "30"; }
export interface FeudalJapanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FeudalJapanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The samurai code of honor was called?",
    "choices": [
      "Zen",
      "Bushido",
      "Kabuki",
      "Sumo"
    ],
    "correct": 1
  },
  {
    "question": "Who was the supreme military leader called?",
    "choices": [
      "Emperor",
      "Shogun",
      "Daimyo",
      "Ronin"
    ],
    "correct": 1
  },
  {
    "question": "A masterless samurai was a?",
    "choices": [
      "Daimyo",
      "Ronin",
      "Ninja",
      "Geisha"
    ],
    "correct": 1
  },
  {
    "question": "Tokugawa shogunate ruled from which year onward?",
    "choices": [
      "1192",
      "1603",
      "1700",
      "1850"
    ],
    "correct": 1
  },
  {
    "question": "Feudal lords in Japan were called?",
    "choices": [
      "Daimyo",
      "Shogun",
      "Sensei",
      "Bonze"
    ],
    "correct": 0
  },
  {
    "question": "The capital of the Tokugawa shogunate was?",
    "choices": [
      "Kyoto",
      "Edo (Tokyo)",
      "Osaka",
      "Nara"
    ],
    "correct": 1
  },
  {
    "question": "Sword most associated with samurai?",
    "choices": [
      "Wakizashi",
      "Katana",
      "Tanto",
      "Naginata"
    ],
    "correct": 1
  },
  {
    "question": "Sakoku policy refers to?",
    "choices": [
      "Open trade",
      "National isolation",
      "Tax reform",
      "Religion"
    ],
    "correct": 1
  },
  {
    "question": "The Meiji Restoration ended feudalism in?",
    "choices": [
      "1853",
      "1868",
      "1900",
      "1920"
    ],
    "correct": 1
  },
  {
    "question": "Tea ceremony master Sen no Rikyu lived in the?",
    "choices": [
      "12th century",
      "16th century",
      "19th century",
      "20th century"
    ],
    "correct": 1
  },
  {
    "question": "Ninja are also known as?",
    "choices": [
      "Shinobi",
      "Senpai",
      "Sensei",
      "Sumo"
    ],
    "correct": 0
  },
  {
    "question": "Battle of Sekigahara (1600) led to?",
    "choices": [
      "Mongol defeat",
      "Tokugawa supremacy",
      "Meiji rule",
      "Heian era"
    ],
    "correct": 1
  },
  {
    "question": "Heian period is famous for?",
    "choices": [
      "War",
      "Court literature like Tale of Genji",
      "Industry",
      "Maritime trade"
    ],
    "correct": 1
  },
  {
    "question": "Samurai ritual suicide was called?",
    "choices": [
      "Seppuku",
      "Hara",
      "Kabuki",
      "Bushido"
    ],
    "correct": 0
  },
  {
    "question": "Japanese feudal castle keep is called?",
    "choices": [
      "Tenshu",
      "Pagoda",
      "Torii",
      "Dojo"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FeudalJapanQuizSettings): FeudalJapanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FeudalJapanQuizState, action: FeudalJapanQuizAction): FeudalJapanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FeudalJapanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
