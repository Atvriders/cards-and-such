import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HorsesQuizSettings { questions: "10" | "20"; }
export interface HorsesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HorsesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Thoroughbred is bred primarily for?",
    "choices": [
      "Racing",
      "Plowing",
      "Riding ranch",
      "Dressage only"
    ],
    "correct": 0
  },
  {
    "question": "The Thoroughbred originated in?",
    "choices": [
      "England",
      "Arabia",
      "France",
      "Spain"
    ],
    "correct": 0
  },
  {
    "question": "The Arabian horse originated in?",
    "choices": [
      "Arabian peninsula",
      "Persia",
      "Egypt",
      "Spain"
    ],
    "correct": 0
  },
  {
    "question": "Arabians are known for?",
    "choices": [
      "Endurance",
      "Sprinting only",
      "Plowing",
      "Sled pulling"
    ],
    "correct": 0
  },
  {
    "question": "American Quarter Horse is fastest at?",
    "choices": [
      "Quarter mile sprint",
      "Marathon",
      "Long endurance",
      "Jumping"
    ],
    "correct": 0
  },
  {
    "question": "Friesians are famous for being?",
    "choices": [
      "Black with feathered legs",
      "Spotted",
      "Palomino",
      "Pinto"
    ],
    "correct": 0
  },
  {
    "question": "Friesians are from?",
    "choices": [
      "Netherlands",
      "Germany",
      "Belgium",
      "Denmark"
    ],
    "correct": 0
  },
  {
    "question": "Andalusians are from?",
    "choices": [
      "Spain",
      "Portugal",
      "Italy",
      "France"
    ],
    "correct": 0
  },
  {
    "question": "Lipizzaners are famous for?",
    "choices": [
      "Spanish Riding School",
      "Dressage only",
      "Racing",
      "Polo"
    ],
    "correct": 0
  },
  {
    "question": "Lipizzaners are typically?",
    "choices": [
      "Born dark, turn white",
      "Born white",
      "Always black",
      "Always brown"
    ],
    "correct": 0
  },
  {
    "question": "Clydesdales are a?",
    "choices": [
      "Draft horse",
      "Racing horse",
      "Pony",
      "Show jumper"
    ],
    "correct": 0
  },
  {
    "question": "Clydesdales originated in?",
    "choices": [
      "Scotland",
      "England",
      "Ireland",
      "Wales"
    ],
    "correct": 0
  },
  {
    "question": "Shire horses are among the world's largest by?",
    "choices": [
      "Weight/height",
      "Lifespan",
      "Speed",
      "Gait variety"
    ],
    "correct": 0
  },
  {
    "question": "Shires originated in?",
    "choices": [
      "England",
      "Scotland",
      "France",
      "Germany"
    ],
    "correct": 0
  },
  {
    "question": "Mustangs are wild horses of the?",
    "choices": [
      "American West",
      "Australia",
      "Africa",
      "Mongolia"
    ],
    "correct": 0
  },
  {
    "question": "Appaloosas are famous for?",
    "choices": [
      "Spotted coats",
      "Black coats",
      "White coats",
      "Pinto patterns"
    ],
    "correct": 0
  },
  {
    "question": "Pintos are?",
    "choices": [
      "Two-color patches",
      "Single color",
      "Spotted",
      "Always black"
    ],
    "correct": 0
  },
  {
    "question": "Palominos are?",
    "choices": [
      "Golden with white mane",
      "Black",
      "Spotted",
      "Pinto"
    ],
    "correct": 0
  },
  {
    "question": "Tennessee Walking Horses are known for?",
    "choices": [
      "Smooth gait",
      "Speed only",
      "Jumping",
      "Plowing"
    ],
    "correct": 0
  },
  {
    "question": "The four natural gaits are?",
    "choices": [
      "Walk/trot/canter/gallop",
      "Walk/jog/run/sprint",
      "Walk/pace/canter/gallop",
      "Walk/pace/run/sprint"
    ],
    "correct": 0
  },
  {
    "question": "Secretariat won which championship?",
    "choices": [
      "1973 Triple Crown",
      "1980 Belmont",
      "1996 Kentucky",
      "2003 Preakness"
    ],
    "correct": 0
  },
  {
    "question": "The Triple Crown consists of?",
    "choices": [
      "KY Derby/Preakness/Belmont",
      "KY/Belmont/Travers",
      "KY/Preakness/Travers",
      "Belmont/Preakness/Travers"
    ],
    "correct": 0
  },
  {
    "question": "The Kentucky Derby is held at?",
    "choices": [
      "Churchill Downs",
      "Belmont Park",
      "Pimlico",
      "Saratoga"
    ],
    "correct": 0
  },
  {
    "question": "Man o' War raced in?",
    "choices": [
      "1919-1920",
      "1973",
      "1990",
      "2000"
    ],
    "correct": 0
  },
  {
    "question": "Seabiscuit's career peaked in?",
    "choices": [
      "Late 1930s",
      "1920s",
      "1950s",
      "1990s"
    ],
    "correct": 0
  },
  {
    "question": "Dressage is judged on?",
    "choices": [
      "Precision/grace",
      "Speed only",
      "Jumping height",
      "Endurance"
    ],
    "correct": 0
  },
  {
    "question": "Show jumping rewards?",
    "choices": [
      "Clean rounds quickly",
      "Smooth gait",
      "Endurance",
      "Style"
    ],
    "correct": 0
  },
  {
    "question": "Eventing combines?",
    "choices": [
      "Dressage/cross-country/jumping",
      "Racing/dressage",
      "Polo/jumping",
      "Plowing/racing"
    ],
    "correct": 0
  },
  {
    "question": "Polo originated in?",
    "choices": [
      "Persia/Central Asia",
      "England",
      "Spain",
      "Argentina"
    ],
    "correct": 0
  },
  {
    "question": "Horses' height is measured in?",
    "choices": [
      "Hands",
      "Feet",
      "Inches",
      "Meters"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HorsesQuizSettings): HorsesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HorsesQuizState, action: HorsesQuizAction): HorsesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HorsesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
