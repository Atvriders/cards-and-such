import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MyHeroQuizSettings { questions: "10" | "20"; }
export interface MyHeroQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MyHeroQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The protagonist of My Hero Academia?", choices: ["Izuku Midoriya (Deku)", "Bakugo", "Todoroki", "Iida"], correct: 0 },
  { question: "Deku inherits his Quirk from?", choices: ["All Might", "Endeavor", "Eraser Head", "Nighteye"], correct: 0 },
  { question: "All Might's Quirk is called?", choices: ["One For All", "All For One", "Plus Ultra", "Detroit Smash"], correct: 0 },
  { question: "The main antagonist is?", choices: ["Tomura Shigaraki", "Stain", "Overhaul", "Endeavor"], correct: 0 },
  { question: "Bakugo's Quirk is?", choices: ["Explosion", "Fire", "Ice", "Half-Cold Half-Hot"], correct: 0 },
  { question: "Todoroki's Quirk?", choices: ["Half-Cold Half-Hot", "Fire only", "Ice only", "Air"], correct: 0 },
  { question: "Iida's Quirk allows?", choices: ["Engine legs", "Flight", "Speed bursts via wind", "Phasing"], correct: 0 },
  { question: "Ochaco's Quirk?", choices: ["Zero Gravity", "Tape", "Pop-Off", "Frog"], correct: 0 },
  { question: "Tsuyu's Quirk?", choices: ["Frog", "Animal", "Slime", "Acid"], correct: 0 },
  { question: "U.A. is the name of?", choices: ["A hero school", "A villain group", "An island", "A weapon"], correct: 0 },
  { question: "Endeavor's son is?", choices: ["Todoroki Shoto", "Bakugo", "Iida", "Sero"], correct: 0 },
  { question: "The 'Symbol of Peace' is?", choices: ["All Might", "Endeavor", "Hawks", "Mirko"], correct: 0 },
  { question: "Class 1-A homeroom teacher?", choices: ["Aizawa (Eraser Head)", "All Might", "Present Mic", "Midnight"], correct: 0 },
  { question: "Eraser Head's Quirk?", choices: ["Erases other Quirks while looking", "Cloning", "Speed", "Fire"], correct: 0 },
  { question: "Stain's vigilante belief?", choices: ["Only true heroes deserve to live", "Quirks are evil", "Money is power", "Heroes are weak"], correct: 0 },
  { question: "Series creator?", choices: ["Kohei Horikoshi", "Eiichiro Oda", "Hajime Isayama", "Tite Kubo"], correct: 0 },
  { question: "All For One is whose brother (effectively)?", choices: ["Yoichi (first OFA holder)", "All Might", "Stain", "Endeavor"], correct: 0 },
  { question: "Hero #1 after All Might retires?", choices: ["Endeavor", "Hawks", "Best Jeanist", "Mirko"], correct: 0 },
  { question: "Hawks's Quirk?", choices: ["Fierce Wings", "Speed", "Fire", "Vacuum"], correct: 0 },
  { question: "Mirio Togata's Quirk?", choices: ["Permeation", "Phantom Thief", "Flash", "Hyper Sense"], correct: 0 },
  { question: "The 'Big Three' are at?", choices: ["U.A. (third-years)", "Shiketsu", "Ketsubutsu", "Seiai"], correct: 0 },
  { question: "Kirishima's Quirk?", choices: ["Hardening", "Stickiness", "Tape", "Twin Impact"], correct: 0 },
  { question: "Kaminari's Quirk?", choices: ["Electrification", "Sound", "Fire", "Tape"], correct: 0 },
  { question: "Sero's Quirk?", choices: ["Tape", "Hardening", "Cellophane Boomerang", "Electric"], correct: 0 },
  { question: "Toga's Quirk?", choices: ["Transform (via blood)", "Decay", "Warp", "Dark Shadow"], correct: 0 },
  { question: "Tokoyami's Quirk?", choices: ["Dark Shadow", "Bird control", "Night vision", "Crow caw"], correct: 0 },
  { question: "Dabi's true family connection?", choices: ["Todoroki (eldest son Toya)", "Bakugo", "Aizawa", "All Might"], correct: 0 },
  { question: "Overhaul's Quirk?", choices: ["Overhaul (disassemble/reassemble)", "Decay", "Warp", "Tape"], correct: 0 },
  { question: "Recovery Girl is?", choices: ["U.A.'s nurse", "Class 1-A teacher", "Pro hero in field", "Villain"], correct: 0 },
  { question: "Deku's mother's first name?", choices: ["Inko", "Mitsuki", "Rei", "Nana"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MyHeroQuizSettings): MyHeroQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MyHeroQuizState, action: MyHeroQuizAction): MyHeroQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MyHeroQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
