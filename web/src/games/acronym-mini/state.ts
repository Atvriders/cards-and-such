import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AcronymMiniSettings { questions: "8" | "10" | "12"; }
export interface AcronymMiniState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AcronymMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "NASA stands for?",
    "choices": [
      "National Aero Society",
      "National Aeronautics and Space Administration",
      "North American Space Agency",
      "New Aerospace Society"
    ],
    "correct": 1
  },
  {
    "question": "LASER acronym?",
    "choices": [
      "Light Amplification by Stimulated Emission of Radiation",
      "Long Active System for Electromagnetic Radiation",
      "Linked Atomic Source for Energy Release",
      "Laser Active System Emission Radio"
    ],
    "correct": 0
  },
  {
    "question": "SCUBA acronym?",
    "choices": [
      "Self Contained Underwater Breathing Apparatus",
      "Submarine Crew Underwater Boat Assistance",
      "Sub-Coastal Unit Boat Apparatus",
      "System Carrier Underwater Breath Aid"
    ],
    "correct": 0
  },
  {
    "question": "RADAR acronym?",
    "choices": [
      "RAdio Detection And Ranging",
      "Range Awareness Detection And Reflection",
      "Radio And Distance Ranging",
      "Reflected Antenna Detection And Ranging"
    ],
    "correct": 0
  },
  {
    "question": "GIF stands for?",
    "choices": [
      "Graphics Image Format",
      "Graphical Interchange Format",
      "Graphics Interchange Format",
      "General Image Format"
    ],
    "correct": 2
  },
  {
    "question": "URL stands for?",
    "choices": [
      "Universal Resource Locator",
      "Uniform Resource Locator",
      "Unique Reference Link",
      "Unified Routing Link"
    ],
    "correct": 1
  },
  {
    "question": "HTML stands for?",
    "choices": [
      "HyperText Markup Language",
      "Home Tool Markup Language",
      "HyperType Marker Language",
      "High-Tier Markup List"
    ],
    "correct": 0
  },
  {
    "question": "RAM stands for?",
    "choices": [
      "Random Access Memory",
      "Read After Memory",
      "Rapid Active Memory",
      "Recurring Access Module"
    ],
    "correct": 0
  },
  {
    "question": "ASAP means?",
    "choices": [
      "As Slow As Possible",
      "As Soon As Possible",
      "All Systems Are Powered",
      "Attached Standard Active Process"
    ],
    "correct": 1
  },
  {
    "question": "DIY means?",
    "choices": [
      "Done In Year",
      "Do It Yourself",
      "Drive It Yourself",
      "Decided In Your"
    ],
    "correct": 1
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AcronymMiniSettings): AcronymMiniState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AcronymMiniState, action: AcronymMiniAction): AcronymMiniState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AcronymMiniState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
