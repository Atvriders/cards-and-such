import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WeaponInventionsQuizSettings { questions: "10" | "20" | "30"; }
export interface WeaponInventionsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WeaponInventionsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Gunpowder originated in?",
    "choices": [
      "China",
      "India",
      "Persia",
      "Rome"
    ],
    "correct": 0
  },
  {
    "question": "Gunpowder reached Europe by the?",
    "choices": [
      "8th century",
      "13th century",
      "17th century",
      "19th century"
    ],
    "correct": 1
  },
  {
    "question": "Longbow famously used by?",
    "choices": [
      "French",
      "English",
      "Spanish",
      "Italians"
    ],
    "correct": 1
  },
  {
    "question": "Crossbow advantage over bow?",
    "choices": [
      "Range",
      "Ease of training",
      "Lightness",
      "Accuracy only"
    ],
    "correct": 1
  },
  {
    "question": "Cannon first widely used in?",
    "choices": [
      "10th century",
      "14th century",
      "18th century",
      "20th century"
    ],
    "correct": 1
  },
  {
    "question": "Musket replaced the?",
    "choices": [
      "Sword",
      "Arquebus",
      "Pistol",
      "Crossbow"
    ],
    "correct": 1
  },
  {
    "question": "Rifling improves?",
    "choices": [
      "Range",
      "Accuracy",
      "Loading speed",
      "Weight"
    ],
    "correct": 1
  },
  {
    "question": "Colt revolver patented in?",
    "choices": [
      "1806",
      "1836",
      "1866",
      "1896"
    ],
    "correct": 1
  },
  {
    "question": "Maxim gun was the first?",
    "choices": [
      "Repeating rifle",
      "Recoil-operated machine gun",
      "Bolt-action",
      "Semi-auto pistol"
    ],
    "correct": 1
  },
  {
    "question": "Gatling gun inventor?",
    "choices": [
      "Maxim",
      "Gatling",
      "Browning",
      "Colt"
    ],
    "correct": 1
  },
  {
    "question": "Dynamite invented by?",
    "choices": [
      "Nobel",
      "Schwarz",
      "Curie",
      "Edison"
    ],
    "correct": 0
  },
  {
    "question": "Dynamite year?",
    "choices": [
      "1847",
      "1867",
      "1887",
      "1907"
    ],
    "correct": 1
  },
  {
    "question": "AK-47 designed by?",
    "choices": [
      "Stoner",
      "Kalashnikov",
      "Browning",
      "Garand"
    ],
    "correct": 1
  },
  {
    "question": "AK-47 introduced in?",
    "choices": [
      "1947",
      "1957",
      "1967",
      "1977"
    ],
    "correct": 0
  },
  {
    "question": "M16 rifle designer?",
    "choices": [
      "Stoner",
      "Garand",
      "Browning",
      "Kalashnikov"
    ],
    "correct": 0
  },
  {
    "question": "Submarine pioneer USS Holland?",
    "choices": [
      "Holland",
      "Bushnell",
      "Fulton",
      "Whitehead"
    ],
    "correct": 0
  },
  {
    "question": "Self-propelled torpedo by?",
    "choices": [
      "Whitehead",
      "Maxim",
      "Nobel",
      "Colt"
    ],
    "correct": 0
  },
  {
    "question": "Tank first used in battle?",
    "choices": [
      "WWI",
      "WWII",
      "Korea",
      "Vietnam"
    ],
    "correct": 0
  },
  {
    "question": "First nuclear weapon used in war year?",
    "choices": [
      "1935",
      "1945",
      "1955",
      "1965"
    ],
    "correct": 1
  },
  {
    "question": "Manhattan Project led by?",
    "choices": [
      "Einstein",
      "Oppenheimer",
      "Fermi",
      "Bohr"
    ],
    "correct": 1
  },
  {
    "question": "Hydrogen bomb first tested in?",
    "choices": [
      "1942",
      "1952",
      "1962",
      "1972"
    ],
    "correct": 1
  },
  {
    "question": "Stealth bomber B-2 era?",
    "choices": [
      "1960s",
      "1980s",
      "2000s",
      "2020s"
    ],
    "correct": 1
  },
  {
    "question": "ICBM stands for?",
    "choices": [
      "Inter-Continental Ballistic Missile",
      "Inter-Country Bomb Missile",
      "Intra-Continental Battle Missile",
      "Internal Combat Bomb Missile"
    ],
    "correct": 0
  },
  {
    "question": "First jet fighter combat use?",
    "choices": [
      "WWI",
      "WWII",
      "Korea",
      "Vietnam"
    ],
    "correct": 1
  },
  {
    "question": "Chemical weapons widely used in?",
    "choices": [
      "WWI",
      "WWII",
      "Korea",
      "Gulf War"
    ],
    "correct": 0
  },
  {
    "question": "Greek fire was used by?",
    "choices": [
      "Romans",
      "Byzantines",
      "Persians",
      "Vikings"
    ],
    "correct": 1
  },
  {
    "question": "Trebuchet is a type of?",
    "choices": [
      "Sword",
      "Siege engine",
      "Cannon",
      "Crossbow"
    ],
    "correct": 1
  },
  {
    "question": "Samurai sword is called?",
    "choices": [
      "Wakizashi",
      "Katana",
      "Tanto",
      "Naginata"
    ],
    "correct": 1
  },
  {
    "question": "Smokeless powder developed in?",
    "choices": [
      "1784",
      "1884",
      "1944",
      "1984"
    ],
    "correct": 1
  },
  {
    "question": "Drone Predator first flew in?",
    "choices": [
      "1974",
      "1994",
      "2004",
      "2014"
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
