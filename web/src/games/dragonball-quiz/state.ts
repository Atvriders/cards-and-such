import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DragonballQuizSettings { questions: "10" | "20"; }
export interface DragonballQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DragonballQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Goku's race is called?", choices: ["Saiyan", "Namekian", "Frieza Race", "Majin"], correct: 0 },
  { question: "Vegeta's home planet was destroyed by?", choices: ["Cell", "Frieza", "Buu", "Beerus"], correct: 1 },
  { question: "Piccolo is from which planet?", choices: ["Earth", "Vegeta", "Namek", "Saiya"], correct: 2 },
  { question: "Goku's first son is named?", choices: ["Goten", "Gohan", "Trunks", "Pan"], correct: 1 },
  { question: "The Dragon Balls grant how many wishes (originally Earth)?", choices: ["1", "2", "3", "5"], correct: 0 },
  { question: "Master Roshi taught Goku at the?", choices: ["Crane School", "Turtle School", "Demon School", "Capsule Corp"], correct: 1 },
  { question: "Bulma's family runs?", choices: ["Capsule Corp", "Red Ribbon", "Saiyan Force", "Pilaf Castle"], correct: 0 },
  { question: "Cell achieved his Perfect Form by absorbing?", choices: ["17 and 18", "16", "Frieza", "Trunks"], correct: 0 },
  { question: "Majin Buu was created by?", choices: ["Babidi", "Bibidi", "Dabura", "Frieza"], correct: 1 },
  { question: "The Super Saiyan transformation makes hair turn?", choices: ["Blue", "Red", "Gold", "Silver"], correct: 2 },
  { question: "Beerus is the God of?", choices: ["Creation", "Destruction", "Time", "Wishes"], correct: 1 },
  { question: "Whis is Beerus's?", choices: ["Father", "Brother", "Attendant", "Rival"], correct: 2 },
  { question: "Trunks's father is?", choices: ["Goku", "Vegeta", "Yamcha", "Tien"], correct: 1 },
  { question: "Frieza's final form has him appearing?", choices: ["Bulky purple", "Sleek white and purple", "Red", "Black"], correct: 1 },
  { question: "Krillin is famous for losing his?", choices: ["Hair", "Nose", "Voice", "Tail"], correct: 1 },
  { question: "Goku trained with King Kai for?", choices: ["Punching", "Spirit Bomb", "Kamehameha", "Final Flash"], correct: 1 },
  { question: "Vegeta's signature attack?", choices: ["Galick Gun", "Spirit Bomb", "Kamehameha", "Special Beam Cannon"], correct: 0 },
  { question: "Piccolo's signature beam attack?", choices: ["Kamehameha", "Special Beam Cannon", "Final Flash", "Solar Flare"], correct: 1 },
  { question: "Tien has how many eyes?", choices: ["2", "3", "4", "1"], correct: 1 },
  { question: "Chi-Chi is Goku's?", choices: ["Sister", "Daughter", "Wife", "Mother"], correct: 2 },
  { question: "Yamcha's signature move involves?", choices: ["Wolves", "Bears", "Tigers", "Birds"], correct: 0 },
  { question: "Saiyan tails grant power under?", choices: ["Sun", "Stars", "Full moon", "Solar eclipse"], correct: 2 },
  { question: "Mr. Satan (Hercule) is famous as the?", choices: ["World's strongest", "World's smartest", "World's coolest", "Saiyan king"], correct: 0 },
  { question: "Dragon Ball Super introduced which form?", choices: ["Super Saiyan 4", "Super Saiyan Blue", "Super Saiyan 3", "Mystic"], correct: 1 },
  { question: "The Tournament of Power was held in?", choices: ["Universe 7", "World of Void", "Earth", "Otherworld"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DragonballQuizSettings): DragonballQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DragonballQuizState, action: DragonballQuizAction): DragonballQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DragonballQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
