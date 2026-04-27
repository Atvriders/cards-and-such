import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GreenLanternQuizSettings { questions: "10" | "20"; }
export interface GreenLanternQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GreenLanternQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Hal Jordan's day job?", choices: ["Test pilot", "Architect", "Marine", "Cop"], correct: 0 },
  { question: "Green Lantern's home base planet?", choices: ["Oa", "Krypton", "Mars", "Earth"], correct: 0 },
  { question: "Power ring weakness (Silver Age)?", choices: ["Yellow", "Wood", "Blue", "Red"], correct: 0 },
  { question: "Sinestro is from which planet?", choices: ["Korugar", "Oa", "Earth", "Tamaran"], correct: 0 },
  { question: "John Stewart's profession?", choices: ["Architect/Marine", "Pilot", "Doctor", "Scientist"], correct: 0 },
  { question: "Kyle Rayner's profession?", choices: ["Artist", "Lawyer", "Pilot", "Cop"], correct: 0 },
  { question: "Guy Gardner's personality?", choices: ["Brash", "Quiet", "Wise", "Shy"], correct: 0 },
  { question: "Power ring runs on?", choices: ["Willpower", "Fear", "Love", "Anger"], correct: 0 },
  { question: "Yellow Lantern Corps emotion?", choices: ["Fear", "Rage", "Hope", "Love"], correct: 0 },
  { question: "Red Lantern emotion?", choices: ["Rage", "Fear", "Greed", "Compassion"], correct: 0 },
  { question: "Orange Lantern emotion?", choices: ["Greed", "Hope", "Compassion", "Rage"], correct: 0 },
  { question: "Blue Lantern emotion?", choices: ["Hope", "Joy", "Trust", "Love"], correct: 0 },
  { question: "Indigo Lantern emotion?", choices: ["Compassion", "Trust", "Hope", "Greed"], correct: 0 },
  { question: "Violet Lantern emotion?", choices: ["Love", "Lust", "Joy", "Compassion"], correct: 0 },
  { question: "Black Lantern Corps powered by?", choices: ["Death", "Life", "Anti-life", "Rebirth"], correct: 0 },
  { question: "White Lantern Corps?", choices: ["Life", "Pure Light", "Hope", "Will"], correct: 0 },
  { question: "Guardians of Universe live on?", choices: ["Oa", "Maltus", "Krypton", "Earth"], correct: 0 },
  { question: "Number of standard sectors?", choices: ["3600", "1000", "5000", "1200"], correct: 0 },
  { question: "Hal Jordan was nemesis of?", choices: ["Sinestro", "Krona", "Both", "Larfleeze"], correct: 2 },
  { question: "Green Lantern oath ends with?", choices: ["My power Green Lantern's light", "By my will", "All life is one", "I am the truth"], correct: 0 },
  { question: "Larfleeze is sole keeper of?", choices: ["Orange Light", "Yellow Light", "Hope", "Life"], correct: 0 },
  { question: "First Green Lantern (Golden Age)?", choices: ["Alan Scott", "Hal Jordan", "John Stewart", "Guy Gardner"], correct: 0 },
  { question: "Killowog's species?", choices: ["Bolovaxian", "Tamaranean", "Kryptonian", "Saturnian"], correct: 0 },
  { question: "Power ring needs charging via?", choices: ["Lantern battery", "Sun", "Stars", "Will alone"], correct: 0 },
  { question: "Mogo is a?", choices: ["Sentient planet GL", "Ship", "Robot", "Plant being"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GreenLanternQuizSettings): GreenLanternQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GreenLanternQuizState, action: GreenLanternQuizAction): GreenLanternQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GreenLanternQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
