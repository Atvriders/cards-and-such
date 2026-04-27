import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OnepieceQuizSettings { questions: "10" | "20"; }
export interface OnepieceQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OnepieceQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Luffy's Devil Fruit is called?", choices: ["Hito Hito no Mi", "Gomu Gomu no Mi", "Mera Mera no Mi", "Ope Ope no Mi"], correct: 1 },
  { question: "The Straw Hat ship after Going Merry is?", choices: ["Red Force", "Thousand Sunny", "Moby Dick", "Oro Jackson"], correct: 1 },
  { question: "Zoro's signature sword style uses?", choices: ["1 sword", "2 swords", "3 swords", "4 swords"], correct: 2 },
  { question: "Sanji is the crew's?", choices: ["Doctor", "Cook", "Navigator", "Sniper"], correct: 1 },
  { question: "Nami specializes in?", choices: ["Fighting", "Navigation", "Cooking", "Surgery"], correct: 1 },
  { question: "Usopp is a famous?", choices: ["Cook", "Doctor", "Sniper and Liar", "Helmsman"], correct: 2 },
  { question: "Chopper is a?", choices: ["Reindeer", "Bear", "Rabbit", "Tanuki"], correct: 0 },
  { question: "Robin's Devil Fruit lets her sprout?", choices: ["Wings", "Limbs", "Fire", "Ice"], correct: 1 },
  { question: "Franky is a?", choices: ["Cyborg", "Fishman", "Skeleton", "Giant"], correct: 0 },
  { question: "Brook came back from the dead via?", choices: ["Ope Ope no Mi", "Yomi Yomi no Mi", "Hito Hito no Mi", "Suke Suke no Mi"], correct: 1 },
  { question: "Whitebeard's real name?", choices: ["Edward Newgate", "Gol D. Roger", "Shanks", "Marshall D. Teach"], correct: 0 },
  { question: "The previous Pirate King was?", choices: ["Whitebeard", "Gol D. Roger", "Shanks", "Kaido"], correct: 1 },
  { question: "Shanks gave Luffy his?", choices: ["Sword", "Hat", "Compass", "Vivre Card"], correct: 1 },
  { question: "Ace's full name is?", choices: ["Portgas D. Ace", "Monkey D. Ace", "Gol D. Ace", "Trafalgar Ace"], correct: 0 },
  { question: "Sabo is a member of the?", choices: ["Marines", "World Government", "Revolutionary Army", "Yonko"], correct: 2 },
  { question: "Trafalgar Law's Devil Fruit?", choices: ["Mero Mero", "Ope Ope", "Goro Goro", "Yami Yami"], correct: 1 },
  { question: "Boa Hancock is from?", choices: ["Amazon Lily", "Skypiea", "Wano", "Dressrosa"], correct: 0 },
  { question: "The four Yonko (start of New World) include?", choices: ["Whitebeard, Kaido, Big Mom, Shanks", "Garp, Sengoku, Akainu, Aokiji", "Mihawk, Crocodile, Hancock, Doflamingo", "Buggy, Krieg, Arlong, Crocus"], correct: 0 },
  { question: "The Marines' base of power?", choices: ["Mariejois", "Marineford", "Enies Lobby", "Impel Down"], correct: 1 },
  { question: "Impel Down is a?", choices: ["Marine HQ", "Prison", "Pirate hideout", "Floating town"], correct: 1 },
  { question: "The Grand Line splits at the?", choices: ["Reverse Mountain", "Red Line", "Calm Belt", "Florian Triangle"], correct: 1 },
  { question: "Skypiea is reached via?", choices: ["Knock Up Stream", "Sea King", "Eternal Pose", "Devil Fruit"], correct: 0 },
  { question: "Buggy's Devil Fruit makes him?", choices: ["Stretch", "Split", "Burn", "Phase"], correct: 1 },
  { question: "Roronoa Zoro's dream is to be?", choices: ["King of the Pirates", "World's greatest swordsman", "Marine Admiral", "Best chef"], correct: 1 },
  { question: "Wano Country is a homage to?", choices: ["Feudal Japan", "Egypt", "Greece", "England"], correct: 0 },
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
