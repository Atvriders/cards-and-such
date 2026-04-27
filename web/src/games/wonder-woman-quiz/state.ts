import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WonderWomanQuizSettings { questions: "10" | "20"; }
export interface WonderWomanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WonderWomanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Wonder Woman's true name?", choices: ["Diana", "Hippolyta", "Donna", "Cassie"], correct: 0 },
  { question: "Wonder Woman's mother?", choices: ["Hippolyta", "Hera", "Athena", "Artemis"], correct: 0 },
  { question: "Wonder Woman's homeland?", choices: ["Themyscira", "Olympus", "Atlantis", "Asgard"], correct: 0 },
  { question: "Diana's people are the?", choices: ["Amazons", "Kryptonians", "Atlanteans", "Asgardians"], correct: 0 },
  { question: "Diana's American alias?", choices: ["Diana Prince", "Diana Smith", "Diana Trevor", "Diana Wayne"], correct: 0 },
  { question: "First man Diana met?", choices: ["Steve Trevor", "Bruce Wayne", "Hal Jordan", "Barry Allen"], correct: 0 },
  { question: "Lasso of Truth compels?", choices: ["Truth-telling", "Obedience", "Memory loss", "Sleep"], correct: 0 },
  { question: "Bracelets deflect?", choices: ["Bullets", "Magic only", "Lightning only", "Nothing"], correct: 0 },
  { question: "Diana's invisible vehicle?", choices: ["Jet", "Boat", "Submarine", "Bike"], correct: 0 },
  { question: "Cheetah's real name?", choices: ["Barbara Ann Minerva", "Diana Prince", "Donna Troy", "Cassandra Sandsmark"], correct: 0 },
  { question: "Ares is god of?", choices: ["War", "Sea", "Underworld", "Sun"], correct: 0 },
  { question: "Themyscira is on?", choices: ["Paradise Island", "Mount Olympus", "Atlantis", "Asgard"], correct: 0 },
  { question: "Donna Troy is?", choices: ["Wonder Girl/Diana's sister", "Cousin", "Aunt", "Mother"], correct: 0 },
  { question: "Cassie Sandsmark hero name?", choices: ["Wonder Girl", "Wonder Maiden", "Amazon Lady", "Demi-Hero"], correct: 0 },
  { question: "Wonder Woman first appeared in?", choices: ["All Star Comics #8", "Sensation Comics #1", "Wonder Woman #1", "Action Comics #1"], correct: 0 },
  { question: "Wonder Woman year first appeared?", choices: ["1941", "1939", "1945", "1950"], correct: 0 },
  { question: "Creator?", choices: ["William Moulton Marston", "Stan Lee", "Bob Kane", "Jack Kirby"], correct: 0 },
  { question: "Diana's father (modern)?", choices: ["Zeus", "Ares", "Hades", "Poseidon"], correct: 0 },
  { question: "Hera, in Olympus, is goddess of?", choices: ["Marriage", "Wisdom", "Hunting", "Love"], correct: 0 },
  { question: "Justice League founder along with Bats and Supes?", choices: ["Wonder Woman", "Cyborg", "Aquaman", "Flash"], correct: 0 },
  { question: "Hippolyta wields a?", choices: ["Sword/Shield", "Bow", "Trident", "Hammer"], correct: 0 },
  { question: "Circe in mythology turns men into?", choices: ["Pigs", "Wolves", "Stones", "Birds"], correct: 0 },
  { question: "Doctor Psycho is a?", choices: ["Telepathic dwarf villain", "Therapist hero", "Brilliant scientist", "Cult leader"], correct: 0 },
  { question: "Wonder Woman's strength derives from?", choices: ["Athena/Greek gods", "Kryptonian", "Mutation", "Tech"], correct: 0 },
  { question: "Amazon island is hidden via?", choices: ["Magic veil", "Cloaking tech", "Underwater", "Underground"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WonderWomanQuizSettings): WonderWomanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WonderWomanQuizState, action: WonderWomanQuizAction): WonderWomanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WonderWomanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
