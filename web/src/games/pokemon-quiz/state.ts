import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PokemonSettings { questions: "10" | "20" | "30"; }
export interface PokemonState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PokemonAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the name of Ash Ketchum's most iconic Pokemon partner?", choices: ["Pikachu","Charizard","Bulbasaur","Squirtle"], correct: 0 },
  { question: "How many Pokemon were in the original Generation I Kanto Pokedex?", choices: ["151","100","251","386"], correct: 0 },
  { question: "What type is Pikachu?", choices: ["Electric","Fire","Normal","Psychic"], correct: 0 },
  { question: "Which Pokemon does Charmander evolve into first?", choices: ["Charmeleon","Charizard","Magmar","Vulpix"], correct: 0 },
  { question: "What dual type is Bulbasaur?", choices: ["Grass / Poison","Grass","Poison","Bug"], correct: 0 },
  { question: "What pure type is Squirtle?", choices: ["Water","Water / Ice","Water / Ground","Ice"], correct: 0 },
  { question: "Who is the Rock-type Gym Leader of Pewter City in Kanto?", choices: ["Brock","Misty","Lt. Surge","Erika"], correct: 0 },
  { question: "Which type does Misty of Cerulean City Gym specialize in?", choices: ["Water","Grass","Electric","Rock"], correct: 0 },
  { question: "What is the name of the criminal organization led by Giovanni in Kanto?", choices: ["Team Rocket","Team Magma","Team Aqua","Team Galactic"], correct: 0 },
  { question: "In which year did Pokemon Red and Green first launch in Japan?", choices: ["1996","1995","1998","2000"], correct: 0 },
  { question: "What handheld system did the original Pokemon Red and Blue release on?", choices: ["Game Boy","Game Boy Color","Game Boy Advance","NES"], correct: 0 },
  { question: "Which legendary Pokemon was created by cloning the DNA of Mew?", choices: ["Mewtwo","Mew","Deoxys","Genesect"], correct: 0 },
  { question: "What region is the setting of Pokemon Gold, Silver, and Crystal?", choices: ["Johto","Kanto","Hoenn","Sinnoh"], correct: 0 },
  { question: "What region does Pokemon Ruby and Sapphire take place in?", choices: ["Hoenn","Johto","Sinnoh","Unova"], correct: 0 },
  { question: "Which Pokemon games introduced the Sinnoh region?", choices: ["Diamond and Pearl","Black and White","X and Y","Sword and Shield"], correct: 0 },
  { question: "Which Generation V games are set in the Unova region?", choices: ["Black and White","Diamond and Pearl","X and Y","Sun and Moon"], correct: 0 },
  { question: "What region is featured in Pokemon X and Y, inspired by France?", choices: ["Kalos","Galar","Alola","Paldea"], correct: 0 },
  { question: "Pokemon Sun and Moon are set in which tropical region?", choices: ["Alola","Hoenn","Galar","Paldea"], correct: 0 },
  { question: "Pokemon Sword and Shield take place in which UK-inspired region?", choices: ["Galar","Kalos","Alola","Paldea"], correct: 0 },
  { question: "What region is the setting of Pokemon Scarlet and Violet?", choices: ["Paldea","Galar","Alola","Kalos"], correct: 0 },
  { question: "Which trio of legendary birds includes Articuno, Zapdos, and Moltres?", choices: ["Legendary birds of Kanto","Legendary beasts of Johto","Lake guardians","Tao trio"], correct: 0 },
  { question: "What three legendary beasts roam Johto in Gold and Silver?", choices: ["Raikou, Entei, Suicune","Articuno, Zapdos, Moltres","Regirock, Regice, Registeel","Uxie, Mesprit, Azelf"], correct: 0 },
  { question: "Which Pokemon evolves into Gyarados via leveling up?", choices: ["Magikarp","Feebas","Goldeen","Horsea"], correct: 0 },
  { question: "What is Eevee's Water-type evolution called?", choices: ["Vaporeon","Jolteon","Flareon","Glaceon"], correct: 0 },
  { question: "What is Eevee's Electric-type evolution called?", choices: ["Jolteon","Vaporeon","Flareon","Leafeon"], correct: 0 },
  { question: "Who is the cheerful red-cap protagonist of the Pokemon anime?", choices: ["Ash Ketchum","Red","Gold","Brendan"], correct: 0 },
  { question: "What is the name of Team Rocket's talking Pokemon mascot in the anime?", choices: ["Meowth","Wobbuffet","Persian","Mimikyu"], correct: 0 },
  { question: "How many badges must a trainer collect in most main Pokemon games to challenge the Elite Four?", choices: ["Eight","Six","Ten","Four"], correct: 0 },
  { question: "Who composed the iconic music for the original Pokemon Red and Blue?", choices: ["Junichi Masuda","Koji Kondo","Nobuo Uematsu","Go Ichinose"], correct: 0 },
  { question: "Who designed many of the original Pokemon and serves as art director?", choices: ["Ken Sugimori","Junichi Masuda","Satoshi Tajiri","Tsunekazu Ishihara"], correct: 0 },
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
