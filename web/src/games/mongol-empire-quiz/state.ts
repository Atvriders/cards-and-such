import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MongolEmpireQuizSettings { questions: "10" | "20" | "30"; }
export interface MongolEmpireQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MongolEmpireQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Founder of the Mongol Empire?",
    "choices": [
      "Kublai Khan",
      "Genghis Khan",
      "Ogedei",
      "Tamerlane"
    ],
    "correct": 1
  },
  {
    "question": "Genghis Khan was born around?",
    "choices": [
      "1067",
      "1162",
      "1230",
      "1300"
    ],
    "correct": 1
  },
  {
    "question": "Mongol Empire at its peak was?",
    "choices": [
      "The smallest land empire",
      "The largest contiguous land empire",
      "Maritime",
      "Religious"
    ],
    "correct": 1
  },
  {
    "question": "Kublai Khan founded which dynasty in China?",
    "choices": [
      "Tang",
      "Yuan",
      "Ming",
      "Qing"
    ],
    "correct": 1
  },
  {
    "question": "Mongol postal/messenger system was?",
    "choices": [
      "Pony Express",
      "Yam",
      "Cursus Publicus",
      "Mail-cart"
    ],
    "correct": 1
  },
  {
    "question": "Mongol legal code was?",
    "choices": [
      "Yassa",
      "Dharma",
      "Sharia",
      "Lex"
    ],
    "correct": 0
  },
  {
    "question": "Ogedei Khan was Genghis's?",
    "choices": [
      "Brother",
      "Son and successor",
      "Father",
      "Grandson"
    ],
    "correct": 1
  },
  {
    "question": "Mongols invaded Hungary and Poland in?",
    "choices": [
      "1100s",
      "1241",
      "1300s",
      "1400s"
    ],
    "correct": 1
  },
  {
    "question": "Pax Mongolica enabled what across Eurasia?",
    "choices": [
      "Plague only",
      "Stable trade and travel",
      "War only",
      "Famine"
    ],
    "correct": 1
  },
  {
    "question": "Marco Polo visited the court of?",
    "choices": [
      "Genghis",
      "Kublai",
      "Tamerlane",
      "Hulagu"
    ],
    "correct": 1
  },
  {
    "question": "Hulagu Khan sacked Baghdad in?",
    "choices": [
      "1100",
      "1258",
      "1300",
      "1402"
    ],
    "correct": 1
  },
  {
    "question": "Tamerlane (Timur) was ethnically?",
    "choices": [
      "Mongol-Turkic",
      "Persian",
      "Han Chinese",
      "Arab"
    ],
    "correct": 0
  },
  {
    "question": "The Golden Horde ruled?",
    "choices": [
      "Persia",
      "Russia and the steppes",
      "China",
      "India"
    ],
    "correct": 1
  },
  {
    "question": "Mongol cavalry's primary weapon?",
    "choices": [
      "Crossbow",
      "Composite bow",
      "Pike",
      "Halberd"
    ],
    "correct": 1
  },
  {
    "question": "Yuan dynasty fell in?",
    "choices": [
      "1300",
      "1368",
      "1453",
      "1500"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MongolEmpireQuizSettings): MongolEmpireQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MongolEmpireQuizState, action: MongolEmpireQuizAction): MongolEmpireQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MongolEmpireQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
