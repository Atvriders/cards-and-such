import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AttackTitanQuizSettings { questions: "10" | "20"; }
export interface AttackTitanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AttackTitanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Eren's signature Titan is the?", choices: ["Colossal", "Armored", "Attack", "Female"], correct: 2 },
  { question: "The first wall to fall was?", choices: ["Wall Rose", "Wall Maria", "Wall Sina", "Wall Trost"], correct: 1 },
  { question: "Mikasa's last name?", choices: ["Yeager", "Ackerman", "Arlert", "Kirstein"], correct: 1 },
  { question: "Levi's rank in Survey Corps?", choices: ["Commander", "Captain", "Section Commander", "Cadet"], correct: 1 },
  { question: "The Founding Titan controls?", choices: ["Eldians", "Titans only", "Time", "All living things"], correct: 0 },
  { question: "Reiner Braun was secretly the?", choices: ["Colossal Titan", "Armored Titan", "Female Titan", "Beast Titan"], correct: 1 },
  { question: "Annie Leonhart turned into the?", choices: ["Female Titan", "Cart Titan", "Jaw Titan", "Warhammer Titan"], correct: 0 },
  { question: "The Beast Titan was held by?", choices: ["Reiner", "Bertholdt", "Zeke", "Galliard"], correct: 2 },
  { question: "Erwin Smith was the Survey Corps?", choices: ["Captain", "Commander", "Cadet", "Doctor"], correct: 1 },
  { question: "The military's mobility gear is called?", choices: ["3DM Gear", "ODM Gear", "Anti-Personnel Gear", "Wing Gear"], correct: 1 },
  { question: "Marley persecutes Eldians via?", choices: ["Internment zones", "Prison", "Banishment", "Education"], correct: 0 },
  { question: "The Rumbling involves?", choices: ["Wall Titans marching", "Beast Titan stampede", "Earthquake", "Founding rage"], correct: 0 },
  { question: "Historia's true family lineage?", choices: ["Yeager", "Reiss", "Ackerman", "Springer"], correct: 1 },
  { question: "Sasha is famous for loving?", choices: ["Bread and potatoes", "Wine", "Tea", "Apples"], correct: 0 },
  { question: "The shifter Titans number?", choices: ["Seven", "Eight", "Nine", "Ten"], correct: 2 },
  { question: "Zeke's father?", choices: ["Eren", "Grisha", "Levi", "Erwin"], correct: 1 },
  { question: "The Ackerman family is known for?", choices: ["Magic", "Combat prowess", "Politics", "Engineering"], correct: 1 },
  { question: "Hange Zoë led research on?", choices: ["Walls", "Titans", "Marley", "Ymir"], correct: 1 },
  { question: "The original Titan ancestor's name?", choices: ["Frieda", "Ymir Fritz", "Historia", "Krista"], correct: 1 },
  { question: "Bertholdt was the?", choices: ["Colossal Titan", "Armored", "Female", "Cart"], correct: 0 },
  { question: "Pieck Finger held the?", choices: ["Jaw", "Cart", "Beast", "War Hammer"], correct: 1 },
  { question: "The Yeagerists supported?", choices: ["Marley", "Erwin", "Eren's vision", "Historia"], correct: 2 },
  { question: "Survey Corps emblem is?", choices: ["Wings of Freedom", "Sword and Shield", "Lion", "Castle"], correct: 0 },
  { question: "The Walls were named after?", choices: ["Generals", "Goddesses", "Cities", "Kings"], correct: 2 },
  { question: "Eren had how many years to live (curse of Ymir)?", choices: ["8", "13", "20", "5"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AttackTitanQuizSettings): AttackTitanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AttackTitanQuizState, action: AttackTitanQuizAction): AttackTitanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AttackTitanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
