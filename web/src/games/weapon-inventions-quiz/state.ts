import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WeaponInventionsQuizSettings { questions: "10" | "20" | "30"; }
export interface WeaponInventionsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WeaponInventionsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Gunpowder was first developed in?",
    "choices": [
      "China (Tang/Song)",
      "Greece",
      "Egypt",
      "Rome"
    ],
    "correct": 0
  },
  {
    "question": "Longbow was famously used at?",
    "choices": [
      "Hastings 1066",
      "Agincourt 1415",
      "Cannae",
      "Marathon"
    ],
    "correct": 1
  },
  {
    "question": "Maxim gun was an early?",
    "choices": [
      "Bayonet",
      "Self-powered machine gun",
      "Cannon",
      "Crossbow"
    ],
    "correct": 1
  },
  {
    "question": "AK-47 designer?",
    "choices": [
      "Stoner",
      "Kalashnikov",
      "Garand",
      "Browning"
    ],
    "correct": 1
  },
  {
    "question": "Year AK-47 entered service?",
    "choices": [
      "1939",
      "1949",
      "1959",
      "1969"
    ],
    "correct": 1
  },
  {
    "question": "Atomic bomb first used militarily at?",
    "choices": [
      "Tokyo only",
      "Hiroshima and Nagasaki (1945)",
      "Berlin",
      "Pearl Harbor"
    ],
    "correct": 1
  },
  {
    "question": "Crossbow rose to prominence in medieval?",
    "choices": [
      "Scandinavia",
      "Europe and China",
      "South America",
      "Africa"
    ],
    "correct": 1
  },
  {
    "question": "Trebuchet is a type of?",
    "choices": [
      "Sword",
      "Counterweight siege engine",
      "Helmet",
      "Shield"
    ],
    "correct": 1
  },
  {
    "question": "Bayonet originated as?",
    "choices": [
      "Pistol attachment",
      "Plug bayonet for muskets",
      "Cannon ball",
      "Tank shell"
    ],
    "correct": 1
  },
  {
    "question": "Tank first used in combat?",
    "choices": [
      "WWI (1916, Somme)",
      "WWII",
      "Crimean War",
      "Civil War"
    ],
    "correct": 0
  },
  {
    "question": "First nuclear submarine?",
    "choices": [
      "USS Nautilus (1954)",
      "K-19 1958",
      "USS Skipjack 1959",
      "Triton 1961"
    ],
    "correct": 0
  },
  {
    "question": "Greek fire was a weapon of the?",
    "choices": [
      "Persians",
      "Byzantines",
      "Romans",
      "Mongols"
    ],
    "correct": 1
  },
  {
    "question": "Medieval plate armor peaked in?",
    "choices": [
      "1100s",
      "15th-16th centuries",
      "1700s",
      "1800s"
    ],
    "correct": 1
  },
  {
    "question": "First successful repeating rifle?",
    "choices": [
      "Henry/Spencer mid-1800s",
      "Brown Bess",
      "AK-47",
      "M16"
    ],
    "correct": 0
  },
  {
    "question": "Cruise missiles guidance often uses?",
    "choices": [
      "Stars only",
      "GPS and TERCOM",
      "Compass only",
      "Radio relay"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WeaponInventionsQuizSettings): WeaponInventionsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WeaponInventionsQuizState, action: WeaponInventionsQuizAction): WeaponInventionsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WeaponInventionsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
