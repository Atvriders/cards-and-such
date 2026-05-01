import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AttackTitanQuizSettings { questions: "10" | "20"; }
export interface AttackTitanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AttackTitanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Eren's signature Titan is the?", choices: ["Colossal Titan", "Armored Titan", "Attack Titan", "Female Titan"], correct: 2 },
  { question: "The first wall to be breached was?", choices: ["Wall Rose", "Wall Maria", "Wall Sina", "Wall Trost"], correct: 1 },
  { question: "Mikasa's last name is?", choices: ["Yeager", "Ackerman", "Arlert", "Kirstein"], correct: 1 },
  { question: "Levi's rank in the Survey Corps?", choices: ["Commander", "Captain", "Section Commander", "Cadet"], correct: 1 },
  { question: "Who is the Colossal Titan in season 1?", choices: ["Reiner", "Bertholdt", "Annie", "Zeke"], correct: 1 },
  { question: "Who is revealed to be the Armored Titan?", choices: ["Reiner", "Bertholdt", "Annie", "Marco"], correct: 0 },
  { question: "The Female Titan's true identity?", choices: ["Annie Leonhart", "Mikasa", "Sasha", "Hange"], correct: 0 },
  { question: "Eren's mother was killed by which Titan?", choices: ["Smiling Titan", "Beast Titan", "Colossal Titan", "Armored Titan"], correct: 0 },
  { question: "Sasha is famous for loving?", choices: ["Bread and potatoes", "Meat", "Cheese", "Apples"], correct: 0 },
  { question: "The 104th Cadet Corps top student was?", choices: ["Mikasa", "Eren", "Armin", "Reiner"], correct: 0 },
  { question: "Erwin Smith leads which corps?", choices: ["Survey Corps", "Garrison", "Military Police", "Training Corps"], correct: 0 },
  { question: "ODM gear stands for?", choices: ["Omni-Directional Mobility", "Over-Defense Maneuver", "Outer Defense Mech", "Outpost Defense Mode"], correct: 0 },
  { question: "Where do Survey Corps members originate as nation?", choices: ["Marley", "Paradis", "Hizuru", "Mid East"], correct: 1 },
  { question: "Who possesses the Beast Titan?", choices: ["Zeke", "Reiner", "Eren", "Pieck"], correct: 0 },
  { question: "Zeke is Eren's?", choices: ["Friend", "Half-brother", "Father", "Cousin"], correct: 1 },
  { question: "The Founding Titan's power resided in?", choices: ["The royal family", "Marleyan generals", "The Reiss family", "The Ackermans"], correct: 2 },
  { question: "Krista's true name is?", choices: ["Historia Reiss", "Mina Carolina", "Petra Ral", "Frieda"], correct: 0 },
  { question: "Who created the walls?", choices: ["Marley", "Karl Fritz", "Eren", "Paradis Council"], correct: 1 },
  { question: "What is the substance fueling ODM gear?", choices: ["Iceburst stone gas", "Steam", "Coal", "Aether"], correct: 0 },
  { question: "Hange's title is?", choices: ["Commander", "Section Commander", "Captain", "Marshal"], correct: 1 },
  { question: "The 'Rumbling' refers to?", choices: ["Wall Titans marching", "Earthquake jutsu", "Cannon fire", "An anthem"], correct: 0 },
  { question: "Pieck inherits which Titan?", choices: ["Cart Titan", "Jaw Titan", "War Hammer Titan", "Beast Titan"], correct: 0 },
  { question: "The War Hammer Titan first appeared with which family?", choices: ["Tybur", "Reiss", "Ackerman", "Galliard"], correct: 0 },
  { question: "How many Nine Titans exist?", choices: ["7", "8", "9", "10"], correct: 2 },
  { question: "Marco Bott's death was caused by?", choices: ["Bertholdt and Reiner", "Annie", "Eren", "A regular Titan attack"], correct: 0 },
  { question: "Who killed Erwin Smith (effectively)?", choices: ["The Beast Titan throwing rocks", "Reiner", "Annie", "A Pure Titan"], correct: 0 },
  { question: "Ymir Fritz is considered?", choices: ["The First Titan", "A Marleyan general", "Eren's mother", "A queen of Hizuru"], correct: 0 },
  { question: "Connie's hometown turned into?", choices: ["A Titan village", "A fortress", "A library", "Marley's outpost"], correct: 0 },
  { question: "Who eats Eren's father (Grisha)?", choices: ["Eren", "Zeke", "Reiner", "Frieda"], correct: 0 },
  { question: "The series creator is?", choices: ["Hajime Isayama", "Eiichiro Oda", "Masashi Kishimoto", "Tite Kubo"], correct: 0 },
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
