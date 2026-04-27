import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MyHeroQuizSettings { questions: "10" | "20"; }
export interface MyHeroQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MyHeroQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Deku's real name?", choices: ["Izuku Midoriya", "Katsuki Bakugo", "Shoto Todoroki", "Tenya Iida"], correct: 0 },
  { question: "Bakugo's Quirk?", choices: ["Half-cold half-hot", "Explosion", "Engine", "Hardening"], correct: 1 },
  { question: "Todoroki's Quirk?", choices: ["Half-cold half-hot", "Engine", "Explosion", "Frog"], correct: 0 },
  { question: "All Might's true name?", choices: ["Shota Aizawa", "Toshinori Yagi", "Hizashi Yamada", "Enji Todoroki"], correct: 1 },
  { question: "One For All passed to Deku from?", choices: ["Bakugo", "All Might", "Aizawa", "Endeavor"], correct: 1 },
  { question: "Aizawa's hero name?", choices: ["Eraserhead", "Mic", "Midnight", "Vlad King"], correct: 0 },
  { question: "U.A. High Class 1-A homeroom?", choices: ["Aizawa", "Mic", "All Might", "Cementoss"], correct: 0 },
  { question: "Tsuyu's Quirk?", choices: ["Frog", "Tape", "Acid", "Hardening"], correct: 0 },
  { question: "Kirishima's Quirk?", choices: ["Hardening", "Soft", "Spikes", "Stone"], correct: 0 },
  { question: "Iida's Quirk?", choices: ["Engine", "Speed", "Wind", "Tail"], correct: 0 },
  { question: "Uraraka's Quirk allows her to?", choices: ["Make things float", "Heal", "Phase", "Run fast"], correct: 0 },
  { question: "Endeavor's Quirk?", choices: ["Hellflame", "Ice", "Wind", "Tornado"], correct: 0 },
  { question: "League of Villains leader (initial)?", choices: ["Tomura Shigaraki", "All For One", "Dabi", "Toga"], correct: 0 },
  { question: "Toga's Quirk lets her?", choices: ["Transform via blood", "Fly", "Read minds", "Heal"], correct: 0 },
  { question: "Mirio Togata's hero name?", choices: ["Lemillion", "Suneater", "Nighteye", "Best Jeanist"], correct: 0 },
  { question: "The Big Three include Mirio, Tamaki, and?", choices: ["Nejire", "Mei", "Camie", "Itsuka"], correct: 0 },
  { question: "Nighteye's power?", choices: ["Foresight", "Strength", "Speed", "Healing"], correct: 0 },
  { question: "Best Jeanist's Quirk?", choices: ["Fiber Master", "Cloth", "Engine", "Wind"], correct: 0 },
  { question: "Hawks's Quirk?", choices: ["Fierce Wings", "Flight", "Wind", "Air manipulation"], correct: 0 },
  { question: "Number 1 hero (after All Might)?", choices: ["Endeavor", "Hawks", "Best Jeanist", "Edgeshot"], correct: 0 },
  { question: "Eri's Quirk?", choices: ["Rewind", "Healing", "Time stop", "Strength"], correct: 0 },
  { question: "Overhaul's Quirk?", choices: ["Disassembly", "Fire", "Strength", "Mind"], correct: 0 },
  { question: "Stain's hero killer signature?", choices: ["Blood-licking paralysis", "Fire", "Speed", "Mind control"], correct: 0 },
  { question: "Dabi's true identity?", choices: ["Touya Todoroki", "Tomura's brother", "Hawks's brother", "Random"], correct: 0 },
  { question: "Final villain (manga)?", choices: ["All For One/Shigaraki fused", "Endeavor", "Stain", "Overhaul"], correct: 0 },
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
