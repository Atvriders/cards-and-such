import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OnepieceQuizSettings { questions: "10" | "20"; }
export interface OnepieceQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OnepieceQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Luffy's pirate crew is called?", choices: ["Red Hair Pirates", "Straw Hat Pirates", "Whitebeard Pirates", "Heart Pirates"], correct: 1 },
  { question: "Luffy's ultimate goal is to become?", choices: ["The strongest swordsman", "Pirate King", "Marine Admiral", "World Noble"], correct: 1 },
  { question: "Luffy's Devil Fruit is the?", choices: ["Mera Mera no Mi", "Gomu Gomu no Mi", "Hito Hito no Mi", "Yami Yami no Mi"], correct: 1 },
  { question: "Zoro fights with how many swords?", choices: ["1", "2", "3", "4"], correct: 2 },
  { question: "Zoro's dream is to be the world's greatest?", choices: ["Pirate", "Swordsman", "Navigator", "Bounty Hunter"], correct: 1 },
  { question: "Sanji's primary fighting style is?", choices: ["Boxing", "Kicking (Black Leg)", "Sword fighting", "Sniping"], correct: 1 },
  { question: "Nami's role in the crew?", choices: ["Cook", "Doctor", "Navigator", "Sniper"], correct: 2 },
  { question: "Chopper's species (looks like)?", choices: ["Rabbit", "Reindeer", "Deer", "Tanuki"], correct: 1 },
  { question: "Robin's archaeology specialty involves reading?", choices: ["Poneglyphs", "Eternal Poses", "Vivre Cards", "Sea Charts"], correct: 0 },
  { question: "Franky's body is mostly?", choices: ["Cyborg", "Fishman", "Giant", "Skeleton"], correct: 0 },
  { question: "Brook's Devil Fruit revived him as a?", choices: ["Zombie", "Living skeleton", "Ghost", "Vampire"], correct: 1 },
  { question: "Who gave Luffy his iconic straw hat?", choices: ["Garp", "Shanks", "Roger", "Whitebeard"], correct: 1 },
  { question: "Who was the previous Pirate King?", choices: ["Whitebeard", "Gol D. Roger", "Kaido", "Big Mom"], correct: 1 },
  { question: "The treasure 'One Piece' is on which island?", choices: ["Raftel/Laugh Tale", "Skypiea", "Wano", "Drum Island"], correct: 0 },
  { question: "How many Yonko traditionally rule the New World?", choices: ["3", "4", "5", "7"], correct: 1 },
  { question: "Kaido is also known as what beast?", choices: ["Lion King", "Strongest Creature", "Sea King", "Dragon Lord"], correct: 1 },
  { question: "Which island was the Wano Country arc set in?", choices: ["Wano", "Skypiea", "Dressrosa", "Whole Cake Island"], correct: 0 },
  { question: "Ace's Devil Fruit was the?", choices: ["Mera Mera no Mi (Flame)", "Magu Magu no Mi", "Hie Hie no Mi", "Goro Goro no Mi"], correct: 0 },
  { question: "Who killed Whitebeard at Marineford?", choices: ["Akainu", "Kizaru", "Aokiji", "Blackbeard's crew"], correct: 3 },
  { question: "Blackbeard's real name is?", choices: ["Marshall D. Teach", "Edward Newgate", "Charlotte Linlin", "Trafalgar Law"], correct: 0 },
  { question: "Shanks belongs to the?", choices: ["Beast Pirates", "Red Hair Pirates", "Heart Pirates", "Whitebeard Pirates"], correct: 1 },
  { question: "Luffy's grandfather is?", choices: ["Shanks", "Garp", "Dragon", "Sengoku"], correct: 1 },
  { question: "Luffy's father is?", choices: ["Garp", "Dragon", "Roger", "Sabo"], correct: 1 },
  { question: "The 'Surgeon of Death' is?", choices: ["Trafalgar Law", "Doflamingo", "Crocodile", "Bonney"], correct: 0 },
  { question: "What sea is the Grand Line surrounded by?", choices: ["Calm Belts", "Red Line only", "Storm Sea", "World End"], correct: 0 },
  { question: "Skypiea is located in the?", choices: ["Sky", "Ocean depths", "Underground", "Desert"], correct: 0 },
  { question: "Who is captain of the Heart Pirates?", choices: ["Law", "Kid", "Hawkins", "Drake"], correct: 0 },
  { question: "Vivi is princess of which kingdom?", choices: ["Alabasta", "Dressrosa", "Drum", "Wano"], correct: 0 },
  { question: "Ace's adopted brother (besides Luffy) is?", choices: ["Sabo", "Law", "Marco", "Jinbe"], correct: 0 },
  { question: "Buggy's Devil Fruit lets him?", choices: ["Split into pieces", "Turn invisible", "Control sand", "Stretch"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OnepieceQuizSettings): OnepieceQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OnepieceQuizState, action: OnepieceQuizAction): OnepieceQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OnepieceQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
