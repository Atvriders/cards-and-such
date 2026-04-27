import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SonicSettings { questions: "10" | "20" | "30"; }
export interface SonicState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SonicAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Sonic is a?", choices: ["Hedgehog","Squirrel","Mouse","Fox"], correct: 0 },
  { question: "Sonic's color?", choices: ["Blue","Red","Green","Yellow"], correct: 0 },
  { question: "Main villain?", choices: ["Dr. Eggman / Robotnik","Shadow","Bowser","Wario"], correct: 0 },
  { question: "Tails has how many tails?", choices: ["2","1","3","4"], correct: 0 },
  { question: "Tails is a?", choices: ["Fox","Cat","Dog","Bird"], correct: 0 },
  { question: "Sonic debuted in?", choices: ["1991","1989","1993","1995"], correct: 0 },
  { question: "First console?", choices: ["Sega Genesis","Master System","Game Gear","Saturn"], correct: 0 },
  { question: "Knuckles is a?", choices: ["Echidna","Hedgehog","Bat","Cat"], correct: 0 },
  { question: "Knuckles guards?", choices: ["Master Emerald","Triforce","Star","Ring"], correct: 0 },
  { question: "Amy Rose's hammer?", choices: ["Piko Piko Hammer","Mallet","Bat","Stick"], correct: 0 },
  { question: "Sonic's running speed?", choices: ["Sound speed","Walking","Slow","Light"], correct: 0 },
  { question: "Chaos Emeralds count?", choices: ["7","5","9","10"], correct: 0 },
  { question: "Super Sonic activated by?", choices: ["7 Chaos Emeralds","Master Emerald","1 Emerald","Magic"], correct: 0 },
  { question: "Eggman's first name?", choices: ["Ivo","Carl","Hans","Robert"], correct: 0 },
  { question: "Sonic Adventure console?", choices: ["Dreamcast","Genesis","Saturn","Wii"], correct: 0 },
  { question: "Shadow the Hedgehog color?", choices: ["Black","Blue","Red","White"], correct: 0 },
  { question: "Big the Cat fishes for?", choices: ["Froggy (frog)","Fish","Trout","Marlin"], correct: 0 },
  { question: "Cream is a?", choices: ["Rabbit","Cat","Bear","Squirrel"], correct: 0 },
  { question: "Sonic Mania released in?", choices: ["2017","2015","2019","2020"], correct: 0 },
  { question: "Sonic 2 features?", choices: ["Tails","Knuckles","Amy","Shadow"], correct: 0 },
  { question: "Sonic 3 features?", choices: ["Knuckles","Tails","Amy","Shadow"], correct: 0 },
  { question: "Sonic Team studio in?", choices: ["Japan","USA","UK","France"], correct: 0 },
  { question: "Movie Sonic released in?", choices: ["2020","2018","2022","2024"], correct: 0 },
  { question: "Sonic voiced in films?", choices: ["Ben Schwartz","Roger Craig Smith","Both","Jaleel"], correct: 0 },
  { question: "Sonic's home planet?", choices: ["Mobius / Earth","Mars","Saturn","Venus"], correct: 0 },
  { question: "Loops are a Sonic stage?", choices: ["Yes","No","Sometimes","Once"], correct: 0 },
  { question: "Green Hill Zone is in?", choices: ["Sonic 1","Sonic 2","Sonic 3","Mania"], correct: 0 },
  { question: "Metal Sonic created by?", choices: ["Eggman","Tails","Knuckles","Shadow"], correct: 0 },
  { question: "Sonic Heroes game year?", choices: ["2003","2001","2005","2008"], correct: 0 },
  { question: "Rouge is a?", choices: ["Bat","Cat","Hedgehog","Fox"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SonicSettings): SonicState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SonicState, action: SonicAction): SonicState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SonicState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
