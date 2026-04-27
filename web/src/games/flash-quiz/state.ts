import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FlashQuizSettings { questions: "10" | "20"; }
export interface FlashQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FlashQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Flash's most famous identity?", choices: ["Barry Allen", "Wally West", "Jay Garrick", "Bart Allen"], correct: 0 },
  { question: "Flash's home city?", choices: ["Central City", "Coast City", "Star City", "Gotham"], correct: 0 },
  { question: "Source of Flash's power?", choices: ["Speed Force", "Yellow sun", "Power Ring", "Magic"], correct: 0 },
  { question: "Flash's wife?", choices: ["Iris West", "Lois Lane", "Linda Park", "Wally's wife"], correct: 0 },
  { question: "First Flash (Golden Age)?", choices: ["Jay Garrick", "Barry Allen", "Wally West", "Bart Allen"], correct: 0 },
  { question: "Wally West was originally?", choices: ["Kid Flash", "Reverse-Flash", "Zoom", "Impulse"], correct: 0 },
  { question: "Bart Allen's hero name (originally)?", choices: ["Impulse", "Flash", "Speed", "Quicksilver"], correct: 0 },
  { question: "Reverse-Flash's name (Eobard)?", choices: ["Eobard Thawne", "Hunter Zolomon", "Daniel West", "Edward Clariss"], correct: 0 },
  { question: "Captain Cold's real name?", choices: ["Leonard Snart", "Mick Rory", "Sam Scudder", "James Jesse"], correct: 0 },
  { question: "Heat Wave's real name?", choices: ["Mick Rory", "Leonard Snart", "Mark Mardon", "Roscoe Dillon"], correct: 0 },
  { question: "Mirror Master's name?", choices: ["Sam Scudder", "Evan McCulloch", "Both", "Either"], correct: 2 },
  { question: "Trickster's real name?", choices: ["James Jesse", "Axel Walker", "Both", "Either"], correct: 2 },
  { question: "Weather Wizard's name?", choices: ["Mark Mardon", "Mark Sloan", "Mark Hamill", "Mark Twain"], correct: 0 },
  { question: "Flashpoint event was caused by?", choices: ["Barry's time travel", "Reverse-Flash war", "Cosmic Treadmill", "All of these contribute"], correct: 0 },
  { question: "Crisis on Infinite Earths killed?", choices: ["Barry Allen (Pre-Crisis)", "Wally West", "Jay Garrick", "Iris West"], correct: 0 },
  { question: "Wally West replaced Barry as Flash in?", choices: ["1985", "1995", "2005", "2015"], correct: 0 },
  { question: "Speed Force was created (concept) by?", choices: ["Mark Waid", "Stan Lee", "Geoff Johns", "Grant Morrison"], correct: 0 },
  { question: "Cosmic Treadmill is used for?", choices: ["Time travel", "Power-up", "Healing", "Detection"], correct: 0 },
  { question: "Zoom (Hunter Zolomon)'s gimmick?", choices: ["Slow time around himself", "Heat", "Cold", "Lasers"], correct: 0 },
  { question: "Captain Boomerang's nationality?", choices: ["Australian", "British", "American", "Canadian"], correct: 0 },
  { question: "Iris's nephew Wally has hair color?", choices: ["Red", "Blonde", "Brown", "Black"], correct: 0 },
  { question: "Daughter Dawn Allen exists in?", choices: ["Future", "Past", "Mirror world", "Dreams"], correct: 0 },
  { question: "Flash's costume color base?", choices: ["Red", "Blue", "Yellow", "Green"], correct: 0 },
  { question: "Flash first appeared in?", choices: ["Flash Comics #1", "Showcase #4", "Action Comics #1", "Detective Comics #27"], correct: 0 },
  { question: "Barry's day job?", choices: ["Forensic scientist (CCPD)", "Reporter", "Lawyer", "Doctor"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FlashQuizSettings): FlashQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FlashQuizState, action: FlashQuizAction): FlashQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FlashQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
