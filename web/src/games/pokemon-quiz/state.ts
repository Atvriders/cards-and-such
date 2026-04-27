import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PokemonSettings { questions: "10" | "20" | "30"; }
export interface PokemonState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PokemonAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Pokemon Red/Blue starter pikachu?", choices: ["No (Yellow)","Yes","Maybe","Sometimes"], correct: 0 },
  { question: "Pokemon original 151 ends with?", choices: ["Mew","Mewtwo","Dragonite","Pikachu"], correct: 0 },
  { question: "Pikachu is what type?", choices: ["Electric","Fire","Water","Psychic"], correct: 0 },
  { question: "Charmander evolves into?", choices: ["Charmeleon","Charizard","Chimchar","Cyndaquil"], correct: 0 },
  { question: "Bulbasaur is what type?", choices: ["Grass/Poison","Grass","Poison","Bug"], correct: 0 },
  { question: "Squirtle is what type?", choices: ["Water","Ice","Water/Fire","Steel"], correct: 0 },
  { question: "First gym leader (Kanto)?", choices: ["Brock","Misty","Lt Surge","Erika"], correct: 0 },
  { question: "Brock specializes in?", choices: ["Rock","Water","Grass","Fire"], correct: 0 },
  { question: "Misty specializes in?", choices: ["Water","Rock","Grass","Electric"], correct: 0 },
  { question: "Pokemon Master goal in anime?", choices: ["Become Pokemon Master","Save world","Win college","Defeat Pikachu"], correct: 0 },
  { question: "Ash's main partner?", choices: ["Pikachu","Charizard","Bulbasaur","Squirtle"], correct: 0 },
  { question: "Team Rocket motto starts?", choices: ["Prepare for trouble!","Hi","Yo","What"], correct: 0 },
  { question: "Eevee evolutions count (Gen 8)?", choices: ["8","5","3","10"], correct: 0 },
  { question: "Mewtwo created by?", choices: ["Cloning Mew","Magic","Born","Trade"], correct: 0 },
  { question: "Master Ball catches?", choices: ["Anything","Legendaries only","Common only","Rare only"], correct: 0 },
  { question: "Pokemon Gold/Silver region?", choices: ["Johto","Kanto","Hoenn","Sinnoh"], correct: 0 },
  { question: "Hoenn is which gen?", choices: ["3","2","4","5"], correct: 0 },
  { question: "Sinnoh is which gen?", choices: ["4","3","5","6"], correct: 0 },
  { question: "Sword/Shield region?", choices: ["Galar","Alola","Unova","Kalos"], correct: 0 },
  { question: "Pikachu evolves from?", choices: ["Pichu","Raichu","Plusle","None"], correct: 0 },
  { question: "Raichu evolves from?", choices: ["Pikachu (Thunder Stone)","Pichu","Plusle","Pikachu (level)"], correct: 0 },
  { question: "Pokeball original creator (lore)?", choices: ["Apricorns","Magic","Kurt","Both 1 & 3"], correct: 3 },
  { question: "Cerulean City gym leader?", choices: ["Misty","Erika","Sabrina","Janine"], correct: 0 },
  { question: "Snorlax blocks?", choices: ["Routes 12/16 (Kanto)","Cities","Forest","Water"], correct: 0 },
  { question: "Magikarp evolves into?", choices: ["Gyarados","Goldeen","Pidgeot","Lapras"], correct: 0 },
  { question: "Pokemon GO release year?", choices: ["2016","2014","2018","2020"], correct: 0 },
  { question: "Mega Evolution debuted in?", choices: ["X/Y","RBY","GS","BW"], correct: 0 },
  { question: "Z-moves debuted in?", choices: ["Sun/Moon","X/Y","BW","Sword"], correct: 0 },
  { question: "Anime Ash hometown?", choices: ["Pallet Town","Viridian","Cerulean","Pewter"], correct: 0 },
  { question: "Professor Oak studies?", choices: ["Pokemon","Plants","Stars","Rocks"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PokemonSettings): PokemonState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PokemonState, action: PokemonAction): PokemonState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PokemonState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
